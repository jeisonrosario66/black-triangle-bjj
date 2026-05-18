import {
  Box,
  Button,
  Card,
  Typography,
} from "@mui/material";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { database, useCourseVideoExperience } from "@src/hooks/index";
import { useEffect, useMemo, useState } from "react";

import { routeList } from "@src/context/index";
import { capitalizeFirstLetter } from "@src/utils/index";
import { useTranslation } from "react-i18next";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  PageContainer,
  CourseVideoExperiencePanel,
  SystemCover,
} from "@src/components/index";
import * as styles from "@src/styles/screens/styleVideoDetailScreen";
import { type NodeOptionFirestore } from "@bt/shared/context";
import {
  buildSystemsUIShared,
  getCachedDataNodesShared,
  getCachedSystemsShared,
  getDataNodesShared,
  getSystemshared,
} from "@bt/shared/services";
import type { SystemCardUI } from "@bt/shared/context";
import { collection, getDocs } from "firebase/firestore";

const buildCoursePath = (label: string, coach: string) =>
  `${label}-${coach.replace(/ /g, "_")}`;

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
  const [resolvedSystem, setResolvedSystem] = useState<SystemCardUI | null>(null);
  const [resolvedModules, setResolvedModules] = useState<NodeOptionFirestore[]>([]);
  const [resolvedFirestoreRoute, setResolvedFirestoreRoute] = useState<string | null>(null);
  const [resolvingDirectAccess, setResolvingDirectAccess] = useState(false);

  const nodeData = location.state?.nodeRoute as NodeOptionFirestore | undefined;
  const stateFirestoreRoute = location.state?.firestoreRuta as string | undefined;
  const stateCourseModules =
    (location.state?.courseModules as NodeOptionFirestore[] | undefined) ?? [];
  const stateSystem = location.state?.system as SystemCardUI | undefined;
  const system = stateSystem ?? resolvedSystem ?? undefined;
  const firestoreRoute =
    stateFirestoreRoute ?? resolvedFirestoreRoute ?? system?.valueNodes;
  const courseModules =
    stateCourseModules.length > 0 ? stateCourseModules : resolvedModules;

  const orderedModules = useMemo(
    () => [...courseModules].sort((a, b) => Number(a.id) - Number(b.id)),
    [courseModules],
  );
  const currentNode =
    nodeData ??
    orderedModules.find((module) => module.id === Number(nodeId));

  const { t, i18n } = useTranslation();
  const textVideoDetail = "components.videoDetail.";
  const language = i18n.language.startsWith("en") ? "en" : "es";
  const entryPoint = location.state?.entryPoint === "home" ? "home" : "explorer";
  const experience = useCourseVideoExperience({
    currentNode,
    courseModules: orderedModules,
    firestoreRoute,
    system,
    fallbackSystemLabel: system?.label,
  });

  useEffect(() => {
    let mounted = true;

    const hydrateFromUrl = async () => {
      if (stateSystem && stateCourseModules.length > 0 && stateFirestoreRoute) {
        setResolvingDirectAccess(false);
        return;
      }

      if (!systemName) {
        setResolvingDirectAccess(false);
        return;
      }

      setResolvingDirectAccess(true);

      try {
        const cachedSystemGroups = getCachedSystemsShared(language);
        const systemGroups =
          cachedSystemGroups ??
          (await getSystemshared(getDocs, collection, database, language));
        const { systems } = buildSystemsUIShared(systemGroups);
        const matchedSystem =
          systems.find(
            (candidate) =>
              buildCoursePath(candidate.label, candidate.coach) === systemName,
          ) ?? null;

        if (!mounted) {
          return;
        }

        setResolvedSystem(matchedSystem);

        if (!matchedSystem?.valueNodes) {
          setResolvedFirestoreRoute(null);
          setResolvedModules([]);
          return;
        }

        setResolvedFirestoreRoute(matchedSystem.valueNodes);

        const cachedNodes = getCachedDataNodesShared(
          [matchedSystem.valueNodes],
          language,
        );
        const modules =
          cachedNodes ??
          (await getDataNodesShared(
            [matchedSystem.valueNodes],
            getDocs,
            collection,
            database,
            language,
          ));

        if (!mounted) {
          return;
        }

        setResolvedModules(modules);
      } catch (error) {
        console.error("No se pudo reconstruir el contexto del video desde la URL:", error);
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
  }, [
    language,
    stateCourseModules,
    stateFirestoreRoute,
    stateSystem,
    systemName,
  ]);

  const stateSystemLabel = location.state?.systemBreadcrumbLabel as
    | string
    | undefined;

  const systemBreadcrumbLabel = useMemo(() => {
    const fromState = stateSystemLabel;
    if (fromState) return fromState;
    if (system?.name) return capitalizeFirstLetter(system.name);
    if (!systemName) return t(textVideoDetail + "system");
    return decodeURIComponent(systemName)
      .replace(/_/g, " ")
      .replace(/-/g, " · ");
  }, [stateSystemLabel, system?.name, systemName, t]);

  const navigateToModule = (module: NodeOptionFirestore) => {
    navigate(
      routeList.videoDetailScreen
        .replace(":systemName", systemName ?? t(textVideoDetail + "systemRouteFallback"))
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

  const navigateToCourse = () => {
    if (!system) {
      return;
    }

    navigate(
      routeList.courseDetailScreen.replace(
        ":systemName",
        buildCoursePath(system.label, system.coach),
      ),
      {
        state: {
          entryPoint,
          system,
        },
      },
    );
  };

  const heroCard = system ? (
    <Card sx={styles.heroCard}>
      <Box sx={styles.heroMedia}>
        <SystemCover
          title={capitalizeFirstLetter(system.name)}
          subtitle={capitalizeFirstLetter(system.setSystem)}
          coach={capitalizeFirstLetter(system.coach)}
          coverUrl={system.coverUrl}
          showVisitedIndicator={experience.visitedModuleIds.length > 0}
          variant="header"
        />
      </Box>
    </Card>
  ) : null;

  if (resolvingDirectAccess && !currentNode) {
    return (
      <Box sx={styles.container}>
        <AppBarNewHeader />
        <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
          <Card sx={styles.metaCard}>
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <Typography sx={{ color: "text.secondary" }}>
                {t("components.profile.loading")}
              </Typography>
            </Box>
          </Card>
        </PageContainer>
      </Box>
    );
  }

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
            {
              label: systemBreadcrumbLabel,
              onClick: system ? navigateToCourse : undefined,
            },
            { label: currentNode?.name ?? t(textVideoDetail + "content") },
          ]}
        />

        {heroCard}
        <CourseVideoExperiencePanel
          experience={experience}
          onSelectModule={(module) => navigateToModule(module as NodeOptionFirestore)}
        />
      </PageContainer>
    </Box>
  );
}
