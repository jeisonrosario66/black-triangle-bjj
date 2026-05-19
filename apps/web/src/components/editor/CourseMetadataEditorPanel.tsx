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
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";

import type { NodeOptionFirestore, SystemCardUI } from "@bt/shared/context";
import { database, useAllTabs, useSession } from "@src/hooks";
import { tableNameDB } from "@src/context";
import { buildTabOptionGroups } from "@src/utils/nodeEditorTaxonomy";
import { capitalizeFirstLetter } from "@src/utils";
import { useUIStore } from "@src/store";

const PANEL_TEXT = "components.courseDetail.";

type CourseMetadataEditorPanelProps = {
  system: SystemCardUI;
  modules: NodeOptionFirestore[];
  onSystemUpdated?: (nextSystem: SystemCardUI) => void;
};

type CourseDraft = Partial<{
  name_es: string;
  name_en: string;
  descrip_es: string;
  descrip_en: string;
  coach: string;
  coverUrl: string;
}>;

const EDITABLE_COURSE_KEYS: Array<keyof CourseDraft> = [
  "name_es",
  "name_en",
  "descrip_es",
  "descrip_en",
  "coach",
  "coverUrl",
];

const hasChanged = (initialDraft: CourseDraft, currentDraft: CourseDraft) =>
  EDITABLE_COURSE_KEYS.some((field) => (initialDraft[field] ?? "") !== (currentDraft[field] ?? ""));

