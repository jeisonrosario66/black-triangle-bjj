import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";

import type { NodeViewData } from "@src/context";
import type { NodeTaxonomy } from "@bt/shared/context";
import { database, primeNodeTaxonomyCache, useAllTabs, useSession } from "@src/hooks";
import { capitalizeFirstLetter } from "@src/utils";
import {
  buildTabOptionGroups,
  buildTaxonomyEditorModel,
  type TaxonomyOption,
} from "@src/utils/nodeEditorTaxonomy";
import {
  areStringArraysEqual,
  buildEditableNodeDraft,
  buildEditableTaxonomyDraft,
  buildLocalizedNodeData,
  buildNodeUpdatePayload,
  buildTaxonomyDocument,
  EMPTY_TAXONOMY_DRAFT,
  ensureOptionExists,
  type EditableNodeDraft,
  type EditableTaxonomyDraft,
} from "@src/utils/nodeEditorState";
import { tableNameDB } from "@src/context";
import { useUIStore } from "@src/store";

const CONNECTION_TEXT = "components.nodeConnectionViewer.";

type NodeMetadataEditorPanelProps = {
  nodeData: NodeViewData;
  taxonomy: NodeTaxonomy | null;
  onNodeUpdated?: (nextNode: NodeViewData) => void;
};

