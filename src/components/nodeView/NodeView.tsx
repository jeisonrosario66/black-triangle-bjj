import React, { useState } from "react";
import { Card, Box, Typography, Button } from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import YouTube, { YouTubePlayer } from "react-youtube";
import { UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { TimeBrandButton } from "@src/components/index";
import { NodeFormData, PlayerControlsData } from "@src/context/exportType";

import * as styles from "@src/styles/stylesNodeView";
const textHardcoded = "components.nodeView.";

type NodeViewProps = {
  isAddNode: boolean;
  setValue?: UseFormSetValue<NodeFormData>;
};

/**
 * Componente `NodeView`
 * Este componente muestra un viddeo de YouTube incrustado y controles personalizados para reproducirlo.
 */
const NodeView: React.FC<NodeViewProps> = ({ isAddNode, setValue }) => {
  const { t } = useTranslation();
  // Obtiene los datos del nodo activo desde el estado global
  const nodeViewData = useUIStore((state) => state.nodeViewData);
  // Estado local para almacenar la instancia del reproductor de YouTube
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  // Estado local para almacenar el modo de reproduccion
  const [mode, setMode] = useState<"range" | "all" | null>(null);
  const recuperarDatosDetiempo = (data: PlayerControlsData) => {
    // Actualiza el valor en el form
    if (setValue) {
      if (data.videoid) setValue("videoid", data.videoid);
      if (data.start) setValue("start", data.start);
      if (data.end) setValue("end", data.end);
    }
  };
  const videoId = nodeViewData.videoid;
  const end = nodeViewData.end;

  // Limpia el ID del video en caso de que sea un enlace de "shorts"
  const cleanVideoId = videoId?.replace("shorts/", "") ?? "";

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
    // if (controls) {
    //   animateCameraBackFromNode(controls); // Anima la cámara de regreso
    // }
    useUIStore.setState({ isNodeViewActive: false }); // Desactiva la vista del nodo
  };

  // Configuración de las opciones del reproductor de YouTube
  const opts = {
    playerVars: {
      // start, // Tiempo de inicio del video
      // ...(end && { end }), // Tiempo de fin del video (si está definido)
      // autoplay: 1, // Reproducción automática
      // mute: 0, // Silencia el video
      // controls: 0, // Oculta los controles del reproductor
      // modestbranding: 1, // Oculta parcialmente el branding de YouTube
      // rel: 0, // No muestra videos relacionados al final
      // loop: 1, // Repite el video
      // playsinline: 1, // Reproduce en línea en dispositivos móviles
      // fs: 0, // Oculta el botón de pantalla completa
      // disablekb: 1, // Desactiva los atajos de teclado
      // cc_load_policy: 0, // No fuerza los subtítulos
      // hl: "es", // Idioma del reproductor (español)
    },
  };

  return (
    <Card sx={styles.containerNodeView(isAddNode)}>
      <Box sx={styles.nodeViewScreenContainer}>
        {/* Contenedor del reproductor de YouTube */}
        <Box sx={styles.containerYoutubeView}>
          <Box sx={styles.reproTitle}>
            <Box>
              <Typography variant="h4" className="typography">
                {t(textHardcoded + "title")}
              </Typography>
              <Typography variant="subtitle2" className="typography">
                {t(textHardcoded + "subTitle")}
              </Typography>
            </Box>
            <Box>
              <Button onClick={buttonCloseFunction}>
                <FirstPageIcon className="first-page-icon" color="error" />
              </Button>
            </Box>
          </Box>
          {/* Wrapper para mantener relación de aspecto */}
          <Box sx={styles.youtubeWrapper}>
            <YouTube
              videoId={cleanVideoId}
              opts={opts}
              onReady={onPlayerReady}
            />
          </Box>
          <Box
            sx={styles.playerControlContainer}
            id="player-controls-container"
          >
            <Box id="player-controls-descripcion">
              <Typography variant="h6" className="typography">
                {t(textHardcoded + "brandTitle")}
              </Typography>
              <Typography variant="subtitle2" className="typography">
                {t(textHardcoded + "brandSubTitle")}
              </Typography>
            </Box>

            <Box id="time-brand">
              <Typography
                variant="h6"
                className="typography typography-brand-controls"
              >
                {t(textHardcoded + "timeBrand")}
              </Typography>
              <Box className="time-brand-button">
                {player && (
                  <>
                    <TimeBrandButton
                      onSendDataTimeNewNode={recuperarDatosDetiempo}
                      label={t(textHardcoded + "timeBrandInit")}
                      player={player}
                      timeType="start"
                      disabled={mode === "all"}
                      onSelect={() => setMode("range")}
                    />
                    <TimeBrandButton
                      onSendDataTimeNewNode={recuperarDatosDetiempo}
                      label={t(textHardcoded + "timeBrandEnd")}
                      player={player}
                      timeType="end"
                      disabled={mode === "all"}
                      onSelect={() => setMode("range")}
                    />
                    <TimeBrandButton
                      onSendDataTimeNewNode={recuperarDatosDetiempo}
                      label={t(textHardcoded + "timeBrandAll")}
                      allTime={true}
                      player={player}
                      end={end}
                      disabled={mode === "range"}
                      onSelect={() => setMode("all")}
                    />
                  </>
                )}
              </Box>
            </Box>

            <Box id="time-brand-preview">
              <Typography
                variant="h6"
                className="typography typography-brand-controls"
              >
                {t(textHardcoded + "timeBrandPreview")}
              </Typography>
              <Box className="time-brand-button">
                <TimeBrandButton
                  onSendDataTimeNewNode={recuperarDatosDetiempo}
                  label={t(textHardcoded + "timeBrandInit")}
                  player={player}
                />
                <TimeBrandButton
                  onSendDataTimeNewNode={recuperarDatosDetiempo}
                  label={t(textHardcoded + "timeBrandEnd")}
                  player={player}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default NodeView;
