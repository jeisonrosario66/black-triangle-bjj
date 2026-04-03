import { NodeOptionFirestore } from "@bt/shared/context/index";
import {
  getCachedDataNodesShared,
  getDataNodesShared,
} from "@bt/shared/services/index";
import { capitalizeFirstLetter } from "@bt/shared/utils/index";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CircularProgress,
  Typography,
} from "@mui/material";
import { routeList } from "@src/context/index";
import { database } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleCourseDetailScreen";
import * as loadingStyles from "@src/styles/screens/styleLoading";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  ModuleList,
  PageContainer,
  SystemCover,
} from "@src/components/index";

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
  const firestoreRuta = system?.valueNodes;
  const cachedModules = firestoreRuta
    ? getCachedDataNodesShared([firestoreRuta], "es")
    : null;

  const [modules, setModules] = useState<NodeOptionFirestore[]>(
    () => cachedModules ?? [],
  );
  const [loadingModules, setLoadingModules] = useState(
    Boolean(firestoreRuta && !cachedModules),
  );
  const [expanded, setExpanded] = useState(false);

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

    if (firestoreRuta) {
      if (cachedModules) {
        setModules(cachedModules);
        setLoadingModules(false);
        return () => {
          mounted = false;
        };
      }

      loadNodes();
    } else {
      setLoadingModules(false);
    }

    return () => {
      mounted = false;
    };
  }, [cachedModules, firestoreRuta]);

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => Number(a.id) - Number(b.id));
  }, [modules]);

  if (!system) {
    return (
      <PageContainer>
        <Typography>No se encontró el sistema</Typography>
      </PageContainer>
    );
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
      <AppBarNewHeader />
      <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
        <BreadcrumbsBar
          items={[
            { label: "Explorar", onClick: () => navigate(routeList.root) },
            { label: capitalizeFirstLetter(system.name) },
          ]}
        />

        <Card sx={styles.heroCard}>
          <Box sx={styles.heroMedia}>
            <SystemCover
              title={capitalizeFirstLetter(system.name)}
              subtitle={capitalizeFirstLetter(system.setSystem)}
              coach={capitalizeFirstLetter(system.coach)}
              coverUrl={system.coverUrl}
              videoCount={modules.length || system.videoCount}
              variant="hero"
            />
          </Box>
        </Card>

        {system.description ? (
          <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={styles.description}>
            {capitalizeFirstLetter(system.description)}
          </Typography>
          </Box>
        ) : null}

        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SchemaOutlinedIcon sx={{ mr: 1 }} />
            <Typography>
              {capitalizeFirstLetter(system.setSystem)} · {modules.length} Videos
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={styles.moduleList}>
            <ModuleList
              modules={orderedModules}
              onSelect={(item) =>
                navigate(
                  routeList.videoDetailScreen
                    .replace(
                      ":systemName",
                      system.label + "-" + system.coach.replace(/ /g, "_"),
                    )
                    .replace(":nodeId", item.id.toString()),
                  {
                    state: {
                      nodeRoute: item,
                      firestoreRuta,
                      systemBreadcrumbLabel: capitalizeFirstLetter(system.name),
                    },
                  },
                )
              }
            />
          </AccordionDetails>
        </Accordion>
      </PageContainer>
    </Box>
  );
}
