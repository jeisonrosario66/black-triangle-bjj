#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

#########################################################
# CONFIGURACION BASE
#########################################################

RCLONE_REMOTE="${RCLONE_REMOTE:-r2}"
SOURCE_PATH="${SOURCE_PATH:-black-triangle-storage/cursos_bjj}"
DEST_PATH="${DEST_PATH:-black-triangle-storage/hls}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${STATE_DIR:-${SCRIPT_DIR}/.state/hls}"
WORKDIR="${WORKDIR:-/tmp/black-triangle-hls}"
LOCAL_HLS_ROOT="${LOCAL_HLS_ROOT:-${STATE_DIR}/output}"
LOG_DIR="${LOG_DIR:-${STATE_DIR}/logs}"

ALL_FILES_FILE="${ALL_FILES_FILE:-${STATE_DIR}/all_files.txt}"
PENDING_FILE="${PENDING_FILE:-${STATE_DIR}/pending.txt}"
DONE_FILE="${DONE_FILE:-${STATE_DIR}/done.txt}"
GENERATED_FILE="${GENERATED_FILE:-${STATE_DIR}/generated.txt}"
ERROR_FILE="${ERROR_FILE:-${STATE_DIR}/errors.txt}"
MANIFEST_MAP_FILE="${MANIFEST_MAP_FILE:-${STATE_DIR}/manifest_map.tsv}"
MODE="${MODE:-full}"

PARALLEL_JOBS="${PARALLEL_JOBS:-2}"
HLS_TIME="${HLS_TIME:-10}"
FFMPEG_MODE="${FFMPEG_MODE:-production}"
VIDEO_ENCODER="${VIDEO_ENCODER:-libx264}"
FFMPEG_PRESET="${FFMPEG_PRESET:-veryfast}"
FFMPEG_CRF="${FFMPEG_CRF:-21}"
AUDIO_BITRATE="${AUDIO_BITRATE:-128k}"
PACKAGING_MODE="${PACKAGING_MODE:-single_file}"
NVENC_PRESET="${NVENC_PRESET:-p5}"
NVENC_CQ="${NVENC_CQ:-23}"

DOWNLOAD_BWLIMIT="${DOWNLOAD_BWLIMIT:-8M}"
UPLOAD_BWLIMIT="${UPLOAD_BWLIMIT:-8M}"
RCLONE_TRANSFERS="${RCLONE_TRANSFERS:-2}"
RCLONE_CHECKERS="${RCLONE_CHECKERS:-4}"
RCLONE_RETRIES="${RCLONE_RETRIES:-10}"
RCLONE_LOW_LEVEL_RETRIES="${RCLONE_LOW_LEVEL_RETRIES:-20}"
RCLONE_S3_UPLOAD_CONCURRENCY="${RCLONE_S3_UPLOAD_CONCURRENCY:-2}"
RCLONE_S3_CHUNK_SIZE="${RCLONE_S3_CHUNK_SIZE:-16M}"
RCLONE_S3_NO_CHECK_BUCKET="${RCLONE_S3_NO_CHECK_BUCKET:-true}"
SKIP_REMOTE_IF_PRESENT="${SKIP_REMOTE_IF_PRESENT:-true}"

mkdir -p "$STATE_DIR" "$WORKDIR" "$LOCAL_HLS_ROOT" "$LOG_DIR"
touch "$DONE_FILE" "$GENERATED_FILE" "$ERROR_FILE"

if [ ! -f "$MANIFEST_MAP_FILE" ]; then
  printf 'source_mp4\thls_manifest_key\n' > "$MANIFEST_MAP_FILE"
fi

#########################################################
# HELPERS
#########################################################

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "FALTA DEPENDENCIA: $command_name" >&2
    exit 1
  fi
}

append_line_locked() {
  local target_file="$1"
  local line="$2"

  {
    flock 200
    printf '%s\n' "$line" >> "$target_file"
  } 200>>"${target_file}.lock"
}

append_tsv_locked() {
  local target_file="$1"
  local first_value="$2"
  local second_value="$3"

  {
    flock 200
    printf '%s\t%s\n' "$first_value" "$second_value" >> "$target_file"
  } 200>>"${target_file}.lock"
}

sanitize_log_name() {
  printf '%s' "$1" | tr '/ ' '__' | tr -cd '[:alnum:]_.-'
}

normalize_storage_key() {
  local value="$1"

  value="${value#${SOURCE_PATH}/}"
  value="${value#${DEST_PATH}/}"
  value="${value#/}"

  printf '%s' "$value"
}

get_relative_stem() {
  local file_path="$1"
  printf '%s' "${file_path%.*}"
}

