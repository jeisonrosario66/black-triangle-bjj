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
  ListSubheader,
  TextField,
  useMediaQuery,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import SouthWestRoundedIcon from "@mui/icons-material/SouthWestRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import {
  useAllTabs,
  useCourseVideoExperience,
  useSession,
  primeNodeTaxonomyCache,
} from "@src/hooks/index";
import {
  groupColor,
  tableNameDB,
  type GraphLink,
  type NodeViewData,
} from "@src/context/index";
import {
  capitalizeFirstLetter,
  hasGraphEditorAccess,
  isSpecialGraphUser,
} from "@src/utils/index";
import {
  buildTabOptionGroups,
  buildTaxonomyEditorModel,
  type TaxonomyOption,
} from "@src/utils/nodeEditorTaxonomy";
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

type EditableSystemLink = {
  docId: string;
  direction: "incoming" | "outgoing";
  sourceId: number;
  targetId: number;
  peerNodeId: number;
};

type EditableNodeDraft = {
  name_es: string;
  name_en: string;
  group: string;
  videoid: string;
  descrip_es_summary: string;
  descrip_es_points: string;
  descrip_en_summary: string;
  descrip_en_points: string;
};

type EditableTaxonomyDraft = {
  category_id: string;
  subcategory_id: string;
  specific_category_id: string;
};

