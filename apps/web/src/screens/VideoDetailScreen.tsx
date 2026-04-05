import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QueuePlayNextRoundedIcon from "@mui/icons-material/QueuePlayNextRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Divider,
  Typography,
} from "@mui/material";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { database, useNodeTaxonomy, useSession, useTabsByIds } from "@src/hooks/index";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cacheUser, routeList } from "@src/context/index";
import { useUIStore } from "@src/store";
import { capitalizeFirstLetter } from "@src/utils/index";
import { useTranslation } from "react-i18next";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  DescriptionList,
  ModuleList,
  PageContainer,
  SectionHeader,
  SystemCover,
  TagList,
} from "@src/components/index";
import * as styles from "@src/styles/screens/styleVideoDetailScreen";
import { type NodeOptionFirestore } from "@bt/shared/context";
import {
  getCachedCourseStatShared,
  getCourseStatShared,
  trackVideoOpenedShared,
} from "@bt/shared/services";
import { formatCompactNumber } from "@bt/shared/utils";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  setDoc,
} from "firebase/firestore";

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
  const navigate = useNavigate();
  const { systemName, nodeId } = useParams();
  const { user } = useSession();
  const [navigationExpanded, setNavigationExpanded] = useState(true);
  const trackedVideoRef = useRef<string>("");

  const nodeData = location.state?.nodeRoute as NodeOptionFirestore | undefined;
  const firestoreRoute = location.state?.firestoreRuta;
  const courseModules = (location.state?.courseModules as NodeOptionFirestore[] | undefined) ?? [];
  const system = location.state?.system;
  const cachedCourseStat =
    user?.email && system?.label
      ? getCachedCourseStatShared(user.email, system.label)
      : null;

  const orderedModules = useMemo(
    () => [...courseModules].sort((a, b) => Number(a.id) - Number(b.id)),
    [courseModules],
  );
  const currentNode =
    nodeData ??
    orderedModules.find((module) => module.id === Number(nodeId));
  const currentIndex = orderedModules.findIndex(
    (module) => module.id === currentNode?.id,
  );
  const previousModule =
    currentIndex > 0 ? orderedModules[currentIndex - 1] : undefined;
  const nextModule =
    currentIndex >= 0 && currentIndex < orderedModules.length - 1
      ? orderedModules[currentIndex + 1]
      : undefined;
  const [visitedModuleIds, setVisitedModuleIds] = useState<number[]>(
    () => cachedCourseStat?.watchedVideoIds ?? [],
  );
  const [viewsCount, setViewsCount] = useState<number>(currentNode?.viewsCount ?? 0);

  const taxonomy = useNodeTaxonomy(
    currentNode?.id ?? 0,
    firestoreRoute ? [firestoreRoute] : [],
  );
  const tabs = useTabsByIds(taxonomy?.tab_ids);

  const { t } = useTranslation();
  const textVideoDetail = "components.videoDetail.";
  const entryPoint = location.state?.entryPoint === "home" ? "home" : "explorer";

  useLayoutEffect(() => {
    useUIStore.setState({ connectionViewerActiveStep: null });
  }, [currentNode]);

  useEffect(() => {
    setViewsCount(currentNode?.viewsCount ?? 0);
  }, [currentNode?.id, currentNode?.viewsCount]);

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
        console.error("No se pudo cargar el historial del curso:", error);
      }
    };

    void loadCourseStat();

    return () => {
      mounted = false;
    };
  }, [system?.label, user?.email]);

  useEffect(() => {
    if (!user?.email || !system || !currentNode) {
      return;
    }

    const trackKey = `${user.email}:${system.label}:${currentNode.id}`;

    if (trackedVideoRef.current === trackKey) {
      return;
    }

    trackedVideoRef.current = trackKey;

    setVisitedModuleIds((currentVisitedIds) => {
      if (currentVisitedIds.includes(currentNode.id)) {
        return currentVisitedIds;
      }

      return [...currentVisitedIds, currentNode.id].sort((a, b) => a - b);
    });

    void (async () => {
      const wasTracked = await trackVideoOpenedShared({
        email: user.email,
        firestore: {
          arrayUnion,
          database,
          doc,
          increment,
          setDoc,
        },
        module: currentNode,
        system,
      });

      if (!wasTracked) {
        return;
      }

      setViewsCount((currentViews) => currentViews + 1);
    })();
  }, [currentNode, system, user?.email]);

  const stateSystemLabel = location.state?.systemBreadcrumbLabel as
    | string
    | undefined;

  const systemBreadcrumbLabel = useMemo(() => {
    const fromState = stateSystemLabel;
    if (fromState) return fromState;
    if (!systemName) return t(textVideoDetail + "system");
    return decodeURIComponent(systemName)
      .replace(/_/g, " ")
      .replace(/-/g, " · ");
  }, [stateSystemLabel, systemName, t]);

  const navigateToModule = (module: NodeOptionFirestore) => {
    navigate(
      routeList.videoDetailScreen
        .replace(":systemName", systemName ?? "sistema")
        .replace(":nodeId", module.id.toString()),
      {
        state: {
          ...location.state,
          entryPoint,
          nodeRoute: module,
          firestoreRuta: firestoreRoute,
          systemBreadcrumbLabel,
          courseModules: orderedModules,
          system,
        },
      },
    );
  };

  const tagItems = useMemo(
    () =>
      tabs.map((tab) => ({
        id: tab.id,
        label: capitalizeFirstLetter(
          localStorage.getItem(cacheUser.languageUser) === "es"
            ? tab.title_es || tab.label
            : tab.title_en || tab.label,
        ),
        color: "success" as const,
      })),
    [tabs],
  );

  const videoPlayer = (
    <Box sx={styles.videoFrame}>
      <Box
        component="iframe"
        src={`https://drive.google.com/file/d/${currentNode?.videoid}/preview`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={currentNode?.name ?? t(textVideoDetail + "content")}
        sx={styles.videoIframe}
      />
    </Box>
  );

  const heroCard = system ? (
    <Card sx={styles.heroCard}>
      <Box sx={styles.heroMedia}>
        <SystemCover
          title={capitalizeFirstLetter(system.name)}
          subtitle={capitalizeFirstLetter(system.setSystem)}
          coach={capitalizeFirstLetter(system.coach)}
          coverUrl={system.coverUrl}
          showVisitedIndicator={visitedModuleIds.length > 0}
          variant="header"
        />
      </Box>
    </Card>
  ) : null;

  if (!currentNode) {
    return (
      <Box sx={styles.container}>
        <AppBarNewHeader />
        <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
          <Card sx={styles.metaCard}>
            <Typography variant="h6">
              {t(textVideoDetail + "missingVideoTitle")}
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              {t(textVideoDetail + "missingVideoDescription")}
            </Typography>
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => navigate(routeList.explorerScreen)}
            >
              {t(textVideoDetail + "backToExplore")}
            </Button>
          </Card>
        </PageContainer>
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
                  : t(textVideoDetail + "explore"),
              onClick: () =>
                navigate(
                  entryPoint === "home" ? routeList.home : routeList.explorerScreen,
                ),
            },
            { label: systemBreadcrumbLabel },
            { label: currentNode?.name ?? t(textVideoDetail + "content") },
          ]}
        />

        {heroCard}
        {videoPlayer}
        <SectionHeader
          title={currentNode?.name ?? t(textVideoDetail + "content")}
          withDivider={false}
        />

        <Box sx={styles.metaCard}>
          <Box sx={styles.videoMetaRow}>
            <Typography variant="body2" sx={styles.viewsLabel}>
              {t(textVideoDetail + "viewsCount", {
                value: formatCompactNumber(viewsCount),
              })}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TagList items={tagItems} />
          </Box>

          {currentNode?.description?.summary && (
            <Box sx={styles.descriptionBox}>
              <DescriptionList
                title={t(textHardcoded + "descriptionLabel")}
                summary={currentNode.description.summary}
                points={currentNode.description.points}
              />
            </Box>
          )}
        </Box>

        {orderedModules.length > 0 ? (
          <Accordion
            expanded={navigationExpanded}
            onChange={() => setNavigationExpanded(!navigationExpanded)}
            sx={styles.navigationAccordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={styles.accordionSummary}
            >
              <QueuePlayNextRoundedIcon sx={{ mr: 1 }} />
              <Typography>
                {t(textVideoDetail + "courseVideos", {
                  current: currentIndex >= 0 ? currentIndex + 1 : 1,
                  total: orderedModules.length,
                })}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={styles.navigationControls}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackRoundedIcon />}
                  disabled={!previousModule}
                  onClick={() => previousModule && navigateToModule(previousModule)}
                >
                  {t(textVideoDetail + "previousVideo")}
                </Button>

                <Button
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  disabled={!nextModule}
                  onClick={() => nextModule && navigateToModule(nextModule)}
                >
                  {t(textVideoDetail + "nextVideo")}
                </Button>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              <ModuleList
                modules={orderedModules}
                selectedModuleId={currentNode?.id}
                visitedModuleIds={visitedModuleIds}
                onSelect={(module) => navigateToModule(module)}
              />
            </AccordionDetails>
          </Accordion>
        ) : null}
      </PageContainer>
    </Box>
  );
}
