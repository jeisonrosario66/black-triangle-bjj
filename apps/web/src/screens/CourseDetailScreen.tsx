import { editorialMedia, type NodeOptionFirestore } from "@bt/shared/context/index";
import {
  getCachedCourseStatShared,
  getCourseStatShared,
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
  Button,
  Card,
  CircularProgress,
  Typography,
} from "@mui/material";
import { routeList } from "@src/context/index";
import { database, useSession } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleCourseDetailScreen";
import * as loadingStyles from "@src/styles/screens/styleLoading";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  EditorialImagePanel,
  ModuleList,
  PageContainer,
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
  const { t } = useTranslation();
  const textCourseDetail = "components.courseDetail.";
  const { user } = useSession();
  const system = location.state?.system;
  const entryPoint = location.state?.entryPoint === "home" ? "home" : "explorer";
  const firestoreRuta = system?.valueNodes;
  const cachedModules = firestoreRuta
    ? getCachedDataNodesShared([firestoreRuta], "es")
    : null;
  const cachedCourseStat =
    user?.email && system?.label
      ? getCachedCourseStatShared(user.email, system.label)
      : null;

  const [modules, setModules] = useState<NodeOptionFirestore[]>(
    () => cachedModules ?? [],
  );
  const [loadingModules, setLoadingModules] = useState(
    Boolean(firestoreRuta && !cachedModules),
  );
  const [expanded, setExpanded] = useState(true);
  const [visitedModuleIds, setVisitedModuleIds] = useState<number[]>(
    () => cachedCourseStat?.watchedVideoIds ?? [],
  );

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

  useEffect(() => {
    let mounted = true;

    const loadCourseStat = async () => {
      if (!user?.email || !system?.label) {
        if (mounted) {
          setVisitedModuleIds([]);
        }
        return;
      }

      try {
        const courseStat = await getCourseStatShared({
          email: user.email,
          courseLabel: system.label,
          firestore: {
            collection,
            database,
            getDocs,
          },
        });

        if (!mounted) {
          return;
        }

        setVisitedModuleIds(courseStat?.watchedVideoIds ?? []);
      } catch (error) {
        console.error("No se pudo cargar el estado visto del curso:", error);
      }
    };

    void loadCourseStat();

    return () => {
      mounted = false;
    };
  }, [system?.label, user?.email]);

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => Number(a.id) - Number(b.id));
  }, [modules]);

  if (!system) {
    return (
      <Box sx={styles.container}>
        <AppBarNewHeader />
        <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
          <Card sx={styles.descriptionCard}>
            <Typography variant="h6">
              {t(textCourseDetail + "missingCourseTitle")}
            </Typography>
            <Typography sx={styles.description}>
              {t(textCourseDetail + "missingCourseDescription")}
            </Typography>
            <Button
              sx={{ mt: 2, alignSelf: "flex-start" }}
              variant="contained"
              onClick={() => navigate(routeList.explorerScreen)}
            >
              {t(textCourseDetail + "backToExplore")}
            </Button>
          </Card>
        </PageContainer>
      </Box>
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
            {
              label:
                entryPoint === "home"
                  ? t("components.home.breadcrumb")
                  : t("components.videoDetail.explore"),
              onClick: () =>
                navigate(
                  entryPoint === "home" ? routeList.home : routeList.explorerScreen,
                ),
            },
            { label: capitalizeFirstLetter(system.name) },
          ]}
        />


        <EditorialImagePanel
          src={editorialMedia.courseContext.src}
          alt={capitalizeFirstLetter(system.name)}
          eyebrow={capitalizeFirstLetter(system.setSystem)}
          title={capitalizeFirstLetter(system.name)}
          description={`Coach ${capitalizeFirstLetter(system.coach)}`}
          objectPosition={editorialMedia.courseContext.objectPosition}
          sx={styles.contextMedia}
        />

        {system.description ? (
          <Box sx={styles.descriptionCard}>
            <Typography variant="body1" sx={styles.description}>
              {capitalizeFirstLetter(system.description)}
            </Typography>
          </Box>
        ) : null}
        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={styles.modulesAccordion}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accordionSummary}>
            <SchemaOutlinedIcon sx={{ mr: 1 }} />
            <Typography>
              {t(textCourseDetail + "courseVideos", {
                topic: capitalizeFirstLetter(system.setSystem),
                total: modules.length,
              })}
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={styles.moduleList}>
            <ModuleList
              modules={orderedModules}
              visitedModuleIds={visitedModuleIds}
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
                      entryPoint,
                      nodeRoute: item,
                      firestoreRuta,
                      systemBreadcrumbLabel: capitalizeFirstLetter(system.name),
                      courseModules: orderedModules,
                      system,
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