manifest_exists_remote() {
  local manifest_dir="$1"
  local listing

  listing="$(
    rclone lsf "${RCLONE_REMOTE}:${manifest_dir}" \
      --files-only \
      --checkers 1 \
      --transfers 1 2>/dev/null || true
  )"

  if [ "$PACKAGING_MODE" = "single_file" ]; then
    grep -qxF "index.m3u8" <<< "$listing" && grep -qxF "stream.ts" <<< "$listing"
    return
  fi

  grep -qxF "index.m3u8" <<< "$listing"
}

manifest_exists_local() {
  local manifest_dir="$1"

  if [ "$PACKAGING_MODE" = "single_file" ]; then
    [ -f "${manifest_dir}/index.m3u8" ] && [ -f "${manifest_dir}/stream.ts" ]
    return
  fi

  [ -f "${manifest_dir}/index.m3u8" ]
}

should_skip_remote() {
  if [ "$SKIP_REMOTE_IF_PRESENT" != "true" ]; then
    return 1
  fi

  return 0
}

build_rclone_common_args() {
  printf '%s\n' \
    "--retries=${RCLONE_RETRIES}" \
    "--low-level-retries=${RCLONE_LOW_LEVEL_RETRIES}" \
    "--checkers=${RCLONE_CHECKERS}" \
    "--s3-upload-concurrency=${RCLONE_S3_UPLOAD_CONCURRENCY}" \
    "--s3-chunk-size=${RCLONE_S3_CHUNK_SIZE}"

  if [ "$RCLONE_S3_NO_CHECK_BUCKET" = "true" ]; then
    printf '%s\n' "--s3-no-check-bucket"
  fi
}

calculate_gop_size() {
  local input_file="$1"
  local average_frame_rate
  local fps

  average_frame_rate="$(
    ffprobe \
      -v error \
      -select_streams v:0 \
      -show_entries stream=avg_frame_rate \
      -of default=nokey=1:noprint_wrappers=1 \
      "$input_file" 2>/dev/null || true
  )"

  fps="$(
    awk -F'/' '
      BEGIN { rate = 30 }
      NF == 2 && $2 > 0 { rate = $1 / $2 }
      NF == 1 && $1 > 0 { rate = $1 }
      END {
        if (rate < 1 || rate > 240) rate = 30
        printf "%.0f", rate
      }
    ' <<< "$average_frame_rate"
  )"

  if [ -z "$fps" ] || [ "$fps" -lt 1 ]; then
    fps=30
  fi

  printf '%s' "$(( fps * HLS_TIME ))"
}

generate_hls() {
  local input_file="$1"
  local output_dir="$2"
  local log_file="$3"
  local gop_size

  mkdir -p "$output_dir"
  gop_size="$(calculate_gop_size "$input_file")"

  local -a hls_args=(
    -hls_time "$HLS_TIME"
    -hls_list_size 0
    -hls_playlist_type vod
  )

  if [ "$PACKAGING_MODE" = "single_file" ]; then
    hls_args+=(
      -hls_flags single_file+independent_segments
      -hls_segment_filename "${output_dir}/stream.ts"
    )
  else
    hls_args+=(
      -hls_flags independent_segments
      -hls_segment_filename "${output_dir}/seg_%05d.ts"
    )
  fi

  if [ "$FFMPEG_MODE" = "fast" ]; then
    ffmpeg \
      -hide_banner \
      -y \
      -i "$input_file" \
      -map 0:v:0 \
      -map 0:a? \
      -sn \
      -dn \
      -c copy \
      -start_number 0 \
      "${hls_args[@]}" \
      "${output_dir}/index.m3u8" \
      >"$log_file" 2>&1
    return
  fi

  local -a video_args

  if [ "$VIDEO_ENCODER" = "h264_nvenc" ]; then
    video_args=(
      -c:v h264_nvenc
      -preset "$NVENC_PRESET"
      -tune hq
      -rc vbr
      -cq "$NVENC_CQ"
      -b:v 0
      -profile:v high
      -pix_fmt yuv420p
    )
  else
    video_args=(
      -c:v libx264
      -preset "$FFMPEG_PRESET"
      -crf "$FFMPEG_CRF"
      -pix_fmt yuv420p
      -profile:v high
    )
  fi

  ffmpeg \
    -hide_banner \
    -y \
    -i "$input_file" \
    -map 0:v:0 \
    -map 0:a? \
    -sn \
    -dn \
    "${video_args[@]}" \
    -movflags +faststart \
    -c:a aac \
    -b:a "$AUDIO_BITRATE" \
    -ar 48000 \
    -ac 2 \
    -g "$gop_size" \
    -keyint_min "$gop_size" \
    -sc_threshold 0 \
    -force_key_frames "expr:gte(t,n_forced*${HLS_TIME})" \
    -max_muxing_queue_size 2048 \
    -f hls \
    "${hls_args[@]}" \
    "${output_dir}/index.m3u8" \
    >"$log_file" 2>&1
}

