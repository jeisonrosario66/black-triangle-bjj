import React, { useState } from "react";
import { IconButton, Paper, Tooltip, Typography, Box } from "@mui/material";
import { YouTubePlayer } from "react-youtube";
import { useTranslation } from "react-i18next";

import { PlayerControlsData } from "@src/context/exportType";

import * as style from "@src/styles/nodeView/stylesPlayerControls";

const textHardcoded = "components.nodeView.";

type PlayerControlsProps = {
  player: YouTubePlayer | null; // Instancia del reproductor de YouTube
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
  end,
  isAddNode,
  onSendDataTimeNewNode,
}) => {
  const { t } = useTranslation();
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

  return (
    <Box sx={style.containerControls}>
      {/* Controles del reproductor */}
      <Paper elevation={3} sx={style.containerPlayerControls}>
        <Box sx={style.gridPlayerControls(isAddNode)}>
          {/* Segunda fila de botones condicionales */}
          {isAddNode && (
            <Box sx={style.buttonAditional}>
              <Typography sx={{ margin: "auto" }}>
                {t(textHardcoded + "button2")}
              </Typography>
              <Tooltip title={t(textHardcoded + "button5")}>
                <IconButton
                  sx={style.iconsPlayer}
                  color="primary"
                  onClick={() => {
                    const t = Math.floor(player.getCurrentTime()).toString();
                    setStartTimeLocal(t);
                    console.log("start", t);
                    onSendDataTimeNewNode?.({
                      start: t,
                    });
                  }}
                >
                  <Typography>
                    {t(textHardcoded + "start")}:{" "}
                    {formatTimeFull(Number(startTimeLocal))}
                  </Typography>
                </IconButton>
              </Tooltip>

              <Tooltip title={t(textHardcoded + "button6")}>
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
                    {t(textHardcoded + "end")}:{" "}
                    {formatTimeFull(Number(endTimeLocal))}
                  </Typography>
                </IconButton>
              </Tooltip>

              <Tooltip title="tiempo total">
                <IconButton
                  sx={style.iconsPlayer}
                  color="primary"
                  onClick={() => {
                    const t = String(end);
                    setEndTimeLocal(t);
                    setStartTimeLocal("0");
                    onSendDataTimeNewNode?.({
                      end: t,
                      start: "0",
                      videoid: player.getVideoData().video_id,
                    });
                  }}
                >
                  <Typography>{t(textHardcoded + "button1")}</Typography>
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
