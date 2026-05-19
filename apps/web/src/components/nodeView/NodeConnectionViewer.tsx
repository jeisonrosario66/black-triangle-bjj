import React, { useMemo } from "react";
import {
  Tabs,
  Tab,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import type { GraphLink, NodeViewData } from "@src/context/index";
import type { VideoProgressEntry } from "@bt/shared/services";

import themeApp from "@src/styles/stylesThemeApp";

const textHardcoded = "components.nodeConnectionViewer.";

interface NodeConnectionViewerProps {
  nodeId: number;
  valueLinks?: string;
  valueNodes?: string;
  onSelectNode?: (node: NodeViewData) => void;
  visitedModuleIds?: number[];
  videoProgressById?: Record<string, VideoProgressEntry>;
  defaultActiveStep?: number | null;
}

const getLinkEndpointId = (endpoint: GraphLink["source"] | GraphLink["target"]) =>
  typeof endpoint === "number" ? endpoint : endpoint?.id;

const buildUniqueNodeList = (
  ids: number[],
  nodeById: Map<number, NodeViewData>,
) => {
  const seenIds = new Set<number>();

  return ids.reduce<NodeViewData[]>((result, id) => {
    if (seenIds.has(id)) {
      return result;
    }

    const node = nodeById.get(id);

    if (!node) {
      return result;
    }

    seenIds.add(id);
    result.push(node);
    return result;
  }, []);
};

export default function NodeConnectionViewer({
  nodeId,
  valueLinks,
  valueNodes,
  onSelectNode,
  visitedModuleIds = [],
  videoProgressById = {},
  defaultActiveStep = 0,
}: NodeConnectionViewerProps) {
  const { t } = useTranslation();
  const linkData = useUIStore((state) => state.linksData);
  const documentsFirestore = useUIStore((state) => state.documentsFirestore);
  const activeTabState = useUIStore(
    (state) => state.connectionViewerActiveStep,
  );
  const effectiveActiveStep = activeTabState ?? defaultActiveStep ?? false;
  const visitedSet = useMemo(() => new Set(visitedModuleIds), [visitedModuleIds]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    useUIStore.setState((state) => ({
      connectionViewerActiveStep:
        state.connectionViewerActiveStep === newValue ? null : newValue,
    }));
  };

  const nodeById = useMemo(
    () =>
      new Map(
        documentsFirestore
          .filter((node) => !valueNodes || node.valueNodes === valueNodes)
          .map((node) => [node.id, node]),
      ),
    [documentsFirestore, valueNodes],
  );
  const scopedLinks = useMemo(
    () =>
      valueLinks
        ? linkData.filter((link) => link.valueLinks === valueLinks)
        : linkData,
    [linkData, valueLinks],
  );

  const sourceNodes = useMemo(() => {
    const targetIds = scopedLinks
      .filter((link) => getLinkEndpointId(link.source) === nodeId)
      .map((link) => getLinkEndpointId(link.target))
      .filter((id): id is number => typeof id === "number");

    return buildUniqueNodeList(targetIds, nodeById);
  }, [nodeById, nodeId, scopedLinks]);

  const targetNodes = useMemo(() => {
    const sourceIds = scopedLinks
      .filter((link) => getLinkEndpointId(link.target) === nodeId)
      .map((link) => getLinkEndpointId(link.source))
      .filter((id): id is number => typeof id === "number");

    return buildUniqueNodeList(sourceIds, nodeById);
  }, [nodeById, nodeId, scopedLinks]);

  const openNode = (node: NodeViewData) => {
    if (onSelectNode) {
      onSelectNode(node);
      return;
    }

    useUIStore.setState({ nodeViewData: node });
  };

  const renderNodeList = (nodes: NodeViewData[], emptyText: string) => {
    if (nodes.length === 0) {
      return (
        <Typography variant="body2" sx={{ color: "text.secondary", px: 0.5 }}>
          {emptyText}
        </Typography>
      );
    }

    return (
      <List dense sx={{ py: 0 }}>
        {nodes.map((node, index) => {
          const progressEntry = videoProgressById[String(node.id)];
          const progressPercent = Math.min(
            100,
            Math.max(
              progressEntry?.progressPercent ?? 0,
              progressEntry?.completed ? 100 : 0,
            ),
          );
          const progressLabel = progressEntry?.completed
            ? "Completado"
            : progressPercent > 0
              ? `${Math.round(progressPercent)}% visto`
              : undefined;

          return (
            <React.Fragment key={`${node.id}-${index}`}>
              <ListItemButton
                onClick={() => openNode(node)}
                selected={node.id === nodeId}
                sx={(theme) => ({
                  borderRadius: 2,
                  mb: 0.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  border: "1px solid transparent",
                  borderColor:
                    node.id === nodeId
                      ? alpha(theme.palette.primary.main, 0.42)
                      : visitedSet.has(node.id)
                        ? alpha(theme.palette.primary.main, 0.16)
                        : "transparent",
                  backgroundColor:
                    node.id === nodeId
                      ? alpha(theme.palette.primary.main, 0.08)
                      : visitedSet.has(node.id)
                        ? alpha(theme.palette.primary.main, 0.04)
                        : undefined,
                  py: 1.05,
                  px: 1.25,
                })}
              >
                <Box
                  sx={(theme) => ({
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                    mt: 0.85,
                    backgroundColor: visitedSet.has(node.id)
                      ? theme.palette.primary.main
                      : alpha(theme.palette.outline, 0.4),
                    boxShadow: visitedSet.has(node.id)
                      ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`
                      : "none",
                  })}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ListItemText
                    primary={node.name || `${t(textHardcoded + "node")} ${node.id}`}
                    secondary={progressLabel}
                    sx={{ my: 0 }}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: "0.92rem",
                        fontWeight: 600,
                        fontFamily: themeApp.palette.typography.fontFamily,
                      },
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        mt: 0.35,
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        color: progressEntry?.completed
                          ? "success.main"
                          : "text.secondary",
                      },
                    }}
                  />
                  {progressPercent > 0 ? (
                    <Box
                      sx={(theme) => ({
                        mt: 0.85,
                        width: "100%",
                        height: 6,
                        borderRadius: 999,
                        overflow: "hidden",
                        backgroundColor: alpha(theme.palette.primary.main, 0.14),
                      })}
                    >
                      <Box
                        sx={(theme) => ({
                          width: `${progressPercent}%`,
                          height: "100%",
                          borderRadius: 999,
                          backgroundColor: progressEntry?.completed
                            ? theme.palette.success.main
                            : theme.palette.primary.main,
                          transition: "width 160ms ease",
                          boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.22)}`,
                        })}
                      />
                    </Box>
                  ) : null}
                </Box>
              </ListItemButton>
              {index < nodes.length - 1 ? <Divider variant="inset" /> : null}
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        "& .MuiTab-root": {
          fontSize: "0.8rem",
          fontFamily: themeApp.palette.typography.fontFamily,
        },
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={effectiveActiveStep}
          onChange={handleChange}
          aria-label="Node connection viewer tabs"
          variant="fullWidth"
        >
          <Tab
            label={`${t(textHardcoded + "targetLabel")} (${targetNodes.length})`}
            id="tab-0"
            aria-controls="tabpanel-0"
            onClick={() => {
              if (effectiveActiveStep === 0) {
                useUIStore.setState({ connectionViewerActiveStep: null });
              }
            }}
          />
          <Tab
            label={`${t(textHardcoded + "sourceLabel")} (${sourceNodes.length})`}
            id="tab-1"
            aria-controls="tabpanel-1"
            onClick={() => {
              if (effectiveActiveStep === 1) {
                useUIStore.setState({ connectionViewerActiveStep: null });
              }
            }}
          />
        </Tabs>
      </Box>

      {effectiveActiveStep === 0 ? (
        <Box role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0" sx={{ pt: 1.5 }}>
          {renderNodeList(targetNodes, t(textHardcoded + "targetLinksLabel"))}
        </Box>
      ) : null}

      {effectiveActiveStep === 1 ? (
        <Box role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" sx={{ pt: 1.5 }}>
          {renderNodeList(sourceNodes, t(textHardcoded + "sourceLinksLabel"))}
        </Box>
      ) : null}
    </Box>
  );
}