process_video() {
  local file="$1"
  local relative_stem
  local remote_source_key
  local remote_output_dir
  local remote_manifest_key
  local safe_log_name
  local job_root
  local local_input
  local local_output
  local log_file
  local -a common_args
  local -a download_args
  local -a upload_args

  relative_stem="$(get_relative_stem "$file")"
  remote_source_key="${SOURCE_PATH}/${file}"
  remote_output_dir="${DEST_PATH}/${relative_stem}"
  remote_manifest_key="${remote_output_dir}/index.m3u8"
  safe_log_name="$(sanitize_log_name "$file")"
  job_root="${WORKDIR}/jobs/${relative_stem}"
  local_input="${job_root}/input.mp4"
  if [ "$MODE" = "full" ]; then
    local_output="${job_root}/hls"
  else
    local_output="${LOCAL_HLS_ROOT}/${relative_stem}"
  fi
  log_file="${LOG_DIR}/${safe_log_name}.log"

  mkdir -p "$job_root" "$local_output"

  cleanup_job() {
    rm -rf "$job_root"
  }

  trap cleanup_job RETURN

  if should_skip_remote && manifest_exists_remote "$remote_output_dir"; then
    append_line_locked "$DONE_FILE" "$file"
    append_line_locked "$GENERATED_FILE" "$file"
    append_tsv_locked "$MANIFEST_MAP_FILE" "$file" "$remote_manifest_key"
    echo "SKIP REMOTO EXISTENTE: $file"
    return 0
  fi

  echo "=========================================="
  echo "PROCESSING: $file"
  echo "OUTPUT: $remote_manifest_key"
  echo "=========================================="

  mapfile -t common_args < <(build_rclone_common_args)

  if [ "$MODE" != "upload" ]; then
    if manifest_exists_local "$local_output"; then
      echo "REUSING LOCAL HLS: $file"
    else
      download_args=(
        copyto
        "${RCLONE_REMOTE}:${remote_source_key}"
        "$local_input"
        "--transfers=1"
        "--bwlimit=${DOWNLOAD_BWLIMIT}"
      )
      download_args+=("${common_args[@]}")

      if ! rclone "${download_args[@]}"; then
        append_line_locked "$ERROR_FILE" "download\t${file}"
        echo "ERROR DESCARGANDO: $file" >&2
        return 0
      fi

      if ! generate_hls "$local_input" "$local_output" "$log_file"; then
        append_line_locked "$ERROR_FILE" "ffmpeg\t${file}"
        echo "ERROR FFMPEG: $file" >&2
        return 0
      fi
    fi

    if ! manifest_exists_local "$local_output"; then
      append_line_locked "$ERROR_FILE" "manifest_missing\t${file}"
      echo "ERROR MANIFEST LOCAL FALTANTE: $file" >&2
      return 0
    fi

    append_line_locked "$GENERATED_FILE" "$file"

    if [ "$MODE" = "generate" ]; then
      append_tsv_locked "$MANIFEST_MAP_FILE" "$file" "$remote_manifest_key"
      echo "GENERATED LOCAL: $file"
      return 0
    fi
  elif ! manifest_exists_local "$local_output"; then
    append_line_locked "$ERROR_FILE" "upload_missing_local\t${file}"
    echo "ERROR HLS LOCAL FALTANTE PARA SUBIR: $file" >&2
    return 0
  fi

  upload_args=(
    copy
    "$local_output"
    "${RCLONE_REMOTE}:${remote_output_dir}"
    "--transfers=${RCLONE_TRANSFERS}"
    "--bwlimit=${UPLOAD_BWLIMIT}"
    "--no-traverse"
  )
  upload_args+=("${common_args[@]}")

  if ! rclone "${upload_args[@]}"; then
    append_line_locked "$ERROR_FILE" "upload\t${file}"
    echo "ERROR SUBIENDO: $file" >&2
    return 0
  fi

  if ! manifest_exists_remote "$remote_output_dir"; then
    append_line_locked "$ERROR_FILE" "remote_verify\t${file}"
    echo "ERROR VERIFICANDO REMOTO: $file" >&2
    return 0
  fi

  append_line_locked "$DONE_FILE" "$file"
  append_line_locked "$GENERATED_FILE" "$file"
  append_tsv_locked "$MANIFEST_MAP_FILE" "$file" "$remote_manifest_key"
  echo "DONE: $file"
}

