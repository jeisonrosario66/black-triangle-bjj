import React, { useState } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import {
  Box,
  TextField,
  Typography,
  Card,
  Button,
  CardContent,
  CardMedia,
} from "@mui/material";

import { useUIStore } from "@src/store/index";
import { NodeFormData } from "@src/context/index";
import { Header, NodeView } from "@src/components/index";
import { handleSearch } from "@src/utils/index";

import * as style from "@src/styles/addNode/stepByStep/styleStep3";

type Step3Props = {
  control: Control<any>;
  setValue: UseFormSetValue<NodeFormData>;
};

const Step3: React.FC<Step3Props> = ({ control, setValue }) => {
  const [querySearchYT, setSearchYT] = useState("");
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
      {isNodeViewActive && (
        <NodeView isAddNode={true} control={control} setValue={setValue} />
      )}
      <Header title="Buscar Video en YouTube" />

      <Box sx={style.barSearch}>
        <TextField
          fullWidth
          label="Buscar"
          value={querySearchYT}
          onChange={(e) => setSearchYT(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => handleSearch(querySearchYT, setResults)}
        >
          Buscar
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
                    {video.channelTitle} - {video.viewCount} vistas - hace{" "}
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
