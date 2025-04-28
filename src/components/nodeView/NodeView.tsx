import React, { useState } from "react";
import { CameraControls } from "@react-three/drei";
import { Card, Box } from "@mui/material";
import YouTube, { YouTubePlayer } from "react-youtube";
import { Control, UseFormSetValue } from "react-hook-form";

import { useUIStore } from "@src/store/index";
import { ButtonClose, PlayerControls } from "@src/components/index";
import { animateCameraBackFromNode } from "@src/hooks/index";
import { NodeFormData, PlayerControlsData } from "@src/context/exportType";

import * as styles from "@src/styles/stylesNodeView";

type NodeViewProps = {
  controls?: CameraControls;
  isAddNode: boolean;
  setValue?: UseFormSetValue<NodeFormData>;
  control?: Control<any>;
};

/**
 * Componente `NodeView`
 * Este componente muestra un video de YouTube incrustado y controles personalizados para reproducirlo.
 * También permite cerrar la vista y regresar la cámara a su posición original.
 */
const NodeView: React.FC<NodeViewProps> = ({
  controls,
  isAddNode,
  setValue,
}) => {
  // Obtiene los datos del nodo activo desde el estado global
  const nodeViewData = useUIStore((state) => state.nodeViewData);
  // Estado local para almacenar la instancia del reproductor de YouTube
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const recuperarDatosDetiempo = (data: PlayerControlsData) => {
    // Actualiza el valor en el form
    if (setValue) {
      if (data.videoid) setValue("videoid", data.videoid);
      if (data.start) setValue("start", data.start);
      if (data.end) setValue("end", data.end);
    }
  };
  const videoId = nodeViewData.videoid;
  const start = nodeViewData.start;
  const end = nodeViewData.end;

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
    if (controls) {
      animateCameraBackFromNode(controls); // Anima la cámara de regreso
    }
    useUIStore.setState({ isNodeViewActive: false }); // Desactiva la vista del nodo
  };

  // Configuración de las opciones del reproductor de YouTube
  const opts = {
    playerVars: {
      start, // Tiempo de inicio del video
      ...(end && { end }), // Tiempo de fin del video (si está definido)
      autoplay: 1, // Reproducción automática
      mute: 0, // Silencia el video
      controls: 0, // Oculta los controles del reproductor
      modestbranding: 1, // Oculta parcialmente el branding de YouTube
      rel: 0, // No muestra videos relacionados al final
      loop: 1, // Repite el video
      playsinline: 1, // Reproduce en línea en dispositivos móviles
      fs: 0, // Oculta el botón de pantalla completa
      disablekb: 1, // Desactiva los atajos de teclado
      cc_load_policy: 0, // No fuerza los subtítulos
      hl: "es", // Idioma del reproductor (español)
    },
  };

  return (
    <Card sx={styles.containerNodeView(isAddNode)}>
      <ButtonClose buttonFunction={buttonCloseFunction} />

      {/* Contenedor del reproductor de YouTube */}
      <Box sx={styles.containerYoutubeView}>
        <YouTube
          style={{ height: "100%" }}
          videoId={cleanVideoId}
          opts={opts}
          onReady={onPlayerReady}
        />
      </Box>

      {/* Controles personalizados para el reproductor */}
      <PlayerControls
        player={player} // Instancia del reproductor
        start={parseInt(start || "0")}
        end={parseInt(end || "0")}
        isAddNode={isAddNode}
        onSendDataTimeNewNode={recuperarDatosDetiempo}
      />
    </Card>
  );
};

export default NodeView;
