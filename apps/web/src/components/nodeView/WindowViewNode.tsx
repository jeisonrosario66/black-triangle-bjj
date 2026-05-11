import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Stack,
  Box,
  Divider,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  useMediaQuery,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import SouthWestRoundedIcon from "@mui/icons-material/SouthWestRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import {
  useAllTabs,
  useCourseVideoExperience,
  useSession,
  primeNodeTaxonomyCache,
} from "@src/hooks/index";
import { type GraphLink, type NodeViewData } from "@src/context/index";
import {
  capitalizeFirstLetter,
  hasGraphEditorAccess,
  isSpecialGraphUser,
} from "@src/utils/index";
import {
  CourseVideoExperiencePanel,
  NodeConnectionViewer,
} from "@src/components/index";
import { useUIStore } from "@src/store";
import { database } from "@src/hooks/fireBase";

const CONNECTION_TEXT = "components.nodeConnectionViewer.";
const NODE_VIEW_TEXT = "components.nodeView.";

interface WindowViewNodeProps {
  open: boolean;
  onClose: () => void;
  nodeData: NodeViewData | null;
}

const getLinkEndpointId = (endpoint: GraphLink["source"] | GraphLink["target"]) =>
  typeof endpoint === "number" ? endpoint : endpoint?.id;

const buildCoverageStats = (nodes: NodeViewData[], links: GraphLink[]) => {
  const connectedIds = new Set<number>();

  links.forEach((link) => {
    const sourceId = getLinkEndpointId(link.source);
    const targetId = getLinkEndpointId(link.target);

    if (typeof sourceId === "number") {
      connectedIds.add(sourceId);
    }

    if (typeof targetId === "number") {
      connectedIds.add(targetId);
    }
  });

  const connectedCount = nodes.filter((node) => connectedIds.has(node.id)).length;

  return {
    total: nodes.length,
    connected: connectedCount,
    pending: Math.max(nodes.length - connectedCount, 0),
  };
};

const buildTaxonomyDocument = (
  node: NodeViewData,
  nextTagIds: string[],
  currentTaxonomyId?: string,
  categoryId?: string,
  subcategoryId?: string,
  specificCategoryId?: string,
) => ({
  id: currentTaxonomyId ?? String(node.id),
  category_id: categoryId ?? "",
  subcategory_id: subcategoryId ?? "",
  specific_category_id: specificCategoryId ?? "",
  node_index: node.id,
  tab_ids: nextTagIds,
});

