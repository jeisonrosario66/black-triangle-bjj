import { type NodeOptionFirestore } from "@bt/shared/context/index";
import {
  buildSystemsUIShared,
  getCachedCourseStatShared,
  getCourseStatShared,
  getCachedDataNodesShared,
  getCachedSystemsShared,
  getDataNodesShared,
  getSystemshared,
  type VideoProgressEntry,
} from "@bt/shared/services/index";
import { capitalizeFirstLetter } from "@bt/shared/utils/index";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { routeList } from "@src/context/index";
import { database, useSession } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleCourseDetailScreen";
import * as loadingStyles from "@src/styles/screens/styleLoading";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  EditorialImagePanel,
  ModuleList,
  PageContainer,
} from "@src/components/index";
import CourseMetadataEditorPanel from "@src/components/editor/CourseMetadataEditorPanel";
import { useUIStore } from "@src/store";
import { buildCoursePath, buildGraphCourseContext, isCourseGraphComplete } from "@src/utils/courseNavigation";
import { hasGraphEditorAccess } from "@src/utils";
import useSocialMetadata from "@src/hooks/useSocialMetadata";
import {
  buildSeoDescriptionFromSummary,
  buildSeoTitle,
} from "@src/utils/seo";
import { resolveStorageAssetUrl } from "@src/utils/resolveStorageAssetUrl";

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
  const { systemName } = useParams();
  const { t, i18n } = useTranslation();
  const textCourseDetail = "components.courseDetail.";
  const language = i18n.language.startsWith("en") ? "en" : "es";
  const { user } = useSession();
  const stateSystem = location.state?.system;
  const [resolvedSystem, setResolvedSystem] = useState(stateSystem ?? null);
  const [resolvingDirectAccess, setResolvingDirectAccess] = useState(
    Boolean(!stateSystem && systemName),
  );
  const entryPoint = location.state?.entryPoint === "home" ? "home" : "explorer";
  const editorModeEnabled = useUIStore((state) => state.editorModeEnabled);
  const systemsOptions = useUIStore((state) => state.systemsOptions);
  const loadSystems = useUIStore((state) => state.loadSystems);
  const canManageGraph = hasGraphEditorAccess(user);
  const system = resolvedSystem ?? stateSystem;
  const firestoreRuta = system?.valueNodes;
  const cachedModules = firestoreRuta
    ? getCachedDataNodesShared([firestoreRuta], language)
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
  const [videoProgressById, setVideoProgressById] = useState<
    Record<string, VideoProgressEntry>
  >(() => cachedCourseStat?.videoProgressById ?? {});

  useSocialMetadata({
    title: buildSeoTitle(system?.label || t(textCourseDetail + "title")),
    description: buildSeoDescriptionFromSummary(
      system?.description || t(textCourseDetail + "description"),
    ),
    image: resolveStorageAssetUrl(system?.coverUrl),
    type: "website",
    locale: language,
  });

  useEffect(() => {
    if (systemsOptions.length > 0) {
      return;
    }

    void loadSystems();
  }, [loadSystems, systemsOptions.length]);

  useEffect(() => {
    let mounted = true;

    const hydrateFromUrl = async () => {
      if (stateSystem || !systemName) {
        setResolvingDirectAccess(false);
        return;
      }

      try {
        setResolvingDirectAccess(true);
        const cachedSystemGroups = getCachedSystemsShared(language);
        const systemGroups =
          cachedSystemGroups ??
          (await getSystemshared(getDocs, collection, database, language));
        const { systems } = buildSystemsUIShared(systemGroups);
        const matchedSystem =
          systems.find(
            (candidate) => buildCoursePath(candidate.label, candidate.coach) === systemName,
          ) ?? null;

        if (mounted) {
          setResolvedSystem(matchedSystem);
        }
      } catch (error) {
        console.error("No se pudo reconstruir el contexto del curso desde la URL:", error);
      } finally {
        if (mounted) {
          setResolvingDirectAccess(false);
        }
      }
    };

    void hydrateFromUrl();

    return () => {
      mounted = false;
    };
  }, [language, stateSystem, systemName]);

  useEffect(() => {
    let mounted = true;
    const loadNodes = async () => {
      try {
        const data = await getDataNodesShared(
          [firestoreRuta],
          getDocs,
          collection,
          database,
          language,
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
  }, [cachedModules, firestoreRuta, language]);

  useEffect(() => {
    let mounted = true;

    const loadCourseStat = async () => {
      if (!user?.email || !system?.label) {
        if (mounted) {
          setVisitedModuleIds([]);
          setVideoProgressById({});
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
        setVideoProgressById(courseStat?.videoProgressById ?? {});
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
  const canOpenGraph = isCourseGraphComplete(systemsOptions, system?.valueNodes);
  const totalCourseVideos = system.videoCount ?? modules.length;

  if (resolvingDirectAccess && !system) {
    return (
      <Box sx={loadingStyles.loading}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

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
          src={system.coverUrl}
          alt={capitalizeFirstLetter(system.name)}
          eyebrow={capitalizeFirstLetter(system.setSystem)}
          title={capitalizeFirstLetter(system.name)}
          description={t(textCourseDetail + "coachLabel", {
            coach: capitalizeFirstLetter(system.coach),
          })}
          sx={styles.contextMedia}
        />

        {canManageGraph && editorModeEnabled ? (
          <CourseMetadataEditorPanel
            system={system}
            modules={orderedModules}
            onSystemUpdated={(nextSystem) => setResolvedSystem(nextSystem)}
          />
        ) : null}

        {system.description ? (
          <Box sx={styles.descriptionCard}>
            <Typography variant="body1" sx={styles.description}>
              {capitalizeFirstLetter(system.description)}
            </Typography>
          </Box>
        ) : null}

        {canManageGraph ? (
          <Box sx={styles.descriptionCard}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {t(textCourseDetail + "graphBridgeTitle")}
                </Typography>
                <Typography variant="body2" sx={styles.description}>
                  {canOpenGraph
                    ? t(textCourseDetail + "graphBridgeReady")
                    : t(textCourseDetail + "graphBridgeBlocked")}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<HubRoundedIcon />}
                disabled={!canOpenGraph}
                onClick={() => {
                  if (!canOpenGraph) {
                    return;
                  }

                  useUIStore.getState().setGraphCourseContext(buildGraphCourseContext(system));
                  useUIStore.setState({
                    systemBjjSelectedNodes: [system.valueNodes],
                    systemBjjSelectedLinks: [system.valueLinks],
                  });
                  localStorage.setItem("systemsCacheNodes", JSON.stringify([system.valueNodes]));
                  localStorage.setItem("systemsCacheLinks", JSON.stringify([system.valueLinks]));
                  navigate(routeList.explorerGraphScreen);
                }}
              >
                {t(textCourseDetail + "openInGraph")}
              </Button>
            </Stack>
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
                total: totalCourseVideos,
              })}
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={styles.moduleList}>
            <ModuleList
              modules={orderedModules}
              visitedModuleIds={visitedModuleIds}
              videoProgressById={videoProgressById}
              onSelect={(item) =>
                navigate(
                  routeList.videoDetailScreen
                    .replace(
                      ":systemName",
                      buildCoursePath(system.label, system.coach),
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