export -f build_rclone_common_args
export -f append_line_locked
export -f append_tsv_locked
export -f sanitize_log_name
export -f get_relative_stem
export -f manifest_exists_remote
export -f manifest_exists_local
export -f should_skip_remote
export -f calculate_gop_size
export -f generate_hls
export -f process_video

export RCLONE_REMOTE SOURCE_PATH DEST_PATH
export WORKDIR LOCAL_HLS_ROOT LOG_DIR DONE_FILE GENERATED_FILE ERROR_FILE MANIFEST_MAP_FILE
export MODE
export HLS_TIME FFMPEG_MODE VIDEO_ENCODER FFMPEG_PRESET FFMPEG_CRF AUDIO_BITRATE PACKAGING_MODE
export NVENC_PRESET NVENC_CQ
export DOWNLOAD_BWLIMIT UPLOAD_BWLIMIT
export RCLONE_TRANSFERS RCLONE_CHECKERS
export RCLONE_RETRIES RCLONE_LOW_LEVEL_RETRIES
export RCLONE_S3_UPLOAD_CONCURRENCY RCLONE_S3_CHUNK_SIZE
export RCLONE_S3_NO_CHECK_BUCKET
export SKIP_REMOTE_IF_PRESENT

#########################################################
# VALIDACIONES
#########################################################

require_command rclone
require_command ffmpeg
require_command ffprobe
require_command parallel
require_command flock

if [[ "$MODE" != "full" && "$MODE" != "generate" && "$MODE" != "upload" ]]; then
  echo "MODE invalido: $MODE" >&2
  echo "Usa MODE=full | MODE=generate | MODE=upload" >&2
  exit 1
fi

if [[ "$VIDEO_ENCODER" != "libx264" && "$VIDEO_ENCODER" != "h264_nvenc" ]]; then
  echo "VIDEO_ENCODER invalido: $VIDEO_ENCODER" >&2
  echo "Usa VIDEO_ENCODER=libx264 | VIDEO_ENCODER=h264_nvenc" >&2
  exit 1
fi

if [[ "$PACKAGING_MODE" != "single_file" && "$PACKAGING_MODE" != "multi_file" ]]; then
  echo "PACKAGING_MODE invalido: $PACKAGING_MODE" >&2
  echo "Usa PACKAGING_MODE=single_file | PACKAGING_MODE=multi_file" >&2
  exit 1
fi

#########################################################
# LISTA DE MP4
#########################################################

echo "LISTANDO VIDEOS..."
echo "MODE: $MODE"
echo "VIDEO_ENCODER: $VIDEO_ENCODER"
echo "PACKAGING_MODE: $PACKAGING_MODE"
echo "SKIP_REMOTE_IF_PRESENT: $SKIP_REMOTE_IF_PRESENT"
echo "RCLONE_S3_NO_CHECK_BUCKET: $RCLONE_S3_NO_CHECK_BUCKET"
echo "LOCAL_HLS_ROOT: $LOCAL_HLS_ROOT"

rclone lsf "${RCLONE_REMOTE}:${SOURCE_PATH}" \
  -R \
  --files-only \
  --include "*.mp4" \
  > "$ALL_FILES_FILE"

TOTAL="$(wc -l < "$ALL_FILES_FILE")"
echo "TOTAL MP4 ENCONTRADOS: $TOTAL"

if [ "$TOTAL" -eq 0 ]; then
  echo "NO SE ENCONTRARON VIDEOS"
  exit 1
fi

if [ "$MODE" = "generate" ] && [ -s "$GENERATED_FILE" ]; then
  grep -vxFf "$GENERATED_FILE" "$ALL_FILES_FILE" > "$PENDING_FILE" || true
else
  cp "$ALL_FILES_FILE" "$PENDING_FILE"
fi

PENDING="$(wc -l < "$PENDING_FILE")"
echo "PENDIENTES: $PENDING"

if [ "$PENDING" -eq 0 ]; then
  echo "TODO YA FUE PROCESADO"
  exit 0
fi

#########################################################
# EJECUCION
#########################################################

parallel \
  --will-cite \
  --jobs "$PARALLEL_JOBS" \
  --line-buffer \
  process_video :::: "$PENDING_FILE"

echo "=========================================="
echo "ALL COMPLETE"
echo "DONE FILE: $DONE_FILE"
echo "GENERATED FILE: $GENERATED_FILE"
echo "ERROR FILE: $ERROR_FILE"
echo "MAP FILE: $MANIFEST_MAP_FILE"
echo "=========================================="