export default function NodeMetadataEditorPanel({
  nodeData,
  taxonomy,
  onNodeUpdated,
}: NodeMetadataEditorPanelProps) {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const triggerAlert = useUIStore((state) => state.triggerAlert);
  const refreshGraphData = useUIStore((state) => state.refreshGraphData);
  const allTabs = useAllTabs();
  const isEnglish = i18n.language.startsWith("en");
  const [isLoadingNodeDraft, setIsLoadingNodeDraft] = useState(true);
  const [isLoadingEditorOptions, setIsLoadingEditorOptions] = useState(true);
  const [isSavingNodeDetails, setIsSavingNodeDetails] = useState(false);
  const [isSavingTaxonomy, setIsSavingTaxonomy] = useState(false);
  const [editableNodeDraft, setEditableNodeDraft] = useState<EditableNodeDraft | null>(null);
  const [initialNodeDraft, setInitialNodeDraft] = useState<EditableNodeDraft | null>(null);
  const [editableTaxonomyDraft, setEditableTaxonomyDraft] = useState<EditableTaxonomyDraft>(
    EMPTY_TAXONOMY_DRAFT,
  );
  const [savedTaxonomyDraft, setSavedTaxonomyDraft] = useState<EditableTaxonomyDraft>(
    EMPTY_TAXONOMY_DRAFT,
  );
  const [editableTagIds, setEditableTagIds] = useState<string[]>([]);
  const [savedTagIds, setSavedTagIds] = useState<string[]>([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [taxonomyDocumentId, setTaxonomyDocumentId] = useState<string>();
  const [taxonomyCategories, setTaxonomyCategories] = useState<TaxonomyOption[]>([]);
  const [taxonomySubcategoriesByCategory, setTaxonomySubcategoriesByCategory] =
    useState<Record<string, TaxonomyOption[]>>({});

  useEffect(() => {
    setEditableTaxonomyDraft(buildEditableTaxonomyDraft(taxonomy));
    setSavedTaxonomyDraft(buildEditableTaxonomyDraft(taxonomy));
    setEditableTagIds(taxonomy?.tab_ids ?? []);
    setSavedTagIds(taxonomy?.tab_ids ?? []);
    setTaxonomyDocumentId(taxonomy?.id);
    setSelectedTagId("");
  }, [taxonomy]);

  useEffect(() => {
    let cancelled = false;

    const loadEditorOptions = async () => {
      setIsLoadingEditorOptions(true);

      try {
        const [categoriesSnapshot, subcategoriesSnapshot, specificSnapshot] = await Promise.all([
          getDocs(collection(database, tableNameDB.categories)),
          getDocs(collectionGroup(database, tableNameDB.subCategory)),
          getDocs(collectionGroup(database, "items")),
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
            data: {
              ...(snapshot.data() as Record<string, unknown>),
              parent_id:
                (snapshot.ref.parent.parent?.id as string | undefined) ?? "",
            },
          })),
          specificSnapshot.docs.map((snapshot) => ({
            docId: snapshot.id,
            data: {
              ...(snapshot.data() as Record<string, unknown>),
              parent_id:
                (snapshot.ref.parent.parent?.id as string | undefined) ?? "",
            },
          })),
          isEnglish ? "en" : "es",
        );

        setTaxonomyCategories(taxonomyModel.categories);
        setTaxonomySubcategoriesByCategory(taxonomyModel.subcategoriesByCategory);
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
  }, [isEnglish]);

  useEffect(() => {
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
  }, [isEnglish, nodeData]);

  const allTabsById = useMemo(
    () => new Map(allTabs.map((tag) => [tag.id, tag])),
    [allTabs],
  );
  const activeTagItems = useMemo(
    () =>
      editableTagIds.map((tagId) => allTabsById.get(tagId) ?? { id: tagId, label: tagId }),
    [allTabsById, editableTagIds],
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
    const scopedOptions = editableTaxonomyDraft.category_id
      ? taxonomySubcategoriesByCategory[editableTaxonomyDraft.category_id] ?? []
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

  const syncNodeInStore = (nextNodeData: NodeViewData) => {
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
    if (!nodeData.valueNodes || !editableNodeDraft || !initialNodeDraft) {
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
      onNodeUpdated?.(nextNodeData);
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
    if (!nodeData.valueNodes) {
      return;
    }

    if (editableTaxonomyDraft.subcategory_id && !editableTaxonomyDraft.category_id) {
      triggerAlert(t(CONNECTION_TEXT + "categoryRequiredForSubcategory"), "warning");
      return;
    }

    if (editableTaxonomyDraft.specific_category_id && !editableTaxonomyDraft.subcategory_id) {
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
        : nodeData;

      syncNodeInStore(nextNodeData);
      onNodeUpdated?.(nextNodeData);
      refreshGraphData();
      triggerAlert(t(CONNECTION_TEXT + "taxonomySaved"), "success");
    } catch (error) {
      console.error("No se pudo actualizar la taxonomía del nodo:", error);
      triggerAlert(t(CONNECTION_TEXT + "taxonomySaveError"), "error");
    } finally {
      setIsSavingTaxonomy(false);
    }
  };

  if (isLoadingNodeDraft || !editableNodeDraft) {
    return (
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        mt: 3,
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.outlineVariant}`,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t(CONNECTION_TEXT + "nodeEditorTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(CONNECTION_TEXT + "nodeEditorDescription")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 1,
          }}
        >
          <TextField label={t(CONNECTION_TEXT + "nodeIdLabel")} size="small" value={nodeData.id} disabled />
          <TextField
            label={t(CONNECTION_TEXT + "nodeDocumentLabel")}
            size="small"
            value={nodeData.docId ?? String(nodeData.id)}
            disabled
          />
          <TextField
            label={t(CONNECTION_TEXT + "nodeNameEsLabel")}
            size="small"
            value={editableNodeDraft.name_es}
            onChange={(event) =>
              setEditableNodeDraft((current) =>
                current ? { ...current, name_es: event.target.value } : current,
              )
            }
          />
          <TextField
            label={t(CONNECTION_TEXT + "nodeNameEnLabel")}
            size="small"
            value={editableNodeDraft.name_en}
            onChange={(event) =>
              setEditableNodeDraft((current) =>
                current ? { ...current, name_en: event.target.value } : current,
              )
            }
          />
          <TextField
            label={t(CONNECTION_TEXT + "nodeGroupLabel")}
            size="small"
            value={editableNodeDraft.group}
            onChange={(event) =>
              setEditableNodeDraft((current) =>
                current ? { ...current, group: event.target.value } : current,
              )
            }
          />
          <TextField
            label={t(CONNECTION_TEXT + "nodeVideoLabel")}
            size="small"
            value={editableNodeDraft.videoid}
            onChange={(event) =>
              setEditableNodeDraft((current) =>
                current ? { ...current, videoid: event.target.value } : current,
              )
            }
          />
          <TextField
            label={t(CONNECTION_TEXT + "nodeSubtitleEsLabel")}
            size="small"
            value={editableNodeDraft.subtitleEs}
            onChange={(event) =>
              setEditableNodeDraft((current) =>
                current ? { ...current, subtitleEs: event.target.value } : current,
              )
            }
          />
          <TextField
            label={t(CONNECTION_TEXT + "nodeSubtitleEnLabel")}
            size="small"
            value={editableNodeDraft.subtitleEn}
            onChange={(event) =>
              setEditableNodeDraft((current) =>
                current ? { ...current, subtitleEn: event.target.value } : current,
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
                current ? { ...current, descrip_es_summary: event.target.value } : current,
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
                current ? { ...current, descrip_en_summary: event.target.value } : current,
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
                current ? { ...current, descrip_es_points: event.target.value } : current,
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
                current ? { ...current, descrip_en_points: event.target.value } : current,
              )
            }
          />
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            onClick={() => void saveNodeDetails()}
            disabled={isSavingNodeDetails || !hasNodeDraftChanges}
          >
            {t(CONNECTION_TEXT + "saveNodeButton")}
          </Button>
          <Button
            variant="text"
            onClick={() => editableNodeDraft && initialNodeDraft && setEditableNodeDraft(initialNodeDraft)}
            disabled={isSavingNodeDetails || !hasNodeDraftChanges}
          >
            {t(CONNECTION_TEXT + "resetNodeButton")}
          </Button>
        </Stack>

        <Box
          sx={(theme) => ({
            pt: 1,
            borderTop: `1px solid ${theme.palette.outlineVariant}`,
          })}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.4 }}>
            {t(CONNECTION_TEXT + "taxonomyEditorTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
            {t(CONNECTION_TEXT + "taxonomyEditorDescription")}
          </Typography>
          {isLoadingEditorOptions ? (
            <Typography variant="body2" color="text.secondary">
              {t(CONNECTION_TEXT + "loadingTaxonomyOptions")}
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 1,
              }}
            >
              <FormControl size="small">
                <InputLabel id="system-editor-category-label">
                  {t(CONNECTION_TEXT + "nodeCategoryLabel")}
                </InputLabel>
                <Select
                  labelId="system-editor-category-label"
                  label={t(CONNECTION_TEXT + "nodeCategoryLabel")}
                  value={editableTaxonomyDraft.category_id}
                  onChange={(event) =>
                    setEditableTaxonomyDraft((current) => ({
                      ...current,
                      category_id: event.target.value,
                      subcategory_id:
                        current.category_id === event.target.value
                          ? current.subcategory_id
                          : "",
                      specific_category_id:
                        current.category_id === event.target.value
                          ? current.specific_category_id
                          : "",
                    }))
                  }
                >
                  <MenuItem value="">
                    {t(CONNECTION_TEXT + "unassignedOption")}
                  </MenuItem>
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {capitalizeFirstLetter(option.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="system-editor-subcategory-label">
                  {t(CONNECTION_TEXT + "nodeSubcategoryLabel")}
                </InputLabel>
                <Select
                  labelId="system-editor-subcategory-label"
                  label={t(CONNECTION_TEXT + "nodeSubcategoryLabel")}
                  value={editableTaxonomyDraft.subcategory_id}
                  onChange={(event) =>
                    setEditableTaxonomyDraft((current) => ({
                      ...current,
                      subcategory_id: event.target.value,
                      specific_category_id:
                        current.subcategory_id === event.target.value
                          ? current.specific_category_id
                          : "",
                    }))
                  }
                >
                  <MenuItem value="">
                    {t(CONNECTION_TEXT + "unassignedOption")}
                  </MenuItem>
                  {filteredSubcategoryOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {capitalizeFirstLetter(option.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="system-editor-specific-label">
                  {t(CONNECTION_TEXT + "nodeSpecificCategoryLabel")}
                </InputLabel>
                <Select
                  labelId="system-editor-specific-label"
                  label={t(CONNECTION_TEXT + "nodeSpecificCategoryLabel")}
                  value={editableTaxonomyDraft.specific_category_id}
                  onChange={(event) =>
                    setEditableTaxonomyDraft((current) => ({
                      ...current,
                      specific_category_id: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="">
                    {t(CONNECTION_TEXT + "specificCategoryPlaceholder")}
                  </MenuItem>
                  {specificCategoryOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {capitalizeFirstLetter(option.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1.6, mb: 0.8 }}>
            {t(CONNECTION_TEXT + "tagsEditorTitle")}
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="system-editor-tag-label">
              {t(CONNECTION_TEXT + "availableTagsLabel")}
            </InputLabel>
            <Select
              labelId="system-editor-tag-label"
              label={t(CONNECTION_TEXT + "availableTagsLabel")}
              value={selectedTagId}
              onChange={(event) => setSelectedTagId(event.target.value)}
            >
              {availableTagGroups.map((group) => [
                <ListSubheader key={`${group.label}-header`}>
                  {capitalizeFirstLetter(group.label)}
                </ListSubheader>,
                ...group.options.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {capitalizeFirstLetter(tag.label)}
                  </MenuItem>
                )),
              ])}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.1 }}>
            {activeTagItems.map((tag) => (
              <Chip
                key={tag.id}
                label={capitalizeFirstLetter(
                  isEnglish ? tag.title_en || tag.label : tag.title_es || tag.label,
                )}
                color="success"
                variant="outlined"
                onDelete={() =>
                  setEditableTagIds((current) => current.filter((tagId) => tagId !== tag.id))
                }
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.3 }}>
            <Button
              variant="outlined"
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
            <Button
              variant="contained"
              color="secondary"
              onClick={() => void saveTaxonomyDetails()}
              disabled={isSavingTaxonomy || !hasTaxonomyChanges}
            >
              {t(CONNECTION_TEXT + "saveTaxonomyButton")}
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setEditableTaxonomyDraft(savedTaxonomyDraft);
                setEditableTagIds(savedTagIds);
              }}
              disabled={isSavingTaxonomy || !hasTaxonomyChanges}
            >
              {t(CONNECTION_TEXT + "resetTaxonomyButton")}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
