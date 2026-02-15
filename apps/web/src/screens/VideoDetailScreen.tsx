import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import { useLocation } from "react-router-dom";

import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useNodeTaxonomy, useTabsByIds } from "@src/hooks/index";
import { useLayoutEffect } from "react";

import { shape } from "@bt/shared/design-system";
import { cacheUser } from "@src/context/index";
import { useUIStore } from "@src/store";
import { capitalizeFirstLetter } from "@src/utils/index";
import { useTranslation } from "react-i18next";

const textHardcoded = "components.nodeConnectionViewer.";

/**
 * Pantalla de detalle de video asociada a un nodo de contenido.
 * Renderiza el reproductor embebido, las categorías taxonómicas vinculadas
 * y la descripción estructurada del nodo, utilizando el estado recibido
 * vía navegación y resolviendo metadatos adicionales desde hooks compartidos.
 *
 * @returns {JSX.Element} Vista de reproducción y detalle informativo del nodo seleccionado.
 */
export default function VideoDetailScreen() {
  const location = useLocation();
  const nodeData = location.state?.nodeRoute;
  const firestoreRoute = location.state?.firestoreRuta;

  const taxonomy = useNodeTaxonomy(nodeData?.id ?? 0, [firestoreRoute]);
  const tabs = useTabsByIds(taxonomy?.tab_ids);

  const { t } = useTranslation();

  useLayoutEffect(() => {
    useUIStore.setState({ connectionViewerActiveStep: null });
  }, [nodeData]);

  return (
    <Box sx={{ margin: 2 }}>
      <iframe
        src={`https://drive.google.com/file/d/${nodeData.videoid}/preview`}
        width="100%"
        height="340"
        allow="autoplay"
        allowFullScreen
        style={{borderRadius:shape.borderRadius.lg}}
      />
      <Box sx={{ margin: 2 }}></Box>
      <Typography variant="h5" sx={{marginBottom:3}}>
        {nodeData.name}
      </Typography>
      {/* Categorías */}
      <Stack direction="row" spacing={1} mb={2}>
        {" "}
        {tabs.map((tab) => (
          <Chip
            key={tab.id}
            label={capitalizeFirstLetter(
              localStorage.getItem(cacheUser.languageUser) === "es"
                ? tab.title_es || tab.label
                : tab.title_en || tab.label,
            )}
            color="success"
            size="small"
            variant="outlined"
          />
        ))}
      </Stack>
      <Divider sx={{ my: 2 }} />
      {/* Descripción */}
      {nodeData?.description?.summary && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {" "}
            {t(textHardcoded + "descriptionLabel")}{" "}
          </Typography>
          <Typography variant="subtitle2">
            {" "}
            {nodeData.description.summary}{" "}
          </Typography>
          <List>
            {" "}
            {nodeData.description.points.map((p, i) => (
              <ListItem sx={{ py: 0.4 }} key={i}>
                {" "}
                {<ArrowRightIcon />}
                <ListItemText primary={p} />
              </ListItem>
            ))}{" "}
          </List>
        </Box>
      )}
    </Box>
  );
}
