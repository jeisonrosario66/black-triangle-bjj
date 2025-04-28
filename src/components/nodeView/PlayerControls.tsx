import React, { useEffect, useState } from "react";
import {
  IconButton,
  Stack,
  Paper,
  Tooltip,
  LinearProgress,
  Typography,
  Box,
} from "@mui/material";
import Replay5Icon from "@mui/icons-material/Replay5";
import Forward5Icon from "@mui/icons-material/Forward5";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { YouTubePlayer } from "react-youtube";

import { PlayerControlsData } from "@src/context/exportType";

import * as style from "@src/styles/nodeView/stylesPlayerControls";

type PlayerControlsProps = {
  player: YouTubePlayer | null; // Instancia del reproductor de YouTube
  start: number;
  end: number;
  isAddNode?: boolean;
  onSendDataTimeNewNode?: (data: PlayerControlsData) => void;
};

/**
 * Componente `PlayerControls`
 * Este componente proporciona controles personalizados para un reproductor de YouTube,
 * incluyendo reproducción, pausa, avance, retroceso y una barra de progreso interactiva.
 */
const PlayerControls: React.FC<PlayerControlsProps> = ({
  player,
  start,
  end,
  isAddNode,
  onSendDataTimeNewNode,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [endTimeLocal, setEndTimeLocal] = useState<string>("");
  const [startTimeLocal, setStartTimeLocal] = useState<string>("");
  const formatTimeFull = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) parts.push(hrs.toString());
    parts.push(mins.toString().padStart(2, "0"));
    parts.push(secs.toString().padStart(2, "0"));

    return parts.join(":");
  };

  /**
   * Hook `useEffect` para actualizar el estado del reproductor y el progreso del video.
   * Se ejecuta cada 100ms mientras el reproductor está activo.
   */
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      const state = player.getPlayerState();
      const currentTime = player.getCurrentTime();

      setIsPlaying(state === 1);
      const clampedTime = Math.min(Math.max(currentTime, start), end); // Restringe el tiempo al rango [start, end]
      const duration = end - start; // Duración del fragmento
      const percent = ((clampedTime - start) / duration) * 100; // Calcula el progreso en porcentaje
      setProgress(percent);

      if (currentTime >= end) {
        player.pauseVideo();
      }
    }, 100);

    // Limpia el intervalo al desmontar el componente o cambiar dependencias
    return () => clearInterval(interval);
  }, [player, start, end]);

  /**
   * Función para avanzar o retroceder el video en una cantidad específica de segundos.
   * @param seconds - Cantidad de segundos a avanzar o retroceder.
   */
  const seekBy = (seconds: number) => {
    if (player) {
      let newTime = player.getCurrentTime() + seconds;
      if (newTime < start) newTime = start; // No permite ir antes del inicio
      if (newTime > end) newTime = end; // No permite ir más allá del final
      player.seekTo(newTime, true); // Salta al nuevo tiempo
    }
  };

  /**
   * Función para alternar entre reproducir y pausar el video.
   * Si el video está fuera del rango o al final, lo reinicia desde el inicio.
   */
  const togglePlayPause = () => {
    if (!player) return;

    const state = player.getPlayerState();
    const currentTime = player.getCurrentTime();

    // Si está en pausa y fuera del rango, reinicia desde el inicio
    if ((state !== 1 && currentTime >= end) || currentTime < start) {
      player.seekTo(start, true);
      player.playVideo();
    } else if (state === 1) {
      player.pauseVideo(); // Pausa el video si está reproduciéndose
    } else {
      player.playVideo(); // Reproduce el video si está pausado
    }
  };

  return (
    <Box sx={style.containerControls}>
      {/* Barra de progreso interactiva */}
      <Box
        sx={style.containerProgressBar}
        onClick={(e) => {
          if (!player) return;
          const rect = (
            e.currentTarget as HTMLDivElement
          ).getBoundingClientRect(); // Obtiene las dimensiones del contenedor
          const clickX = e.clientX - rect.left; // Calcula la posición del clic
          const clickPercent = clickX / rect.width; // Calcula el porcentaje del clic
          const seekTime = start + (end - start) * clickPercent; // Calcula el tiempo correspondiente
          player.seekTo(seekTime, true); // Salta al tiempo calculado
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={style.progressBar}
        />
      </Box>
      <Typography>
        {player ? formatTimeFull(player.getCurrentTime()) : "0:00"} /{" "}
        {formatTimeFull(end)}
      </Typography>

      {/* Controles del reproductor */}
      <Paper elevation={3} sx={style.containerPlayerControls}>
        <Box sx={style.gridPlayerControls(isAddNode)}>
          {/* Fila principal de botones normales */}
          <Stack direction="row" spacing={10} alignItems="center">
            {/* Botón para retroceder 5 segundos */}
            <Tooltip title="Retroceder 5s">
              <IconButton
                sx={style.iconsPlayer}
                color="primary"
                onClick={() => seekBy(-5)}
              >
                <Replay5Icon fontSize="large" />
              </IconButton>
            </Tooltip>

            {/* Botón para reproducir o pausar */}
            <Tooltip title={isPlaying ? "Pausar" : "Reproducir"}>
              <IconButton
                color="primary"
                onClick={togglePlayPause}
                sx={style.iconsPlayer}
              >
                {isPlaying ? (
                  <PauseIcon fontSize="large" />
                ) : (
                  <PlayArrowIcon fontSize="large" />
                )}
              </IconButton>
            </Tooltip>

            {/* Botón para avanzar 5 segundos */}
            <Tooltip title="Avanzar 5s">
              <IconButton
                sx={style.iconsPlayer}
                color="primary"
                onClick={() => seekBy(5)}
              >
                <Forward5Icon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Segunda fila de botones condicionales */}
          {isAddNode && (
            <Box sx={style.buttonAditional}>
              <Tooltip title="Tiempo inicio">
                <IconButton
                  sx={style.iconsPlayer}
                  color="primary"
                  onClick={() => {
                    const t = Math.floor(player.getCurrentTime()).toString();
                    setStartTimeLocal(t);
                    onSendDataTimeNewNode?.({
                      start: t,
                      videoid: player.getVideoData().video_id,
                    });
                  }}
                >
                  <Typography>
                    Inicio: {formatTimeFull(Number(startTimeLocal))}
                  </Typography>
                </IconButton>
              </Tooltip>

              <Tooltip title="Tiempo final">
                <IconButton
                  sx={style.iconsPlayer}
                  color="primary"
                  onClick={() => {
                    const t = Math.ceil(player.getCurrentTime()).toString();
                    setEndTimeLocal(t);
                    onSendDataTimeNewNode?.({ end: t });
                  }}
                >
                  <Typography>
                    Fin: {formatTimeFull(Number(endTimeLocal))}
                  </Typography>
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayerControls;
