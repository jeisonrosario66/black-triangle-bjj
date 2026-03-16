import { Box, Divider } from "@mui/material";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useNodeTaxonomy, useTabsByIds } from "@src/hooks/index";
import { useLayoutEffect, useMemo } from "react";

import { cacheUser, routeList } from "@src/context/index";
import { useUIStore } from "@src/store";
import { capitalizeFirstLetter } from "@src/utils/index";
import { useTranslation } from "react-i18next";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  DescriptionList,
  PageContainer,
  SectionHeader,
  TagList,
} from "@src/components/index";
import * as styles from "@src/styles/screens/styleVideoDetailScreen";

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
  const { systemName } = useParams();

  const nodeData = location.state?.nodeRoute;
  const firestoreRoute = location.state?.firestoreRuta;

  const taxonomy = useNodeTaxonomy(nodeData?.id ?? 0, [firestoreRoute]);
  const tabs = useTabsByIds(taxonomy?.tab_ids);

  const { t } = useTranslation();

  useLayoutEffect(() => {
    useUIStore.setState({ connectionViewerActiveStep: null });
  }, [nodeData]);

  const stateSystemLabel = location.state?.systemBreadcrumbLabel as
    | string
    | undefined;

  const systemBreadcrumbLabel = useMemo(() => {
    const fromState = stateSystemLabel;
    if (fromState) return fromState;
    if (!systemName) return "Sistema";
    return decodeURIComponent(systemName)
      .replace(/_/g, " ")
      .replace(/-/g, " · ");
  }, [stateSystemLabel, systemName]);

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
            { label: "Explorar", onClick: () => navigate(routeList.root) },
            { label: systemBreadcrumbLabel },
            { label: nodeData?.name ?? "Contenido" },
          ]}
        />

        <Box sx={styles.videoFrame}>
          <Box
            component="iframe"
            src={`https://drive.google.com/file/d/${nodeData?.videoid}/preview`}
            allow="autoplay"
            allowFullScreen
            sx={styles.videoIframe}
          />
        </Box>

        <SectionHeader
          title={nodeData?.name ?? "Contenido"}
          withDivider={false}
        />

        <Box sx={{ mb: 2 }}>
          <TagList items={tagItems} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {nodeData?.description?.summary && (
          <Box sx={styles.descriptionBox}>
            <DescriptionList
              title={t(textHardcoded + "descriptionLabel")}
              summary={nodeData.description.summary}
              points={nodeData.description.points}
            />
          </Box>
        )}
      </PageContainer>
    </Box>
  );
}
