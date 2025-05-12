import React, { useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import {
  Box,
  TextField,
  Typography,
  Card,
  Button,
  CardContent,
  CardMedia,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { NodeFormData } from "@src/context/index";
import { Header, NodeView } from "@src/components/index";
import { handleSearch } from "@src/utils/index";

import * as style from "@src/styles/addNode/stepByStep/styleStep3";

const textHardcoded = "components.addNode.step3.";

type Step3Props = {
  setValue: UseFormSetValue<NodeFormData>;
};

const Step3: React.FC<Step3Props> = ({ setValue }) => {
  const { t } = useTranslation();

  const [searchYT, setSearchYT] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const isNodeViewActive = useUIStore((state) => state.isNodeViewActive);

  type NodeViewData = {
    videoid?: string;
    start?: string;
    end?: string;
  };

  const handleVideoSelect = (data: NodeViewData) => {
    setValue("videoid", data.videoid);
    useUIStore.setState({ isNodeViewActive: true });
    useUIStore.setState({ nodeViewData: data });
  };

  return (
    <Box sx={style.containerBoxStep}>
      {/* Video seleccionado */}
      {isNodeViewActive && <NodeView isAddNode={true} setValue={setValue} />}
      <Header title={t(textHardcoded+"title")} />

      <Box sx={style.barSearch}>
        <TextField
          fullWidth
          label={t(textHardcoded+"subText1")}
          value={searchYT}
          onChange={(e) => setSearchYT(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => handleSearch(searchYT, setResults)}
        >
          {t(textHardcoded+"subText1")}
        </Button>
      </Box>

      {/* Resultados de búsqueda */}
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
              sx={style.resultSearchCard}
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
                    {video.channelTitle} - {video.viewCount} {t(textHardcoded+"subText2")}{" "}
                    {video.publishedAt}
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