const WindowViewNode: React.FC<WindowViewNodeProps> = ({
  open,
  onClose,
  nodeData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const documentsFirestore = useUIStore((state) => state.documentsFirestore);
  const linksData = useUIStore((state) => state.linksData);
  const triggerAlert = useUIStore((state) => state.triggerAlert);
  const refreshGraphData = useUIStore((state) => state.refreshGraphData);
  const allTabs = useAllTabs();
  const canManageGraph = hasGraphEditorAccess(user);
  const canSeeNodeIds = isSpecialGraphUser(user);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [editableTagIds, setEditableTagIds] = useState<string[]>([]);
  const [isSavingTags, setIsSavingTags] = useState(false);

  const systemNodes = useMemo(() => {
    if (!nodeData?.valueNodes) {
      return nodeData ? [nodeData] : [];
    }

    const scopedNodes = documentsFirestore.filter(
      (node) => node.valueNodes === nodeData.valueNodes,
    );

    if (!nodeData) {
      return scopedNodes;
    }

    if (!scopedNodes.some((node) => node.id === nodeData.id)) {
      return [nodeData, ...scopedNodes];
    }

    return scopedNodes;
  }, [documentsFirestore, nodeData]);

  const systemLinks = useMemo(() => {
    if (!nodeData?.valueLinks) {
      return [];
    }

    return linksData.filter((link) => link.valueLinks === nodeData.valueLinks);
  }, [linksData, nodeData]);

  const availableTargetNodes = useMemo(() => {
    if (!nodeData?.valueNodes) {
      return [];
    }

    return systemNodes
      .filter((node) => node.id !== nodeData.id)
      .sort((nodeA, nodeB) => nodeA.id - nodeB.id);
  }, [nodeData, systemNodes]);

  const coverageStats = useMemo(
    () => buildCoverageStats(systemNodes, systemLinks),
    [systemLinks, systemNodes],
  );

  const experience = useCourseVideoExperience({
    currentNode: nodeData,
    courseModules: systemNodes,
    firestoreRoute: nodeData?.valueNodes ?? null,
    fallbackSystemLabel: nodeData?.systemLabel ?? null,
  });

  const currentTagIds = experience.taxonomy?.tab_ids ?? [];
  const currentTagIdsKey = useMemo(
    () => currentTagIds.join("|"),
    [currentTagIds],
  );

  useEffect(() => {
    setEditableTagIds(currentTagIdsKey ? currentTagIdsKey.split("|") : []);
    setSelectedTargetId("");
    setSelectedTagId("");
  }, [currentTagIdsKey, nodeData?.id]);

  const activeTags = useMemo(
    () =>
      editableTagIds
        .map((tagId) => allTabs.find((tag) => tag.id === tagId))
        .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag)),
    [allTabs, editableTagIds],
  );
  const activeTagItems = useMemo(
    () =>
      activeTags.map((tag) => ({
        id: tag.id,
        label: capitalizeFirstLetter(
          i18n.language.startsWith("en")
            ? tag.title_en || tag.label
            : tag.title_es || tag.label,
        ),
        color: "success" as const,
      })),
    [activeTags, i18n.language],
  );

  const availableTags = useMemo(
    () => allTabs.filter((tag) => !editableTagIds.includes(tag.id)),
    [allTabs, editableTagIds],
  );

  const upsertTagIds = async (nextTagIds: string[]) => {
    if (!nodeData?.valueNodes) {
      return;
    }

    const tagsPath = nodeData.valueNodes.replace("/nodes", "/tabs");
    const nextTaxonomy = buildTaxonomyDocument(
      nodeData,
      nextTagIds,
      experience.taxonomy?.id,
      experience.taxonomy?.category_id,
      experience.taxonomy?.subcategory_id,
      experience.taxonomy?.specific_category_id,
    );

    setIsSavingTags(true);

    try {
      await setDoc(
        doc(database, tagsPath, nextTaxonomy.id),
        {
          category_id: nextTaxonomy.category_id,
          subcategory_id: nextTaxonomy.subcategory_id,
          specific_category_id: nextTaxonomy.specific_category_id,
          node_index: nextTaxonomy.node_index,
          tab_ids: nextTaxonomy.tab_ids,
          updatedBy: user?.email ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      primeNodeTaxonomyCache(nodeData.id, [nodeData.valueNodes], nextTaxonomy);
      setEditableTagIds(nextTagIds);
      triggerAlert(t(CONNECTION_TEXT + "tagsSaved"), "success");
    } catch (error) {
      console.error("No se pudieron actualizar las tags del nodo:", error);
      triggerAlert(t(CONNECTION_TEXT + "tagsSaveError"), "error");
    } finally {
      setIsSavingTags(false);
    }
  };

  const createQuickConnection = async (direction: "incoming" | "outgoing") => {
    if (!nodeData || !nodeData.valueLinks || !canManageGraph) {
      return;
    }

    const parsedTargetId = Number(selectedTargetId);

    if (!selectedTargetId || !Number.isFinite(parsedTargetId)) {
      triggerAlert(t(CONNECTION_TEXT + "selectNodeFirst"), "warning");
      return;
    }

    const sourceId = direction === "outgoing" ? nodeData.id : parsedTargetId;
    const targetId = direction === "outgoing" ? parsedTargetId : nodeData.id;
    const nextDocId = `${sourceId}_${targetId}`;
    const hasExistingLink = systemLinks.some(
      (link) =>
        getLinkEndpointId(link.source) === sourceId &&
        getLinkEndpointId(link.target) === targetId,
    );

    if (hasExistingLink) {
      triggerAlert(t(CONNECTION_TEXT + "linkAlreadyExists"), "info");
      return;
    }

    try {
      await setDoc(
        doc(database, nodeData.valueLinks, nextDocId),
        {
          source: sourceId,
          target: targetId,
          systemLabel: nodeData.systemLabel ?? "",
          updatedBy: user?.email ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      useUIStore.setState((state) => ({
        linksData: [
          ...state.linksData,
          {
            docId: nextDocId,
            valueLinks: nodeData.valueLinks,
            systemLabel: nodeData.systemLabel,
            source: sourceId,
            target: targetId,
          },
        ],
      }));
      refreshGraphData();
      setSelectedTargetId("");
      triggerAlert(t(CONNECTION_TEXT + "linkCreated"), "success");
    } catch (error) {
      console.error("No se pudo crear la conexión rápida:", error);
      triggerAlert(t(CONNECTION_TEXT + "linkCreationError"), "error");
    }
  };

  const metaExtra = canManageGraph ? (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1,
        }}
      >
        <Box sx={metricCard(theme)}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            {t(CONNECTION_TEXT + "connectedIndicatorLabel")}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {coverageStats.connected}
          </Typography>
        </Box>
        <Box sx={metricCard(theme)}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            {t(CONNECTION_TEXT + "pendingIndicatorLabel")}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {coverageStats.pending}
          </Typography>
        </Box>
        <Box sx={metricCard(theme)}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            {t(CONNECTION_TEXT + "systemCoverageCompact")}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {coverageStats.total > 0
              ? `${coverageStats.connected}/${coverageStats.total}`
              : "0/0"}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.outlineVariant}`,
          p: 1.5,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.4 }}>
          {t(CONNECTION_TEXT + "quickConnectTitle")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
          {t(CONNECTION_TEXT + "quickConnectDescription")}
        </Typography>

        <FormControl fullWidth size="small">
          <InputLabel id="quick-link-node-label">
            {t(CONNECTION_TEXT + "targetNodeLabel")}
          </InputLabel>
          <Select
            labelId="quick-link-node-label"
            value={selectedTargetId}
            label={t(CONNECTION_TEXT + "targetNodeLabel")}
            onChange={(event) => setSelectedTargetId(String(event.target.value))}
          >
            {availableTargetNodes.map((node) => (
              <MenuItem key={node.id} value={node.id}>
                {canSeeNodeIds
                  ? `${node.id}. ${capitalizeFirstLetter(node.name)}`
                  : capitalizeFirstLetter(node.name)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 1.4 }}
        >
          <Button
            variant="contained"
            startIcon={<CallMadeRoundedIcon />}
            onClick={() => void createQuickConnection("outgoing")}
            disabled={selectedTargetId === ""}
          >
            {t(CONNECTION_TEXT + "addOutgoing")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SouthWestRoundedIcon />}
            onClick={() => void createQuickConnection("incoming")}
            disabled={selectedTargetId === ""}
          >
            {t(CONNECTION_TEXT + "addIncoming")}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.outlineVariant}`,
          p: 1.5,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.4 }}>
          {t(CONNECTION_TEXT + "tagsEditorTitle")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
          {t(CONNECTION_TEXT + "tagsEditorDescription")}
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.25 }}>
          {activeTags.map((tag) => (
            <Chip
              key={tag.id}
              label={capitalizeFirstLetter(
                i18n.language.startsWith("en")
                  ? tag.title_en || tag.label
                  : tag.title_es || tag.label,
              )}
              onDelete={
                () =>
                  void upsertTagIds(
                    editableTagIds.filter((tagId) => tagId !== tag.id),
                  )
              }
              disabled={isSavingTags}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <FormControl fullWidth size="small">
            <InputLabel id="node-tag-select-label">
              {t(CONNECTION_TEXT + "availableTagsLabel")}
            </InputLabel>
            <Select
              labelId="node-tag-select-label"
              value={selectedTagId}
              label={t(CONNECTION_TEXT + "availableTagsLabel")}
              onChange={(event) => setSelectedTagId(String(event.target.value))}
            >
              {availableTags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {capitalizeFirstLetter(
                    i18n.language.startsWith("en")
                      ? tag.title_en || tag.label
                      : tag.title_es || tag.label,
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            disabled={!selectedTagId || isSavingTags}
            onClick={() => {
              if (!selectedTagId || editableTagIds.includes(selectedTagId)) {
                return;
              }

              void upsertTagIds([...editableTagIds, selectedTagId]);
              setSelectedTagId("");
            }}
          >
            {t(CONNECTION_TEXT + "addTag")}
          </Button>
        </Stack>
      </Box>
    </Stack>
  ) : null;

  const afterNavigation = canManageGraph ? (
    <Box
      sx={{
        mt: 2,
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.outlineVariant}`,
        p: { xs: 1.25, md: 1.5 },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.8 }}>
        {t(CONNECTION_TEXT + "connectedPanelTitle")}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
        {t(CONNECTION_TEXT + "connectedPanelDescription")}
      </Typography>
      <NodeConnectionViewer
        nodeId={nodeData?.id ? nodeData.id : 0}
        valueLinks={nodeData?.valueLinks}
        valueNodes={nodeData?.valueNodes}
        onSelectNode={(node) => useUIStore.setState({ nodeViewData: node })}
      />
    </Box>
  ) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: { xs: "100%", md: "min(1080px, 94vw)" },
          height: { xs: "100%", md: "min(92dvh, 940px)" },
          maxHeight: { xs: "100%", md: "92dvh" },
          borderRadius: { xs: 0, md: 3 },
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          pr: 1.5,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.3rem" }}>
            {canManageGraph && typeof nodeData?.id === "number"
              ? `${nodeData.id}. ${capitalizeFirstLetter(nodeData?.name ?? "Node")}`
              : capitalizeFirstLetter(nodeData?.name ?? "Node")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.35 }}>
            {experience.resolvedSystem?.name
              ? capitalizeFirstLetter(experience.resolvedSystem.name)
              : nodeData?.systemLabel
                ? capitalizeFirstLetter(nodeData.systemLabel.replace(/_/g, " "))
                : t(NODE_VIEW_TEXT + "subTitle")}
          </Typography>
        </Box>

        <IconButton onClick={onClose} aria-label={t(NODE_VIEW_TEXT + "closeWindow")}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          overflowY: "auto",
          px: { xs: 2, md: 3 },
          pb: { xs: 3, md: 3.5 },
        }}
      >
        <CourseVideoExperiencePanel
          experience={experience}
          onSelectModule={(module) => useUIStore.setState({ nodeViewData: module })}
          variant="dialog"
          tagItemsOverride={canManageGraph ? activeTagItems : undefined}
          metaExtra={metaExtra}
          afterNavigation={afterNavigation}
        />

        {!canManageGraph && coverageStats.total > 0 ? (
          <Box
            sx={{
              mt: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
            }}
          >
            <HubRoundedIcon fontSize="small" />
            <Typography variant="body2">
              {t(CONNECTION_TEXT + "coverageLabel", {
                connected: coverageStats.connected,
                total: coverageStats.total,
              })}
            </Typography>
          </Box>
        ) : null}

        <Divider sx={{ mt: 2 }} />
      </DialogContent>
    </Dialog>
  );
};

const metricCard = (theme: any) => ({
  borderRadius: 2.5,
  border: `1px solid ${theme.palette.outlineVariant}`,
  px: 1.25,
  py: 1.1,
});

export default WindowViewNode;
