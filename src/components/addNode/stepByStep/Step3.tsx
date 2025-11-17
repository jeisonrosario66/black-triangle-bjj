import React, { useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { NodeFormData, configGlobal } from "@src/context/index";
import { NodeView } from "@src/components/index";
import { handleSearch } from "@src/utils/index";

import * as style from "@src/styles/addNode/stepByStep/styleStep3";

const textHardcoded = "components.addNode.step3.";

type Step3Props = {
  setValue: UseFormSetValue<NodeFormData>;
  videoIdSeleted?: string;
};

/**
 * Paso 3 del proceso de creación de un nodo.
 * Permite buscar videos, seleccionar uno y cargarlo en la vista previa del nodo.
 *
 * @component
 * @param {UseFormSetValue<NodeFormData>} setValue - Función de react-hook-form para actualizar campos del formulario.
 * @param {string} [videoIdSeleted] - ID del video actualmente seleccionado.
 */
const Step3: React.FC<Step3Props> = ({ setValue, videoIdSeleted }) => {
  const { t } = useTranslation();

  const [searchInit, setSearchInit] = useState(false);

  const [searchYT, setSearchYT] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const isNodeViewActive = useUIStore((state) => state.isNodeAddViewActive);

  type NodeViewData = {
    videoid?: string;
    start?: string;
    end?: string;
  };

  /**
   * Maneja la selección de un video desde los resultados,
   * actualiza el formulario y activa la vista NodeView.
   *
   * @param {Object} data - Datos del video seleccionado.
   * @param {string} [data.videoid] - ID del video seleccionado.
   * @param {string} [data.start] - Segundo inicial del video.
   * @param {string} [data.end] - Segundo final del video.
   */
  const handleVideoSelect = (data: NodeViewData) => {
    setValue("videoid", data.videoid);
    useUIStore.setState({ isNodeAddViewActive: true });
    useUIStore.setState({ nodeViewData: data });
  };

  return (
    <Box sx={style.containerBoxStep}>
      <Box sx={style.barSearch}>
        {searchInit ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <ArrowBackIosIcon
              sx={{ margin: "auto 10px" }}
              onClick={() => {
                setSearchInit(!searchInit);
              }}
            />

            <TextField
              fullWidth
              value={searchYT}
              onChange={(e) => {
                setSearchYT(e.target.value);
              }}
              sx={{
                margin: "auto",
                "& input": {
                  padding: "0 8px",
                  color: "#fff",
                },
              }}
            />
            <SearchIcon
              onClick={() => {
                handleSearch(searchYT, setResults);
                setSearchInit(!searchInit);
                setValue("videoid", "");
                setValue("start", "");
                setValue("end", "");
              }}
              sx={{ margin: "auto 10px" }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              flexDirection: "row",
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
              }}
            >
              <img
                width={"50px"}
                src={configGlobal.logoApp}
                alt="Black Triangle BJJ Logo"
              />
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: "0.8rem",
                  lineHeight: "1",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                  fontStyle: "italic",
                  alignContent: "center",
                }}
              >
                {configGlobal.namePage}
              </Typography>
            </Box>
            <Box sx={{ margin: "auto 10px", display: "flex" }}>
              <SearchIcon
                onClick={() => {
                  setSearchInit(!searchInit);
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
      {/* Video seleccionado */}
      {isNodeViewActive && <NodeView isAddNode={true} setValue={setValue} />}
      {/* Resultados de búsqueda  */}
      {results.length > 0 && (
        <Box sx={style.resultSearchContainer}>
          {results.map((video) => (
            <Card
              key={video.videoId}
              onClick={() => {
                handleVideoSelect({
                  videoid: video.videoId,
                  start: "0",
                  end: video.secondsTotal,
                });
              }}
              sx={style.resultSearchCard(videoIdSeleted === video.videoId)}
            >
              <Box sx={style.videoAndDurationContainer}>
                <Typography sx={style.videoDuration}>
                  {video.duration}
                </Typography>
                <CardMedia
                  component="img"
                  image={video.videoThumbnailUrl}
                  alt={video.videoTitle}
                />
              </Box>
              <CardContent>
                <Box>
                  <Typography variant="subtitle2">
                    {video.videoTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {video.channelTitle} - {video.viewCount}{" "}
                    {t(textHardcoded + "subText2")} {video.publishedAt}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Step3;