export default function CourseMetadataEditorPanel({
  system,
  modules,
  onSystemUpdated,
}: CourseMetadataEditorPanelProps) {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const triggerAlert = useUIStore((state) => state.triggerAlert);
  const refreshGraphData = useUIStore((state) => state.refreshGraphData);
  const allTabs = useAllTabs();
  const isEnglish = i18n.language.startsWith("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingTabs, setIsApplyingTabs] = useState(false);
  const [courseDocPath, setCourseDocPath] = useState<string | null>(null);
  const [initialDraft, setInitialDraft] = useState<CourseDraft>({});
  const [draft, setDraft] = useState<CourseDraft>({});
  const [availableFields, setAvailableFields] = useState<Array<keyof CourseDraft>>([]);
  const [selectedBulkTagId, setSelectedBulkTagId] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCourseDraft = async () => {
      setIsLoading(true);

      try {
        const snapshot = await getDocs(
          query(
            collection(database, tableNameDB.systemsCollections),
            where("label", "==", system.label),
          ),
        );
        const courseDoc = snapshot.docs[0];

        if (!courseDoc || cancelled) {
          return;
        }

        const rawData = courseDoc.data() as Record<string, unknown>;
        const nextFields = EDITABLE_COURSE_KEYS.filter((field) => field in rawData);
        const nextDraft = nextFields.reduce<CourseDraft>((accumulator, field) => ({
          ...accumulator,
          [field]: typeof rawData[field] === "string" ? String(rawData[field]) : "",
        }), {});

        setCourseDocPath(courseDoc.ref.path);
        setAvailableFields(nextFields);
        setInitialDraft(nextDraft);
        setDraft(nextDraft);
      } catch (error) {
        console.error("No se pudo cargar el documento editable del curso:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCourseDraft();

    return () => {
      cancelled = true;
    };
  }, [system.label]);

  const tagGroups = useMemo(
    () => buildTabOptionGroups(allTabs, isEnglish ? "en" : "es"),
    [allTabs, isEnglish],
  );

  const handleSaveCourse = async () => {
    if (!courseDocPath || !hasChanged(initialDraft, draft)) {
      return;
    }

    const payload = availableFields.reduce<Record<string, string>>((accumulator, field) => {
      if ((initialDraft[field] ?? "") === (draft[field] ?? "")) {
        return accumulator;
      }

      accumulator[field] = (draft[field] ?? "").trim();
      return accumulator;
    }, {});

    if (Object.keys(payload).length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      await setDoc(
        doc(database, courseDocPath),
        {
          ...payload,
          updatedBy: user?.email ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      const nextSystem = {
        ...system,
        name:
          (isEnglish ? payload.name_en : payload.name_es) ||
          (isEnglish ? draft.name_en : draft.name_es) ||
          system.name,
        description:
          (isEnglish ? payload.descrip_en : payload.descrip_es) ||
          (isEnglish ? draft.descrip_en : draft.descrip_es) ||
          system.description,
        coach: payload.coach ? payload.coach.replace(/_/g, " ") : system.coach,
        coverUrl: payload.coverUrl || system.coverUrl,
      };

      setInitialDraft(draft);
      onSystemUpdated?.(nextSystem);
      refreshGraphData();
      triggerAlert(t(PANEL_TEXT + "editorSaved"), "success");
    } catch (error) {
      console.error("No se pudo guardar la metadata del curso:", error);
      triggerAlert(t(PANEL_TEXT + "editorSaveError"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const applyBulkTagChange = async (mode: "add" | "remove") => {
    if (!selectedBulkTagId || modules.length === 0) {
      triggerAlert(t(PANEL_TEXT + "bulkTagRequired"), "warning");
      return;
    }

    setIsApplyingTabs(true);

    try {
      const tabsPath = system.valueNodes.replace("/nodes", "/tabs");
      const tabsSnapshot = await getDocs(collection(database, tabsPath));
      const taxonomyByNodeId = new Map(
        tabsSnapshot.docs.map((snapshot) => {
          const data = snapshot.data() as {
            node_index?: number;
            tab_ids?: string[];
            category_id?: string;
            subcategory_id?: string;
            specific_category_id?: string;
          };

          return [
            Number(data.node_index),
            {
              docId: snapshot.id,
              data,
            },
          ] as const;
        }),
      );

      await Promise.all(
        modules.map(async (module) => {
          const currentTaxonomy = taxonomyByNodeId.get(module.id);
          const currentTabIds = currentTaxonomy?.data.tab_ids ?? [];
          const nextTabIds =
            mode === "add"
              ? Array.from(new Set([...currentTabIds, selectedBulkTagId]))
              : currentTabIds.filter((tagId) => tagId !== selectedBulkTagId);

          if (nextTabIds.length === currentTabIds.length && mode === "add") {
            return;
          }

          if (
            nextTabIds.length === currentTabIds.length &&
            currentTabIds.every((tagId, index) => tagId === nextTabIds[index])
          ) {
            return;
          }

          const nextDocId = currentTaxonomy?.docId ?? String(module.id);

          await setDoc(
            doc(database, tabsPath, nextDocId),
            {
              node_index: module.id,
              category_id: currentTaxonomy?.data.category_id ?? "",
              subcategory_id: currentTaxonomy?.data.subcategory_id ?? "",
              specific_category_id: currentTaxonomy?.data.specific_category_id ?? "",
              tab_ids: nextTabIds,
              updatedBy: user?.email ?? "",
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        }),
      );

      refreshGraphData();
      triggerAlert(
        t(
          mode === "add"
            ? PANEL_TEXT + "bulkTagAddSuccess"
            : PANEL_TEXT + "bulkTagRemoveSuccess",
        ),
        "success",
      );
    } catch (error) {
      console.error("No se pudieron actualizar las tabs del curso:", error);
      triggerAlert(t(PANEL_TEXT + "bulkTagError"), "error");
    } finally {
      setIsApplyingTabs(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (availableFields.length === 0) {
    return null;
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
            {t(PANEL_TEXT + "editorTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(PANEL_TEXT + "editorDescription")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 1.25,
          }}
        >
          {availableFields.includes("name_es") ? (
            <TextField
              label={t(PANEL_TEXT + "editorNameEs")}
              size="small"
              value={draft.name_es ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name_es: event.target.value }))
              }
            />
          ) : null}
          {availableFields.includes("name_en") ? (
            <TextField
              label={t(PANEL_TEXT + "editorNameEn")}
              size="small"
              value={draft.name_en ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name_en: event.target.value }))
              }
            />
          ) : null}
          {availableFields.includes("coach") ? (
            <TextField
              label={t(PANEL_TEXT + "editorCoach")}
              size="small"
              value={draft.coach ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, coach: event.target.value }))
              }
            />
          ) : null}
          {availableFields.includes("coverUrl") ? (
            <TextField
              label={t(PANEL_TEXT + "editorCover")}
              size="small"
              value={draft.coverUrl ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, coverUrl: event.target.value }))
              }
            />
          ) : null}
          {availableFields.includes("descrip_es") ? (
            <TextField
              label={t(PANEL_TEXT + "editorDescriptionEs")}
              size="small"
              multiline
              minRows={3}
              value={draft.descrip_es ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, descrip_es: event.target.value }))
              }
            />
          ) : null}
          {availableFields.includes("descrip_en") ? (
            <TextField
              label={t(PANEL_TEXT + "editorDescriptionEn")}
              size="small"
              multiline
              minRows={3}
              value={draft.descrip_en ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, descrip_en: event.target.value }))
              }
            />
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            onClick={() => void handleSaveCourse()}
            disabled={isSaving || !hasChanged(initialDraft, draft)}
          >
            {t(PANEL_TEXT + "editorSave")}
          </Button>
          <Button
            variant="text"
            onClick={() => setDraft(initialDraft)}
            disabled={isSaving || !hasChanged(initialDraft, draft)}
          >
            {t(PANEL_TEXT + "editorReset")}
          </Button>
        </Stack>

        <Box
          sx={(theme) => ({
            pt: 1,
            borderTop: `1px solid ${theme.palette.outlineVariant}`,
          })}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.6 }}>
            {t(PANEL_TEXT + "bulkTagsTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
            {t(PANEL_TEXT + "bulkTagsDescription", { total: modules.length })}
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="bulk-course-tag-label">
              {t(PANEL_TEXT + "bulkTagsSelect")}
            </InputLabel>
            <Select
              labelId="bulk-course-tag-label"
              label={t(PANEL_TEXT + "bulkTagsSelect")}
              value={selectedBulkTagId}
              onChange={(event) => setSelectedBulkTagId(event.target.value)}
            >
              {tagGroups.map((group) => [
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

          {selectedBulkTagId ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.1 }}>
              <Chip label={selectedBulkTagId} color="success" variant="outlined" />
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              color="secondary"
              disabled={isApplyingTabs}
              onClick={() => void applyBulkTagChange("add")}
            >
              {t(PANEL_TEXT + "bulkTagsAdd")}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              disabled={isApplyingTabs}
              onClick={() => void applyBulkTagChange("remove")}
            >
              {t(PANEL_TEXT + "bulkTagsRemove")}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
