import { Card, Box } from "@mui/material";
import React, { useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import useUIStore from "@src/store/useCounterStore";
import ButtonClose from "@src/components/ButtonClose";
import PlayerControls from "@src/components/nodeView/PlayerControls";
import { CameraControls } from "@react-three/drei";
import { animateCameraBackFromNode } from "@src/hooks/useCameraAnimation";

import * as styles from "@src/styles/stylesNodeView";

// Definición de las propiedades que recibe el componente
type NodeViewProps = {
  controls: CameraControls; // Controles de la cámara para animaciones
};

/**
 * Componente `NodeView`
 * Este componente muestra un video de YouTube incrustado y controles personalizados para reproducirlo.
 * También permite cerrar la vista y regresar la cámara a su posición original.
 */
const NodeView: React.FC<NodeViewProps> = ({ controls }) => {
  // Obtiene los datos del nodo activo desde el estado global
  const nodeViewData = useUIStore((state) => state.nodeViewData);

  // Estado local para almacenar la instancia del reproductor de YouTube
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  // Extrae los datos del video desde el estado global
  const videoId = nodeViewData.videoid; // ID del video de YouTube
  const start = nodeViewData.start; // Tiempo de inicio del video
  const end = nodeViewData.end; // Tiempo de fin del video

  // Limpia el ID del video en caso de que sea un enlace de "shorts"
  const cleanVideoId = videoId?.replace("shorts/", "") || "";

  /**
   * Función que se ejecuta cuando el reproductor de YouTube está listo.
   * Configura el reproductor y comienza la reproducción automáticamente.
   */
  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    setPlayer(event.target); // Guarda la instancia del reproductor
    event.target.playVideo(); // Inicia la reproducción del video
  };

  /**
   * Función para cerrar la vista del nodo.
   * Regresa la cámara a su posición original y desactiva la vista del nodo.
   */
  const buttonCloseFunction = () => {
    animateCameraBackFromNode(controls); // Anima la cámara de regreso
    useUIStore.setState({ isNodeViewActive: false }); // Desactiva la vista del nodo
  };

  // Configuración de las opciones del reproductor de YouTube
  const opts = {
    playerVars: {
      start, // Tiempo de inicio del video
      ...(end && { end }), // Tiempo de fin del video (si está definido)
      autoplay: 1, // Reproducción automática
      mute: 1, // Silencia el video
      controls: 0, // Oculta los controles del reproductor
      modestbranding: 1, // Oculta parcialmente el branding de YouTube
      rel: 0, // No muestra videos relacionados al final
      loop: 1, // Repite el video
      playsinline: 1, // Reproduce en línea en dispositivos móviles
      fs: 0, // Oculta el botón de pantalla completa
      disablekb: 1, // Desactiva los atajos de teclado
      cc_load_policy: 0, // No fuerza los subtítulos
      color: "white", // Color de la barra de progreso
      hl: "es", // Idioma del reproductor (español)
    },
  };

  return (
    <Card sx={styles.containerNodeView}>
      {/* Botón para cerrar la vista del nodo */}
      <ButtonClose buttonFunction={buttonCloseFunction} />

      {/* Contenedor del reproductor de YouTube */}
      <Box sx={styles.containerYoutubeView}>
        <YouTube
          style={{ width: "100%", height: "100%" }}
          videoId={cleanVideoId} // ID del video a reproducir
          opts={opts} // Opciones del reproductor
          onReady={onPlayerReady} // Evento cuando el reproductor está listo
        />
      </Box>

      {/* Controles personalizados para el reproductor */}
      <PlayerControls
        player={player} // Instancia del reproductor
        start={parseInt(start || "0")} // Tiempo de inicio
        end={parseInt(end || "0")} // Tiempo de fin
      />
    </Card>
  );
};

export default NodeView;

/**
 * Notas sobre la configuración del reproductor de YouTube:
 * - `autoplay=1`: Reproduce automáticamente al cargar.
 * - `mute=1`: Silencia el video (requerido para autoplay en navegadores modernos).
 * - `controls=0`: Oculta los controles del reproductor.
 * - `modestbranding=1`: Oculta parcialmente el branding de YouTube.
 * - `rel=0`: No muestra videos relacionados al final (solo del mismo canal).
 * - `loop=1`: Repite el video cuando termina.
 * - `playsinline=1`: Reproduce inline en dispositivos móviles (evita pantalla completa).
 * - `fs=0`: Oculta el botón de pantalla completa.
 * - `disablekb=1`: Desactiva atajos de teclado (por ejemplo, barra espaciadora).
 * - `color=white`: Cambia el color de la barra de progreso (red o white).
 * - `hl=es`: Idioma del reproductor (en este caso, español).
 */