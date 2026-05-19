import { groupColor, type NodeViewData } from "@src/context";
import type { TaxonomyOption } from "@src/utils/nodeEditorTaxonomy";

export type EditableNodeDraft = {
  name_es: string;
  name_en: string;
  group: string;
  videoid: string;
  subtitleEs: string;
  subtitleEn: string;
  descrip_es_summary: string;
  descrip_es_points: string;
  descrip_en_summary: string;
  descrip_en_points: string;
};

export type EditableTaxonomyDraft = {
  category_id: string;
  subcategory_id: string;
  specific_category_id: string;
};

export const EMPTY_TAXONOMY_DRAFT: EditableTaxonomyDraft = {
  category_id: "",
  subcategory_id: "",
  specific_category_id: "",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const parsePointsText = (value: string) =>
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

export const buildEditableNodeDraft = (
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
    subtitleEs: normalizeString(rawData?.subtitleEs) || normalizeString(node.subtitleEs),
    subtitleEn: normalizeString(rawData?.subtitleEn) || normalizeString(node.subtitleEn),
    descrip_es_summary: descriptionEs.summary || (!isEnglish ? fallbackDescription.summary : ""),
    descrip_es_points:
      serializePoints(descriptionEs.points) ||
      (!isEnglish ? serializePoints(fallbackDescription.points) : ""),
    descrip_en_summary: descriptionEn.summary || (isEnglish ? fallbackDescription.summary : ""),
    descrip_en_points:
      serializePoints(descriptionEn.points) ||
      (isEnglish ? serializePoints(fallbackDescription.points) : ""),
  };
};

export const buildEditableTaxonomyDraft = (
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

export const buildStructuredDescription = (summary: string, pointsText: string) => ({
  summary: summary.trim(),
  points: parsePointsText(pointsText),
});

export const buildNodeUpdatePayload = (
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

  if (initialDraft.subtitleEs !== draft.subtitleEs) {
    payload.subtitleEs = draft.subtitleEs.trim();
  }

  if (initialDraft.subtitleEn !== draft.subtitleEn) {
    payload.subtitleEn = draft.subtitleEn.trim();
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

export const resolveNodeColor = (categoryId: string, group: string) =>
  groupColor[categoryId.trim().toLowerCase()] ??
  groupColor[group.trim()] ??
  undefined;

export const buildLocalizedNodeData = (
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
    subtitleEs: draft.subtitleEs.trim(),
    subtitleEn: draft.subtitleEn.trim(),
    description,
    color: resolveNodeColor(taxonomyDraft.category_id, draft.group),
  };
};

export const buildTaxonomyDocument = (
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

export const ensureOptionExists = (options: TaxonomyOption[], value: string) => {
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

export const areStringArraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((item, index) => item === right[index]);
