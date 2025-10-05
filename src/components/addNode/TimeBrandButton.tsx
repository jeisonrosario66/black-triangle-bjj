import React, { useState } from "react";
import { YouTubePlayer } from "react-youtube";
import { Button, Typography } from "@mui/material";

import { PlayerControlsData } from "@src/context/exportType";
import themeApp from "@src/styles/stylesThemeApp";
import { formatTimeFull } from "@src/utils";

// Tema global (colores, tipografías, etc.)
const theme = themeApp;
const fontFamilyDefault = theme.palette.typography.fontFamily;

// Definición de las props esperadas por el componente
type TimeBrandButtonProps = {
  label: string; // Texto que se mostrará en el botón
  player: YouTubePlayer; // Instancia del reproductor de YouTube
  allTime?: boolean; // Indica si debe usarse todo el video en lugar de marcas de tiempo
  end?: string; // Tiempo de fin opcional (solo para modo "video completo")
  onSendDataTimeNewNode: (data: PlayerControlsData) => void; // Callback para enviar datos al padre
  timeType?: "start" | "end"; // Tipo de marca de tiempo que captura el botón
  disabled?: boolean; // Deshabilita la interacción del botón
  onSelect?: () => void; // Notifica al padre que este botón fue seleccionado
};

/**
 * Componente `TimeBrandButton`
 * 
 * Este botón permite marcar tiempos dentro de un video de YouTube:
 * - Puede registrar un tiempo de inicio o fin.
 * - Puede asignar el video completo como rango válido.
 * - Informa los valores capturados al componente padre mediante callbacks.
 * - Incluye estilos dinámicos según estado (`clicked`, `disabled`).
 */
const TimeBrandButton: React.FC<TimeBrandButtonProps> = ({
  label,
  player,
  allTime = false,
  end,
  disabled = false,
  timeType,
  onSelect,
  onSendDataTimeNewNode,
}) => {
  // Estado local para almacenar el tiempo marcado en segundos
  const [timeLocal, setTimeLocal] = useState<string>("");

  // Estado que indica si el botón fue clicado (para resaltar visualmente)
  const [isClicked, setIsClicked] = useState<boolean>(false);

  return (
    <Button
      // Estilos dinámicos: cambian según estado activo o deshabilitado
      sx={{
        border: end ? "0" : "1px solid lightgray",
        borderRadius: end ? "0" : "14px",
        background: isClicked ? theme.palette.action.success : "transparent",
        color: isClicked ? "#fff" : theme.palette.text.secondary,
        "&:hover": {
          background: isClicked
            ? theme.palette.action.success
            : "#f0f0f0", // color hover según estado
        },
        opacity: disabled ? 0.4 : 1, // opacidad reducida si está deshabilitado
      }}
      disabled={disabled} // bloqueo de clics si está inactivo
      onClick={() => {
        // Captura el tiempo actual del video
        const t = Math.floor(player.getCurrentTime()).toString();
        setTimeLocal(t);

        // Alterna el estado de "clicado" para feedback visual
        setIsClicked(!isClicked);

        // Envía los datos al padre según el tipo de botón
        if (end == undefined) {
          onSendDataTimeNewNode({ [(timeType ?? "start") as string]: t });
        } else {
          // Caso "usar video completo"
          onSendDataTimeNewNode({ start: "0", end: end });
        }

        // Notifica al padre que este botón fue seleccionado
        if (onSelect) onSelect();
      }}
    >
      <Typography
        sx={{
          color: theme.palette.text.tertiary,
          fontFamily: fontFamilyDefault,
          fontSize: "0.8rem",
          fontWeight: "300",
        }}
        variant="subtitle2"
      >
        <strong>{label}</strong>{" "}
        {/* Muestra el tiempo marcado, salvo en modo "video completo" */}
        {allTime ? "" : formatTimeFull(Number(timeLocal))}
      </Typography>
    </Button>
  );
};

export default TimeBrandButton;
