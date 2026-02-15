import { NodeOptionFirestore } from "@bt/shared/context/index";
import { getDataNodesShared } from "@bt/shared/services/index";
import { capitalizeFirstLetter } from "@bt/shared/utils/index";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardMedia,
  CircularProgress,
  Divider,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import { routeList } from "@src/context/index";
import { database } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleCourseDetailScreen";
import * as loadingStyles from "@src/styles/screens/styleLoading";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Pantalla de detalle de un sistema o curso en entorno web.
 * Responsable de cargar dinámicamente los módulos asociados desde Firestore,
 * ordenarlos y exponer la navegación hacia el detalle de cada video,
 * utilizando el estado de navegación recibido desde la pantalla de exploración.
 *
 * @returns {JSX.Element} Vista detallada del sistema con listado de módulos navegables.
 */
export default function CourseDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const system = location.state?.system;

  const [modules, setModules] = useState<NodeOptionFirestore[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const firestoreRuta = system.valueNodes;
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadNodes = async () => {
      try {
        const data = await getDataNodesShared(
          [firestoreRuta],
          getDocs,
          collection,
          database,
          "es",
        );

        if (!mounted) return;
        setModules(data);
      } catch (error) {
        console.error("Error cargando nodos del sistema:", error);
      } finally {
        if (mounted) setLoadingModules(false);
      }
    };

    loadNodes();

    return () => {
      mounted = false;
    };
  }, [firestoreRuta]);

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => Number(a.id) - Number(b.id));
  }, [modules]);

  if (!system) {
    return <Typography>No se encontró el sistema</Typography>;
  }
  if (loadingModules) {
    return (
      <Box sx={loadingStyles.loading}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Card sx={{ position: "relative" }}>
        {/* Skeleton mientras la imagen NO ha cargado */}
        {!imageLoaded && (
          <Skeleton variant="rectangular" width="100%" height={340} />
        )}
        <CardMedia
          component="img"
          image={system.coverUrl}
          onLoad={() => setImageLoaded(true)}
          sx={{
            height: 340,
            display: imageLoaded ? "block" : "none",
            transition: "opacity 0.4s ease",
          }}
        />
      </Card>

      <Typography variant="h5" style={{ marginTop: 16 }}>
        {capitalizeFirstLetter(system.name)}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 3 }}>
        {capitalizeFirstLetter(system.description)}
      </Typography>

      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SchemaOutlinedIcon sx={{ mr: 1 }} />
          <Typography>
            {capitalizeFirstLetter(system.setSystem)} · {modules.length} Videos
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          {orderedModules.map((item, index) => (
            <Box key={item.id}>
              <ListItemButton
                onClick={() =>
                  navigate(
                    routeList.videoDetailScreen
                      .replace(
                        ":systemName",
                        system.label + '-' + system.coach.replace(/ /g, '_'),
                      )
                      .replace(":nodeId", item.id.toString()),
                    {
                      state: {
                        nodeRoute: item,
                        firestoreRuta,
                      },
                    },
                  )
                }
              >
                <ListItemText primary={`${index + 1}. ${item.name}`} />
              </ListItemButton>
              <Divider />
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
