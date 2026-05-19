# Guia de uso `generate_hls_r2.sh`

Este documento resume como ejecutar [generate_hls_r2.sh](/home/bigdev/github/black-triangle-bjj/scripts/generate_hls_r2.sh) para generar HLS desde `R2`, de forma local y por partes.

## Objetivo

Procesar videos ubicados en:

- `black-triangle-storage/cursos_bjj`

Y producir HLS en:

- `black-triangle-storage/hls`

Manteniendo la misma estructura relativa del catalogo.

## Estrategia recomendada para este proyecto

Por el costo de red y por la lentitud de subida, el enfoque recomendado es:

1. generar localmente por lotes pequenos
2. subir despues de a poco
3. usar `PACKAGING_MODE=single_file`

Con `single_file`, por video se generan solo:

- `index.m3u8`
- `stream.ts`

Esto reduce de forma drastica el numero de objetos frente al HLS multifile.

## Modos de ejecucion

### `MODE=full`

Hace todo en una sola corrida:

1. descarga el MP4 desde `R2`
2. genera HLS
3. sube el resultado a `R2`
4. verifica que exista remoto
5. borra temporales locales del job

Uso:

```bash
MODE=full ./scripts/generate_hls_r2.sh
```

### `MODE=generate`

Solo descarga y genera HLS local.

No sube nada a `R2`.

Uso:

```bash
MODE=generate ./scripts/generate_hls_r2.sh
```

Salida local:

- `scripts/.state/hls/output`

### `MODE=upload`

Solo sube a `R2` HLS ya generado localmente.

Uso:

```bash
MODE=upload ./scripts/generate_hls_r2.sh
```

## Variables importantes

### `PACKAGING_MODE`

Opciones:

- `single_file`
- `multi_file`

Recomendado:

```bash
PACKAGING_MODE=single_file
```

### `VIDEO_ENCODER`

Opciones:

- `libx264`
- `h264_nvenc`

En local normalmente usaras:

```bash
VIDEO_ENCODER=libx264
```

### `HLS_TIME`

Duracion objetivo de cada segmento, en segundos.

Recomendado actualmente:

```bash
HLS_TIME=10
```

### `PARALLEL_JOBS`

Cuantos videos procesa en paralelo.

En local y con red/disco limitados, lo mas seguro es:

```bash
PARALLEL_JOBS=1
```

### `UPLOAD_BWLIMIT`

Limita el ancho de banda de subida de `rclone`.

Ejemplo:

```bash
UPLOAD_BWLIMIT=4M
```

### `DOWNLOAD_BWLIMIT`

Limita el ancho de banda de descarga desde `R2`.

Ejemplo:

```bash
DOWNLOAD_BWLIMIT=6M
```

### `SKIP_REMOTE_IF_PRESENT`

Si esta en `true`, el script revisa `R2` y evita reprocesar videos que ya tengan salida valida.

Con `PACKAGING_MODE=single_file`, considera valido que existan:

- `index.m3u8`
- `stream.ts`

Valor recomendado:

```bash
SKIP_REMOTE_IF_PRESENT=true
```

Esto es importante porque permite reanudar aunque pierdas `.state`.

## Ejemplos recomendados

### Generar local por partes

```bash
MODE=generate \
PACKAGING_MODE=single_file \
VIDEO_ENCODER=libx264 \
PARALLEL_JOBS=1 \
HLS_TIME=10 \
./scripts/generate_hls_r2.sh
```

### Subir despues, de a poco

```bash
MODE=upload \
PACKAGING_MODE=single_file \
PARALLEL_JOBS=1 \
UPLOAD_BWLIMIT=4M \
SKIP_REMOTE_IF_PRESENT=true \
./scripts/generate_hls_r2.sh
```

### Flujo completo local

```bash
MODE=full \
PACKAGING_MODE=single_file \
VIDEO_ENCODER=libx264 \
PARALLEL_JOBS=1 \
HLS_TIME=10 \
DOWNLOAD_BWLIMIT=6M \
UPLOAD_BWLIMIT=4M \
SKIP_REMOTE_IF_PRESENT=true \
./scripts/generate_hls_r2.sh
```

## Archivos de estado

Se guardan en:

- `scripts/.state/hls`

Principales:

- `all_files.txt`: todos los MP4 encontrados en origen
- `pending.txt`: pendientes segun el modo
- `generated.txt`: videos que ya quedaron generados localmente
- `done.txt`: videos ya subidos y verificados en `R2`
- `errors.txt`: errores registrados por etapa
- `manifest_map.tsv`: mapa entre MP4 origen y manifest HLS destino

## Reanudacion

### En `MODE=generate`

Se apoya en:

- `generated.txt`

### En `MODE=full` y `MODE=upload`

La reanudacion importante se apoya en `R2`:

- si ya existen `index.m3u8` y `stream.ts`
- el video se salta

Eso permite continuar aunque pierdas la carpeta `.state`.

## Salida esperada en `R2`

Ejemplo:

- origen:
  - `black-triangle-storage/cursos_bjj/AOJ/.../video.mp4`
- destino:
  - `black-triangle-storage/hls/AOJ/.../video/index.m3u8`
  - `black-triangle-storage/hls/AOJ/.../video/stream.ts`

## Requisitos

Necesitas disponibles:

- `rclone`
- `ffmpeg`
- `ffprobe`
- `parallel`
- `flock`

## Nota practica

Para este proyecto, el camino mas sensato es:

1. `MODE=generate`
2. revisar tamano y resultados
3. `MODE=upload`
4. poblar luego `videoHls` en Firestore usando `manifest_map.tsv`