const EMPTY_TAXONOMY_DRAFT: EditableTaxonomyDraft = {
  category_id: "",
  subcategory_id: "",
  specific_category_id: "",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const parsePointsText = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const serializePoints = (value: unknown) => {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .join("\n");
};

const normalizeDescription = (value: unknown) => {
  if (!isRecord(value)) {
    return {
      summary: "",
      points: [] as string[],
    };
  }

  const points = Array.isArray(value.points)
    ? value.points
        .map((item) => normalizeString(item))
        .filter(Boolean)
    : [];

  return {
    summary: normalizeString(value.summary),
    points,
  };
};

const buildEditableNodeDraft = (
  node: NodeViewData,
  rawData: Record<string, unknown> | null,
  isEnglish: boolean,
): EditableNodeDraft => {
  const fallbackDescription = normalizeDescription(node.description);
  const descriptionEs = normalizeDescription(
    rawData?.descrip_es ?? (!isEnglish ? node.description : undefined),
  );
  const descriptionEn = normalizeDescription(
    rawData?.descrip_en ?? (isEnglish ? node.description : undefined),
  );

  return {
    name_es:
      normalizeString(rawData?.name_es) || (!isEnglish ? normalizeString(node.name) : ""),
    name_en:
      normalizeString(rawData?.name_en) || (isEnglish ? normalizeString(node.name) : ""),
    group: normalizeString(rawData?.group) || normalizeString(node.group),
    videoid: normalizeString(rawData?.videoid) || normalizeString(node.videoid),
    descrip_es_summary: descriptionEs.summary || (!isEnglish ? fallbackDescription.summary : ""),
    descrip_es_points:
      serializePoints(descriptionEs.points) || (!isEnglish ? serializePoints(fallbackDescription.points) : ""),
    descrip_en_summary: descriptionEn.summary || (isEnglish ? fallbackDescription.summary : ""),
    descrip_en_points:
      serializePoints(descriptionEn.points) || (isEnglish ? serializePoints(fallbackDescription.points) : ""),
  };
};

const buildEditableTaxonomyDraft = (
  taxonomy?: {
    category_id?: string;
    subcategory_id?: string;
    specific_category_id?: string;
  } | null,
): EditableTaxonomyDraft => ({
  category_id: normalizeString(taxonomy?.category_id),
  subcategory_id: normalizeString(taxonomy?.subcategory_id),
  specific_category_id: normalizeString(taxonomy?.specific_category_id),
});

const buildStructuredDescription = (summary: string, pointsText: string) => ({
  summary: summary.trim(),
  points: parsePointsText(pointsText),
});

const buildNodeUpdatePayload = (
  initialDraft: EditableNodeDraft,
  draft: EditableNodeDraft,
) => {
  const payload: Record<string, unknown> = {};

  if (initialDraft.name_es !== draft.name_es) {
    payload.name_es = draft.name_es.trim();
  }

  if (initialDraft.name_en !== draft.name_en) {
    payload.name_en = draft.name_en.trim();
  }

  if (initialDraft.group !== draft.group) {
    payload.group = draft.group.trim();
  }

  if (initialDraft.videoid !== draft.videoid) {
    payload.videoid = draft.videoid.trim();
  }

  const initialDescriptionEs = buildStructuredDescription(
    initialDraft.descrip_es_summary,
    initialDraft.descrip_es_points,
  );
  const nextDescriptionEs = buildStructuredDescription(
    draft.descrip_es_summary,
    draft.descrip_es_points,
  );

  if (JSON.stringify(initialDescriptionEs) !== JSON.stringify(nextDescriptionEs)) {
    payload.descrip_es = nextDescriptionEs;
  }

  const initialDescriptionEn = buildStructuredDescription(
    initialDraft.descrip_en_summary,
    initialDraft.descrip_en_points,
  );
  const nextDescriptionEn = buildStructuredDescription(
    draft.descrip_en_summary,
    draft.descrip_en_points,
  );

  if (JSON.stringify(initialDescriptionEn) !== JSON.stringify(nextDescriptionEn)) {
    payload.descrip_en = nextDescriptionEn;
  }

  return payload;
};

const resolveNodeColor = (categoryId: string, group: string) =>
  groupColor[categoryId.trim().toLowerCase()] ??
  groupColor[group.trim()] ??
  undefined;

const buildLocalizedNodeData = (
  node: NodeViewData,
  draft: EditableNodeDraft,
  taxonomyDraft: EditableTaxonomyDraft,
  isEnglish: boolean,
): NodeViewData => {
  const description = isEnglish
    ? buildStructuredDescription(draft.descrip_en_summary, draft.descrip_en_points)
    : buildStructuredDescription(draft.descrip_es_summary, draft.descrip_es_points);
  const localizedName = isEnglish
    ? draft.name_en.trim() || draft.name_es.trim() || node.name
    : draft.name_es.trim() || draft.name_en.trim() || node.name;

  return {
    ...node,
    name: localizedName,
    group: draft.group.trim(),
    videoid: draft.videoid.trim(),
    description,
    color: resolveNodeColor(taxonomyDraft.category_id, draft.group),
  };
};

const ensureOptionExists = (options: TaxonomyOption[], value: string) => {
  if (!value || options.some((option) => option.id === value)) {
    return options;
  }

  return [
    {
      id: value,
      label: value,
      parentId: "",
      raw: {},
      specificOptions: [],
    },
    ...options,
  ];
};

const areStringArraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((item, index) => item === right[index]);

const buildLinkDocId = (
  source: GraphLink["source"] | number,
  target: GraphLink["target"] | number,
  docId?: string,
) => {
  if (docId) {
    return docId;
  }

  const sourceId = typeof source === "number" ? source : getLinkEndpointId(source);
  const targetId = typeof target === "number" ? target : getLinkEndpointId(target);

  if (typeof sourceId !== "number" || typeof targetId !== "number") {
    return "";
  }

  return `${sourceId}_${targetId}`;
};

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
  const canManageExistingLinks = isSpecialGraphUser(user);
  const isEnglish = i18n.language.startsWith("en");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selectedEditableLinkId, setSelectedEditableLinkId] = useState("");
  const [selectedReplacementNodeId, setSelectedReplacementNodeId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [editableTagIds, setEditableTagIds] = useState<string[]>([]);
  const [savedTagIds, setSavedTagIds] = useState<string[]>([]);
  const [editableNodeDraft, setEditableNodeDraft] = useState<EditableNodeDraft | null>(
    null,
  );
  const [initialNodeDraft, setInitialNodeDraft] = useState<EditableNodeDraft | null>(
    null,
  );
  const [editableTaxonomyDraft, setEditableTaxonomyDraft] =
    useState<EditableTaxonomyDraft>(EMPTY_TAXONOMY_DRAFT);
  const [savedTaxonomyDraft, setSavedTaxonomyDraft] =
    useState<EditableTaxonomyDraft>(EMPTY_TAXONOMY_DRAFT);
  const [taxonomyDocumentId, setTaxonomyDocumentId] = useState<string>();
  const [taxonomyCategories, setTaxonomyCategories] = useState<TaxonomyOption[]>([]);
  const [taxonomySubcategoriesByCategory, setTaxonomySubcategoriesByCategory] =
    useState<Record<string, TaxonomyOption[]>>({});
  const [isLoadingEditorOptions, setIsLoadingEditorOptions] = useState(false);
  const [isLoadingNodeDraft, setIsLoadingNodeDraft] = useState(false);
  const [isSavingNodeDetails, setIsSavingNodeDetails] = useState(false);
  const [isSavingTaxonomy, setIsSavingTaxonomy] = useState(false);
  const [isSavingLinkMutation, setIsSavingLinkMutation] = useState(false);

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

  const editableLinks = useMemo(() => {
    if (!nodeData) {
      return [];
    }

    return systemLinks
      .flatMap<EditableSystemLink>((link) => {
        const sourceId = getLinkEndpointId(link.source);
        const targetId = getLinkEndpointId(link.target);

        if (typeof sourceId !== "number" || typeof targetId !== "number") {
          return [];
        }

        const docId = buildLinkDocId(sourceId, targetId, link.docId);

        if (!docId) {
          return [];
        }

        if (sourceId === nodeData.id) {
          return [
            {
              docId,
              direction: "outgoing",
              sourceId,
              targetId,
              peerNodeId: targetId,
            },
          ];
        }

        if (targetId === nodeData.id) {
          return [
            {
              docId,
              direction: "incoming",
              sourceId,
              targetId,
              peerNodeId: sourceId,
            },
          ];
        }

        return [];
      })
      .sort((linkA, linkB) => {
        if (linkA.direction !== linkB.direction) {
          return linkA.direction === "outgoing" ? -1 : 1;
        }

        return linkA.peerNodeId - linkB.peerNodeId;
      });
  }, [nodeData, systemLinks]);

  const selectedEditableLink = useMemo(
    () =>
      editableLinks.find((link) => link.docId === selectedEditableLinkId) ?? null,
    [editableLinks, selectedEditableLinkId],
  );

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
  const currentTaxonomyDraft = useMemo(
    () => buildEditableTaxonomyDraft(experience.taxonomy),
    [
      experience.taxonomy?.category_id,
      experience.taxonomy?.id,
      experience.taxonomy?.specific_category_id,
      experience.taxonomy?.subcategory_id,
    ],
  );

  useEffect(() => {
    const nextTagIds = currentTagIdsKey ? currentTagIdsKey.split("|") : [];

    setEditableTagIds(nextTagIds);
    setSavedTagIds(nextTagIds);
    setSelectedTargetId("");
    setSelectedEditableLinkId("");
    setSelectedReplacementNodeId("");
    setSelectedTagId("");
  }, [currentTagIdsKey, nodeData?.id]);

  useEffect(() => {
    setSelectedReplacementNodeId("");
  }, [selectedEditableLinkId]);

  useEffect(() => {
    setEditableTaxonomyDraft(currentTaxonomyDraft);
    setSavedTaxonomyDraft(currentTaxonomyDraft);
    setTaxonomyDocumentId(experience.taxonomy?.id);
  }, [currentTaxonomyDraft, experience.taxonomy?.id, nodeData?.id]);

  useEffect(() => {
    if (!canManageGraph || !open) {
      return;
    }

    let cancelled = false;

    const loadEditorOptions = async () => {
      setIsLoadingEditorOptions(true);

      try {
        const [categoriesSnapshot, subcategoriesSnapshot] = await Promise.all([
          getDocs(collection(database, tableNameDB.categories)),
          getDocs(collection(database, tableNameDB.subCategory)),
        ]);

        if (cancelled) {
          return;
        }

        const taxonomyModel = buildTaxonomyEditorModel(
          categoriesSnapshot.docs.map((snapshot) => ({
            docId: snapshot.id,
            data: snapshot.data() as Record<string, unknown>,
          })),
          subcategoriesSnapshot.docs.map((snapshot) => ({
            docId: snapshot.id,
            data: snapshot.data() as Record<string, unknown>,
          })),
          isEnglish ? "en" : "es",
        );

        setTaxonomyCategories(taxonomyModel.categories);
        setTaxonomySubcategoriesByCategory(
          taxonomyModel.subcategoriesByCategory,
        );
      } catch (error) {
        console.error("No se pudieron cargar las opciones de taxonomía:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingEditorOptions(false);
        }
      }
    };

    void loadEditorOptions();

    return () => {
      cancelled = true;
    };
  }, [canManageGraph, isEnglish, open]);

  useEffect(() => {
    if (!canManageGraph || !nodeData || !nodeData.valueNodes) {
      setEditableNodeDraft(null);
      setInitialNodeDraft(null);
      return;
    }

    let cancelled = false;

    const loadNodeDraft = async () => {
      setIsLoadingNodeDraft(true);

      try {
        const nodeDocId = nodeData.docId ?? String(nodeData.id);
        const snapshot = await getDoc(doc(database, nodeData.valueNodes!, nodeDocId));
        const rawData = snapshot.exists()
          ? (snapshot.data() as Record<string, unknown>)
          : null;

        if (cancelled) {
          return;
        }

        const nextDraft = buildEditableNodeDraft(nodeData, rawData, isEnglish);
        setEditableNodeDraft(nextDraft);
        setInitialNodeDraft(nextDraft);
      } catch (error) {
        console.error("No se pudo cargar el documento editable del nodo:", error);

        if (cancelled) {
          return;
        }

        const fallbackDraft = buildEditableNodeDraft(nodeData, null, isEnglish);
        setEditableNodeDraft(fallbackDraft);
        setInitialNodeDraft(fallbackDraft);
      } finally {
        if (!cancelled) {
          setIsLoadingNodeDraft(false);
        }
      }
    };

    void loadNodeDraft();

    return () => {
      cancelled = true;
    };
  }, [canManageGraph, isEnglish, nodeData]);

  const allTabsById = useMemo(
    () => new Map(allTabs.map((tag) => [tag.id, tag])),
    [allTabs],
  );
  const activeTags = useMemo(
    () =>
      editableTagIds.map((tagId) => allTabsById.get(tagId) ?? { id: tagId, label: tagId }),
    [allTabsById, editableTagIds],
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

  const availableTagGroups = useMemo(
    () =>
      buildTabOptionGroups(allTabs, isEnglish ? "en" : "es")
        .map((group) => ({
          ...group,
          options: group.options.filter((tag) => !editableTagIds.includes(tag.id)),
        }))
        .filter((group) => group.options.length > 0),
    [allTabs, editableTagIds, isEnglish],
  );
  const categoryOptions = useMemo(
    () => ensureOptionExists(taxonomyCategories, editableTaxonomyDraft.category_id),
    [editableTaxonomyDraft.category_id, taxonomyCategories],
  );
  const filteredSubcategoryOptions = useMemo(() => {
    const selectedCategoryId = editableTaxonomyDraft.category_id;
    const scopedOptions = selectedCategoryId
      ? taxonomySubcategoriesByCategory[selectedCategoryId] ?? []
      : [];

    return ensureOptionExists(scopedOptions, editableTaxonomyDraft.subcategory_id);
  }, [
    editableTaxonomyDraft.category_id,
    editableTaxonomyDraft.subcategory_id,
    taxonomySubcategoriesByCategory,
  ]);
  const selectedSubcategoryOption = useMemo(
    () =>
      filteredSubcategoryOptions.find(
        (option) => option.id === editableTaxonomyDraft.subcategory_id,
      ) ?? null,
    [editableTaxonomyDraft.subcategory_id, filteredSubcategoryOptions],
  );
  const specificCategoryOptions = useMemo(
    () =>
      ensureOptionExists(
        selectedSubcategoryOption?.specificOptions ?? [],
        editableTaxonomyDraft.specific_category_id,
      ),
    [editableTaxonomyDraft.specific_category_id, selectedSubcategoryOption?.specificOptions],
  );

  useEffect(() => {
    if (!editableTaxonomyDraft.subcategory_id) {
      return;
    }

    if (
      filteredSubcategoryOptions.length > 0 &&
      !filteredSubcategoryOptions.some(
        (option) => option.id === editableTaxonomyDraft.subcategory_id,
      )
    ) {
      setEditableTaxonomyDraft((current) => ({
        ...current,
        subcategory_id: "",
        specific_category_id: "",
      }));
    }
  }, [editableTaxonomyDraft.subcategory_id, filteredSubcategoryOptions]);

  useEffect(() => {
    if (!editableTaxonomyDraft.specific_category_id || specificCategoryOptions.length === 0) {
      return;
    }

    if (
      !specificCategoryOptions.some(
        (option) => option.id === editableTaxonomyDraft.specific_category_id,
      )
    ) {
      setEditableTaxonomyDraft((current) => ({
        ...current,
        specific_category_id: "",
      }));
    }
  }, [editableTaxonomyDraft.specific_category_id, specificCategoryOptions]);

  const hasNodeDraftChanges = useMemo(
    () =>
      Boolean(
        editableNodeDraft &&
          initialNodeDraft &&
          JSON.stringify(editableNodeDraft) !== JSON.stringify(initialNodeDraft),
      ),
    [editableNodeDraft, initialNodeDraft],
  );
  const hasTaxonomyChanges = useMemo(
    () =>
      editableTaxonomyDraft.category_id !== savedTaxonomyDraft.category_id ||
      editableTaxonomyDraft.subcategory_id !== savedTaxonomyDraft.subcategory_id ||
      editableTaxonomyDraft.specific_category_id !==
        savedTaxonomyDraft.specific_category_id ||
      !areStringArraysEqual(editableTagIds, savedTagIds),
    [editableTagIds, editableTaxonomyDraft, savedTagIds, savedTaxonomyDraft],
  );

  const formatNodeLabel = (node: NodeViewData) =>
    canSeeNodeIds
      ? `${node.id}. ${capitalizeFirstLetter(node.name)}`
      : capitalizeFirstLetter(node.name);

  const formatEditableLinkLabel = (link: EditableSystemLink) => {
    const peerNode = systemNodes.find((node) => node.id === link.peerNodeId);
    const peerLabel = peerNode
      ? formatNodeLabel(peerNode)
      : `${t(CONNECTION_TEXT + "node")} ${link.peerNodeId}`;
    const directionLabel =
      link.direction === "outgoing"
        ? t(CONNECTION_TEXT + "outgoingLinkShort")
        : t(CONNECTION_TEXT + "incomingLinkShort");

    return `${directionLabel}: ${peerLabel}`;
  };

  const formatOptionLabel = (value: string) =>
    capitalizeFirstLetter(value.replace(/_/g, " "));

  const syncNodeInStore = (nextNodeData: NodeViewData) => {
    if (!nodeData) {
      return;
    }

    useUIStore.setState((state) => ({
      documentsFirestore: state.documentsFirestore.map((node) => {
        const matchesDocId =
          Boolean(node.docId) &&
          Boolean(nodeData.docId) &&
          node.docId === nodeData.docId &&
          node.valueNodes === nodeData.valueNodes;
        const matchesNodeId =
          !nodeData.docId &&
          node.id === nodeData.id &&
          node.valueNodes === nodeData.valueNodes;

        return matchesDocId || matchesNodeId ? { ...node, ...nextNodeData } : node;
      }),
      nodeViewData:
        state.nodeViewData &&
        ((Boolean(state.nodeViewData.docId) &&
          Boolean(nodeData.docId) &&
          state.nodeViewData.docId === nodeData.docId &&
          state.nodeViewData.valueNodes === nodeData.valueNodes) ||
          (!nodeData.docId &&
            state.nodeViewData.id === nodeData.id &&
            state.nodeViewData.valueNodes === nodeData.valueNodes))
          ? nextNodeData
          : state.nodeViewData,
    }));
  };

  const saveNodeDetails = async () => {
    if (!nodeData?.valueNodes || !editableNodeDraft || !initialNodeDraft) {
      return;
    }

    if (!editableNodeDraft.name_es.trim() && !editableNodeDraft.name_en.trim()) {
      triggerAlert(t(CONNECTION_TEXT + "nodeNameRequired"), "warning");
      return;
    }

    if (!editableNodeDraft.videoid.trim()) {
      triggerAlert(t(CONNECTION_TEXT + "nodeVideoRequired"), "warning");
      return;
    }

    const nextPayload = buildNodeUpdatePayload(initialNodeDraft, editableNodeDraft);

    if (Object.keys(nextPayload).length === 0) {
      return;
    }

    setIsSavingNodeDetails(true);

    try {
      const nodeDocId = nodeData.docId ?? String(nodeData.id);

      await setDoc(
        doc(database, nodeData.valueNodes, nodeDocId),
        {
          ...nextPayload,
          updatedBy: user?.email ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      const nextNodeData = buildLocalizedNodeData(
        nodeData,
        editableNodeDraft,
        editableTaxonomyDraft,
        isEnglish,
      );

      syncNodeInStore(nextNodeData);
      setInitialNodeDraft(editableNodeDraft);
      refreshGraphData();
      triggerAlert(t(CONNECTION_TEXT + "nodeSaved"), "success");
    } catch (error) {
      console.error("No se pudieron guardar los datos del nodo:", error);
      triggerAlert(t(CONNECTION_TEXT + "nodeSaveError"), "error");
    } finally {
      setIsSavingNodeDetails(false);
    }
  };

  const saveTaxonomyDetails = async () => {
    if (!nodeData?.valueNodes) {
      return;
    }

    if (
      editableTaxonomyDraft.subcategory_id &&
      !editableTaxonomyDraft.category_id
    ) {
      triggerAlert(t(CONNECTION_TEXT + "categoryRequiredForSubcategory"), "warning");
      return;
    }

    if (
      editableTaxonomyDraft.specific_category_id &&
      !editableTaxonomyDraft.subcategory_id
    ) {
      triggerAlert(
        t(CONNECTION_TEXT + "subcategoryRequiredForSpecificCategory"),
        "warning",
      );
      return;
    }

    const nextTagIds = Array.from(
      new Set(editableTagIds.map((tagId) => tagId.trim()).filter(Boolean)),
    );
    const tagsPath = nodeData.valueNodes.replace("/nodes", "/tabs");
    const nextTaxonomy = buildTaxonomyDocument(
      nodeData,
      nextTagIds,
      taxonomyDocumentId,
      editableTaxonomyDraft.category_id,
      editableTaxonomyDraft.subcategory_id,
      editableTaxonomyDraft.specific_category_id,
    );

    setIsSavingTaxonomy(true);

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
      setTaxonomyDocumentId(nextTaxonomy.id);
      setSavedTaxonomyDraft(editableTaxonomyDraft);
      setSavedTagIds(nextTagIds);
      setEditableTagIds(nextTagIds);
      setSelectedTagId("");

      const nextNodeData = editableNodeDraft
        ? buildLocalizedNodeData(nodeData, editableNodeDraft, editableTaxonomyDraft, isEnglish)
        : {
            ...nodeData,
            color: resolveNodeColor(
              editableTaxonomyDraft.category_id,
              nodeData.group ?? "",
            ),
          };

      syncNodeInStore(nextNodeData);
      refreshGraphData();
      triggerAlert(t(CONNECTION_TEXT + "taxonomySaved"), "success");
    } catch (error) {
      console.error("No se pudo actualizar la taxonomía del nodo:", error);
      triggerAlert(t(CONNECTION_TEXT + "taxonomySaveError"), "error");
    } finally {
      setIsSavingTaxonomy(false);
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

  const updateExistingConnection = async () => {
    if (
      !nodeData ||
      !nodeData.valueLinks ||
      !canManageExistingLinks ||
      !selectedEditableLink
    ) {
      triggerAlert(t(CONNECTION_TEXT + "selectLinkFirst"), "warning");
      return;
    }

    const parsedReplacementId = Number(selectedReplacementNodeId);

    if (
      !selectedReplacementNodeId ||
      !Number.isFinite(parsedReplacementId)
    ) {
      triggerAlert(t(CONNECTION_TEXT + "selectReplacementNodeFirst"), "warning");
      return;
    }

    const nextSourceId =
      selectedEditableLink.direction === "outgoing"
        ? nodeData.id
        : parsedReplacementId;
    const nextTargetId =
      selectedEditableLink.direction === "outgoing"
        ? parsedReplacementId
        : nodeData.id;
    const nextDocId = `${nextSourceId}_${nextTargetId}`;

    if (
      nextSourceId === selectedEditableLink.sourceId &&
      nextTargetId === selectedEditableLink.targetId
    ) {
      triggerAlert(t(CONNECTION_TEXT + "linkUpdateUnchanged"), "info");
      return;
    }

    const hasExistingLink = systemLinks.some((link) => {
      const sourceId = getLinkEndpointId(link.source);
      const targetId = getLinkEndpointId(link.target);
      const currentDocId = buildLinkDocId(link.source, link.target, link.docId);

      return (
        currentDocId !== selectedEditableLink.docId &&
        sourceId === nextSourceId &&
        targetId === nextTargetId
      );
    });

    if (hasExistingLink) {
      triggerAlert(t(CONNECTION_TEXT + "linkAlreadyExists"), "info");
      return;
    }

    setIsSavingLinkMutation(true);

    try {
      await setDoc(
        doc(database, nodeData.valueLinks, nextDocId),
        {
          source: nextSourceId,
          target: nextTargetId,
          systemLabel: nodeData.systemLabel ?? "",
          updatedBy: user?.email ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      if (selectedEditableLink.docId !== nextDocId) {
        await deleteDoc(doc(database, nodeData.valueLinks, selectedEditableLink.docId));
      }

      useUIStore.setState((state) => ({
        linksData: [
          ...state.linksData.filter((link) => {
            const currentDocId = buildLinkDocId(link.source, link.target, link.docId);

            return !(
              link.valueLinks === nodeData.valueLinks &&
              currentDocId === selectedEditableLink.docId
            );
          }),
          {
            docId: nextDocId,
            valueLinks: nodeData.valueLinks,
            systemLabel: nodeData.systemLabel,
            source: nextSourceId,
            target: nextTargetId,
          },
        ],
      }));

      refreshGraphData();
      setSelectedEditableLinkId(nextDocId);
      setSelectedReplacementNodeId("");
      triggerAlert(t(CONNECTION_TEXT + "linkUpdated"), "success");
    } catch (error) {
      console.error("No se pudo actualizar la conexión:", error);
      triggerAlert(t(CONNECTION_TEXT + "linkUpdateError"), "error");
    } finally {
      setIsSavingLinkMutation(false);
    }
  };

  const deleteExistingConnection = async () => {
    if (
      !nodeData ||
      !nodeData.valueLinks ||
      !canManageExistingLinks ||
      !selectedEditableLink
    ) {
      triggerAlert(t(CONNECTION_TEXT + "selectLinkFirst"), "warning");
      return;
    }

    setIsSavingLinkMutation(true);

    try {
      await deleteDoc(doc(database, nodeData.valueLinks, selectedEditableLink.docId));

      useUIStore.setState((state) => ({
        linksData: state.linksData.filter((link) => {
          const currentDocId = buildLinkDocId(link.source, link.target, link.docId);

          return !(
            link.valueLinks === nodeData.valueLinks &&
            currentDocId === selectedEditableLink.docId
          );
        }),
      }));

      refreshGraphData();
      setSelectedEditableLinkId("");
      setSelectedReplacementNodeId("");
      triggerAlert(t(CONNECTION_TEXT + "linkDeleted"), "success");
    } catch (error) {
      console.error("No se pudo eliminar la conexión:", error);
      triggerAlert(t(CONNECTION_TEXT + "linkDeleteError"), "error");
    } finally {
      setIsSavingLinkMutation(false);
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
          {t(CONNECTION_TEXT + "nodeEditorTitle")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
          {t(CONNECTION_TEXT + "nodeEditorDescription")}
        </Typography>

        {isLoadingNodeDraft ? (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
            {t(CONNECTION_TEXT + "loadingNodeEditor")}
          </Typography>
        ) : null}

        {editableNodeDraft ? (
          <Stack spacing={1.25}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 1,
              }}
            >
              <TextField
                label={t(CONNECTION_TEXT + "nodeIdLabel")}
                size="small"
                value={nodeData?.id ?? ""}
                disabled
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodeDocumentLabel")}
                size="small"
                value={nodeData?.docId ?? String(nodeData?.id ?? "")}
                disabled
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodeNameEsLabel")}
                size="small"
                value={editableNodeDraft.name_es}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, name_es: event.target.value }
                      : current,
                  )
                }
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodeNameEnLabel")}
                size="small"
                value={editableNodeDraft.name_en}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, name_en: event.target.value }
                      : current,
                  )
                }
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodeGroupLabel")}
                size="small"
                value={editableNodeDraft.group}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, group: event.target.value }
                      : current,
                  )
                }
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodeVideoLabel")}
                size="small"
                value={editableNodeDraft.videoid}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, videoid: event.target.value }
                      : current,
                  )
                }
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 1,
              }}
            >
              <TextField
                label={t(CONNECTION_TEXT + "nodeSummaryEsLabel")}
                size="small"
                multiline
                minRows={3}
                value={editableNodeDraft.descrip_es_summary}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, descrip_es_summary: event.target.value }
                      : current,
                  )
                }
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodeSummaryEnLabel")}
                size="small"
                multiline
                minRows={3}
                value={editableNodeDraft.descrip_en_summary}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, descrip_en_summary: event.target.value }
                      : current,
                  )
                }
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodePointsEsLabel")}
                size="small"
                multiline
                minRows={4}
                helperText={t(CONNECTION_TEXT + "nodePointsHelper")}
                value={editableNodeDraft.descrip_es_points}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, descrip_es_points: event.target.value }
                      : current,
                  )
                }
              />
              <TextField
                label={t(CONNECTION_TEXT + "nodePointsEnLabel")}
                size="small"
                multiline
                minRows={4}
                helperText={t(CONNECTION_TEXT + "nodePointsHelper")}
                value={editableNodeDraft.descrip_en_points}
                onChange={(event) =>
                  setEditableNodeDraft((current) =>
                    current
                      ? { ...current, descrip_en_points: event.target.value }
                      : current,
                  )
                }
              />
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                disabled={!hasNodeDraftChanges || isSavingNodeDetails || isLoadingNodeDraft}
                onClick={() => void saveNodeDetails()}
              >
                {t(CONNECTION_TEXT + "saveNodeButton")}
              </Button>
              <Button
                variant="text"
                disabled={!editableNodeDraft || !initialNodeDraft || isSavingNodeDetails}
                onClick={() => {
                  if (!initialNodeDraft) {
                    return;
                  }

                  setEditableNodeDraft(initialNodeDraft);
                }}
              >
                {t(CONNECTION_TEXT + "resetNodeButton")}
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Box>

      <Box
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.outlineVariant}`,
          p: 1.5,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.4 }}>
          {t(CONNECTION_TEXT + "taxonomyEditorTitle")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
          {t(CONNECTION_TEXT + "taxonomyEditorDescription")}
        </Typography>

        {isLoadingEditorOptions ? (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
            {t(CONNECTION_TEXT + "loadingTaxonomyOptions")}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 1,
            mb: 1.25,
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="node-category-select-label">
              {t(CONNECTION_TEXT + "nodeCategoryLabel")}
            </InputLabel>
            <Select
              labelId="node-category-select-label"
              value={editableTaxonomyDraft.category_id}
              label={t(CONNECTION_TEXT + "nodeCategoryLabel")}
              onChange={(event) =>
                setEditableTaxonomyDraft((current) => ({
                  ...current,
                  category_id: String(event.target.value),
                  subcategory_id: "",
                  specific_category_id: "",
                }))
              }
            >
              <MenuItem value="">{t(CONNECTION_TEXT + "unassignedOption")}</MenuItem>
              {categoryOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {formatOptionLabel(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="node-subcategory-select-label">
              {t(CONNECTION_TEXT + "nodeSubcategoryLabel")}
            </InputLabel>
            <Select
              labelId="node-subcategory-select-label"
              value={editableTaxonomyDraft.subcategory_id}
              label={t(CONNECTION_TEXT + "nodeSubcategoryLabel")}
              onChange={(event) =>
                setEditableTaxonomyDraft((current) => ({
                  ...current,
                  subcategory_id: String(event.target.value),
                  specific_category_id: "",
                }))
              }
            >
              <MenuItem value="">{t(CONNECTION_TEXT + "unassignedOption")}</MenuItem>
              {filteredSubcategoryOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {formatOptionLabel(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="node-specific-category-select-label">
              {t(CONNECTION_TEXT + "nodeSpecificCategoryLabel")}
            </InputLabel>
            <Select
              labelId="node-specific-category-select-label"
              value={editableTaxonomyDraft.specific_category_id}
              label={t(CONNECTION_TEXT + "nodeSpecificCategoryLabel")}
              onChange={(event) =>
                setEditableTaxonomyDraft((current) => ({
                  ...current,
                  specific_category_id: String(event.target.value),
                }))
              }
              disabled={
                !editableTaxonomyDraft.subcategory_id &&
                !editableTaxonomyDraft.specific_category_id
              }
            >
              <MenuItem value="">{t(CONNECTION_TEXT + "unassignedOption")}</MenuItem>
              {specificCategoryOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {formatOptionLabel(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.outlineVariant}`,
            p: 1.25,
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
                  isEnglish ? tag.title_en || tag.label : tag.title_es || tag.label,
                )}
                onDelete={() =>
                  setEditableTagIds((current) =>
                    current.filter((tagId) => tagId !== tag.id),
                  )
                }
                disabled={isSavingTaxonomy}
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
                {availableTagGroups.flatMap((group) => [
                  <ListSubheader key={`${group.id}-header`} disableSticky>
                    {group.label}
                  </ListSubheader>,
                  ...group.options.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {capitalizeFirstLetter(
                        isEnglish ? tag.title_en || tag.label : tag.title_es || tag.label,
                      )}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              disabled={!selectedTagId || isSavingTaxonomy}
              onClick={() => {
                if (!selectedTagId || editableTagIds.includes(selectedTagId)) {
                  return;
                }

                setEditableTagIds((current) => [...current, selectedTagId]);
                setSelectedTagId("");
              }}
            >
              {t(CONNECTION_TEXT + "addTag")}
            </Button>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.25 }}>
          <Button
            variant="contained"
            startIcon={<EditRoundedIcon />}
            disabled={isSavingTaxonomy || !hasTaxonomyChanges}
            onClick={() => void saveTaxonomyDetails()}
          >
            {t(CONNECTION_TEXT + "saveTaxonomyButton")}
          </Button>
          <Button
            variant="text"
            disabled={isSavingTaxonomy}
            onClick={() => {
              setEditableTaxonomyDraft(savedTaxonomyDraft);
              setEditableTagIds(savedTagIds);
              setSelectedTagId("");
            }}
          >
            {t(CONNECTION_TEXT + "resetTaxonomyButton")}
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

      {canManageExistingLinks ? (
        <Box
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.outlineVariant}`,
            p: 1.5,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.4 }}>
            {t(CONNECTION_TEXT + "linksEditorTitle")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
            {t(CONNECTION_TEXT + "linksEditorDescription")}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="existing-link-select-label">
                {t(CONNECTION_TEXT + "existingLinksLabel")}
              </InputLabel>
              <Select
                labelId="existing-link-select-label"
                value={selectedEditableLinkId}
                label={t(CONNECTION_TEXT + "existingLinksLabel")}
                onChange={(event) =>
                  setSelectedEditableLinkId(String(event.target.value))
                }
              >
                {editableLinks.map((link) => (
                  <MenuItem key={link.docId} value={link.docId}>
                    {formatEditableLinkLabel(link)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="replacement-node-select-label">
                {t(CONNECTION_TEXT + "replacementNodeLabel")}
              </InputLabel>
              <Select
                labelId="replacement-node-select-label"
                value={selectedReplacementNodeId}
                label={t(CONNECTION_TEXT + "replacementNodeLabel")}
                onChange={(event) =>
                  setSelectedReplacementNodeId(String(event.target.value))
                }
                disabled={!selectedEditableLink || editableLinks.length === 0}
              >
                {availableTargetNodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {formatNodeLabel(node)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { sm: "center" } }}
          >
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              disabled={
                !selectedEditableLinkId ||
                !selectedReplacementNodeId ||
                isSavingLinkMutation
              }
              onClick={() => void updateExistingConnection()}
            >
              {t(CONNECTION_TEXT + "updateLink")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              disabled={!selectedEditableLinkId || isSavingLinkMutation}
              onClick={() => void deleteExistingConnection()}
            >
              {t(CONNECTION_TEXT + "deleteLink")}
            </Button>
          </Stack>

          {editableLinks.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.2 }}>
              {t(CONNECTION_TEXT + "noEditableLinks")}
            </Typography>
          ) : null}
        </Box>
      ) : null}
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
