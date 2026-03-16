import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";

interface DescriptionListProps {
  title: string;
  summary: string;
  points: string[];
}

/**
 * Bloque de descripción con resumen y puntos clave.
 */
export default function DescriptionList({
  title,
  summary,
  points,
}: DescriptionListProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle2">{summary}</Typography>
      <List>
        {points.map((point, index) => (
          <ListItem disableGutters sx={{ py: 0.4 }} key={`${point}-${index}`}>
            <ArrowRightIcon />
            <ListItemText primary={point} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
