import React, { useState, useRef, useLayoutEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Chip,
  Stack,
  Box,
  Rating,
  TextField,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import YouTube, { YouTubePlayer } from "react-youtube";
import { gsap } from "gsap";

import { GraphNode } from "@src/context/index";
import { capitalizeFirstLetter } from "@src/utils/index";
import { NodeConnectionViewer } from "@src/components/index";

import { youtubeWrapper } from "@src/styles/stylesNodeView";
import { useUIStore } from "@src/store";

const mockComments = [
  {
    id: 1,
    user: "Carlos",
    comment: "Excelente transición desde media guardia.",
    rating: 4,
  },
  {
    id: 2,
    user: "Lucía",
    comment: "Útil para combinar con ataques de triángulo.",
    rating: 5,
  },
];

interface WindowViewNodeProps {
  open: boolean;
  onClose: () => void;
  nodeData: GraphNode;
}

const WindowViewNode: React.FC<WindowViewNodeProps> = ({
  open,
  onClose,
  nodeData,
}) => {
  const [rating, setRating] = useState<number | null>(4.5);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(mockComments);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([
        ...comments,
        { id: Date.now(), user: "Tú", comment, rating: 4 },
      ]);
      setComment("");
    }
  };

  /**
   * Función que se ejecuta cuando el reproductor de YouTube está listo.
   * Configura el reproductor y comienza la reproducción automáticamente.
   */
  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    event.target.playVideo(); // Inicia la reproducción del video
  };

  useLayoutEffect(() => {
    if (!contentRef.current) return;

    contentRef.current.scrollTo({ top: 0, behavior: "auto" });

    const tl = gsap.timeline();

    tl.to(contentRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: "power1.inOut",
    })
      .set(contentRef.current, { scrollTop: 0 })
      .to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    useUIStore.setState({ connectionViewerActiveStep: null });
  }, [nodeData]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.4rem" }}>
        {capitalizeFirstLetter(nodeData.name || "Node Name")}
      </DialogTitle>

      <DialogContent dividers ref={contentRef} sx={{ overflowY: "auto" }}>
        {/* Imagen principal */}
        {/* <CardMedia
          component="img"
          image="./categoryExampleImg.png"
          alt="técnica"
          sx={{
            borderRadius: 2,
            mb: 2,
            maxHeight: 320,
            objectFit: "contain",
            width: "100%",
          }}
        /> */}
        {/* <NodeView isAddNode={true}  /> */}
        <Box sx={youtubeWrapper}>
          <YouTube
            videoId={nodeData.videoid}
            // opts={opts}
            onReady={onPlayerReady}
          />
        </Box>
        {/* Categorías */}
        <Stack direction="row" spacing={1} mb={2}>
          <Chip
            label={capitalizeFirstLetter(nodeData.group || "groupEmpty")}
            color="success"
            variant="outlined"
          />
        </Stack>

        {/* Relaciones entre nodos */}
        <NodeConnectionViewer nodeId={nodeData.id ? nodeData.id : 0} />
        <Divider sx={{ my: 2 }} />

        {/* Descripción */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Descripción
          </Typography>
          <Typography variant="subtitle2">
            {nodeData.description ||
              "Breve descripción de la técnica, sus beneficios y cuándo utilizarla en combate."}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Calificación general */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Calificación promedio
          </Typography>
          <Rating
            value={rating}
            precision={0.5}
            onChange={(_, value) => setRating(value)}
            size="large"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Reseñas */}
        <Typography variant="h6" gutterBottom>
          Reseñas de la comunidad
        </Typography>

        <List dense>
          {comments.map((c) => (
            <ListItem key={c.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{c.user[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2">{c.user}</Typography>
                    <Rating value={c.rating} size="small" readOnly />
                  </Stack>
                }
                secondary={c.comment}
              />
            </ListItem>
          ))}
        </List>

        {/* Añadir comentario */}
        <Stack direction="row" spacing={1} mt={2}>
          <TextField
            fullWidth
            size="small"
            label="Agrega tu comentario"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<Send />}
            onClick={handleAddComment}
          >
            Enviar
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default WindowViewNode;
