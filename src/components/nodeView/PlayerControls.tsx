import React, { useEffect, useState } from "react";
import {
  IconButton,
  Stack,
  Paper,
  Tooltip,
  LinearProgress,
  Box,
} from "@mui/material";
import Replay5Icon from "@mui/icons-material/Replay5";
import Forward5Icon from "@mui/icons-material/Forward5";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { YouTubePlayer } from "react-youtube";
import * as style from "@src/styles/nodeView/stylesPlayerControls";

// Definición de las propiedades que recibe el componente
type PlayerControlsProps = {
  player: YouTubePlayer | null; // Instancia del reproductor de YouTube
  start: number; // Tiempo de inicio del video
  end: number; // Tiempo de fin del video
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
}) => {
  // Estado para determinar si el video está reproduciéndose
  const [isPlaying, setIsPlaying] = useState(false);

  // Estado para el progreso del video en porcentaje
  const [progress, setProgress] = useState(0);

  /**
   * Hook `useEffect` para actualizar el estado del reproductor y el progreso del video.
   * Se ejecuta cada 100ms mientras el reproductor está activo.
   */
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      const state = player.getPlayerState(); // Obtiene el estado del reproductor
      const currentTime = player.getCurrentTime(); // Obtiene el tiempo actual del video

      setIsPlaying(state === 1); // 1 indica que el video está reproduciéndose
      const clampedTime = Math.min(Math.max(currentTime, start), end); // Restringe el tiempo al rango [start, end]
      const duration = end - start; // Duración del fragmento
      const percent = ((clampedTime - start) / duration) * 100; // Calcula el progreso en porcentaje
      setProgress(percent);

      // Pausa el video si alcanza el final del fragmento
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
          value={progress} // Progreso actual del video
          sx={style.progressBar}
        />
      </Box>

      {/* Controles del reproductor */}
      <Paper elevation={3} sx={style.containerPlayerControls}>
        <Stack direction="row" spacing={10} alignItems="center">
          {/* Botón para retroceder 1 segundo */}
          <Tooltip title="Retroceder 1s">
            <IconButton
              sx={style.iconsPlayer}
              color="primary"
              onClick={() => seekBy(-1)}
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

          {/* Botón para avanzar 1 segundo */}
          <Tooltip title="Avanzar 1s">
            <IconButton
              sx={style.iconsPlayer}
              color="primary"
              onClick={() => seekBy(1)}
            >
              <Forward5Icon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PlayerControls;