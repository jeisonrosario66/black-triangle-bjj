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

import { useNodeTaxonomy, useTabsByIds } from "@src/hooks/index";
import { useLayoutEffect, useMemo, useState } from "react";

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
import { NodeOptionFirestore } from "@bt/shared/context";

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
  const [navigationExpanded, setNavigationExpanded] = useState(true);

  const nodeData = location.state?.nodeRoute as NodeOptionFirestore | undefined;
  const firestoreRoute = location.state?.firestoreRuta;
  const courseModules = (location.state?.courseModules as NodeOptionFirestore[] | undefined) ?? [];
  const system = location.state?.system;

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

  const taxonomy = useNodeTaxonomy(
    currentNode?.id ?? 0,
    firestoreRoute ? [firestoreRoute] : [],
  );
  const tabs = useTabsByIds(taxonomy?.tab_ids);

  const { t } = useTranslation();
  const textVideoDetail = "components.videoDetail.";

  useLayoutEffect(() => {
    useUIStore.setState({ connectionViewerActiveStep: null });
  }, [currentNode]);

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

  return (
    <Box sx={styles.container}>
      <AppBarNewHeader />
      <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
        <BreadcrumbsBar
          items={[
            { label: t(textVideoDetail + "explore"), onClick: () => navigate(routeList.root) },
            { label: systemBreadcrumbLabel },
            { label: currentNode?.name ?? t(textVideoDetail + "content") },
          ]}
        />

        {system ? (
          <Card sx={styles.heroCard}>
            <Box sx={styles.heroMedia}>
              <SystemCover
                title={capitalizeFirstLetter(system.name)}
                subtitle={capitalizeFirstLetter(system.setSystem)}
                coach={capitalizeFirstLetter(system.coach)}
                coverUrl={system.coverUrl}
                variant="hero"
              />
            </Box>
          </Card>
        ) : null}

        <Box sx={styles.videoFrame}>
          <Box
            component="iframe"
            src={`https://drive.google.com/file/d/${currentNode?.videoid}/preview`}
            allow="autoplay"
            allowFullScreen
            sx={styles.videoIframe}
          />
        </Box>

        <SectionHeader
          title={currentNode?.name ?? t(textVideoDetail + "content")}
          withDivider={false}
        />

        <Box sx={styles.metaCard}>
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
                onSelect={(module) => navigateToModule(module)}
              />
            </AccordionDetails>
          </Accordion>
        ) : null}
      </PageContainer>
    </Box>
  );
}
