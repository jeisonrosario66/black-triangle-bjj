import type { Tab } from "@src/hooks/useNodeTaxonomy";

type Language = "es" | "en";

export type SourceMetadataEntry = {
  docId: string;
  data: Record<string, unknown>;
};

export type TaxonomyOption = {
  id: string;
  label: string;
  parentId: string;
  raw: Record<string, unknown>;
  specificOptions: TaxonomyOption[];
};

export type TabOptionGroup = {
  id: string;
  label: string;
  options: Tab[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const sortByLabel = <T extends { label: string }>(items: T[]) =>
  [...items].sort((itemA, itemB) => itemA.label.localeCompare(itemB.label));

const resolveMetadataId = (
  docId: string,
  data: Record<string, unknown>,
) =>
  normalizeString(data.label) ||
  normalizeString(data.id) ||
  normalizeString(data.value) ||
  docId;

const resolveMetadataLabel = (
  fallbackId: string,
  data: Record<string, unknown>,
  language: Language,
) =>
  normalizeString(language === "en" ? data.title_en : data.title_es) ||
  normalizeString(language === "en" ? data.name_en : data.name_es) ||
  normalizeString(language === "en" ? data.label_en : data.label_es) ||
  normalizeString(data.title) ||
  normalizeString(data.name) ||
  normalizeString(data.label) ||
  fallbackId;

const toMetadataLookup = (entries: SourceMetadataEntry[]) => {
  const lookup = new Map<string, Record<string, unknown>>();

  entries.forEach(({ docId, data }) => {
    const resolvedId = resolveMetadataId(docId, data);
    const keys = [
      docId,
      resolvedId,
      normalizeString(data.label),
      normalizeString(data.id),
      normalizeString(data.value),
    ].filter(Boolean);

    keys.forEach((key) => {
      if (!lookup.has(key)) {
        lookup.set(key, data);
      }
    });
  });

  return lookup;
};

const getSpecificMetadataLookup = (raw: Record<string, unknown>) => {
  const lookup = new Map<string, Record<string, unknown>>();
  const candidates = [
    raw.specific_categories,
    raw.specificCategories,
    raw.specific_category_options,
    raw.specificCategoryOptions,
    raw.children,
    raw.items,
  ];
  const source = candidates.find(Array.isArray);

  if (!Array.isArray(source)) {
    return lookup;
  }

  source.forEach((item, index) => {
    if (typeof item === "string") {
      const key = item.trim();

      if (key && !lookup.has(key)) {
        lookup.set(key, { label: key });
      }

      return;
    }

    if (!isRecord(item)) {
      return;
    }

    const resolvedId = resolveMetadataId(String(index), item);
    const keys = [
      resolvedId,
      normalizeString(item.label),
      normalizeString(item.id),
      normalizeString(item.value),
    ].filter(Boolean);

    keys.forEach((key) => {
      if (!lookup.has(key)) {
        lookup.set(key, item);
      }
    });
  });

  return lookup;
};

const buildTaxonomyOption = (
  id: string,
  parentId: string,
  metadata: Record<string, unknown> | undefined,
  language: Language,
  specificOptions: TaxonomyOption[] = [],
): TaxonomyOption => ({
  id,
  label: resolveMetadataLabel(id, metadata ?? {}, language),
  parentId,
  raw: metadata ?? {},
  specificOptions,
});

export const buildTaxonomyEditorModel = (
  categoryEntries: SourceMetadataEntry[],
  subcategoryEntries: SourceMetadataEntry[],
  specificEntries: SourceMetadataEntry[],
  language: Language,
) => {
  const categoryLookup = toMetadataLookup(categoryEntries);
  const categories = sortByLabel(
    categoryEntries.map(({ docId, data }) => {
      const categoryId = resolveMetadataId(docId, data);
      return buildTaxonomyOption(categoryId, "", data, language);
    }),
  );

  const subcategoriesByCategory = categories.reduce<Record<string, TaxonomyOption[]>>(
    (accumulator, category) => {
      accumulator[category.id] = [];
      return accumulator;
    },
    {},
  );

  const specificEntriesBySubcategory = specificEntries.reduce<
    Record<string, TaxonomyOption[]>
  >((accumulator, { docId, data }) => {
    const parentId =
      normalizeString(data.subcategory_id) ||
      normalizeString(data.parent_id) ||
      normalizeString(data.parentId);

    if (!parentId) {
      return accumulator;
    }

    const specificId = resolveMetadataId(docId, data);

    if (!specificId) {
      return accumulator;
    }

    const currentEntries = accumulator[parentId] ?? [];

    accumulator[parentId] = sortByLabel([
      ...currentEntries,
      buildTaxonomyOption(specificId, parentId, data, language),
    ]);

    return accumulator;
  }, {});

  subcategoryEntries.forEach(({ docId, data }) => {
    const subcategoryId = resolveMetadataId(docId, data);
    const categoryId =
      normalizeString(data.category_id) ||
      normalizeString(data.parent_id) ||
      normalizeString(data.parentId);

    if (!categoryId) {
      return;
    }

    const categoryMetadata = categoryLookup.get(categoryId);
    const resolvedCategoryId = categoryMetadata
      ? resolveMetadataId(categoryId, categoryMetadata)
      : categoryId;

    const specificMetadataLookup = getSpecificMetadataLookup(data);
    const rawSpecificOptions = [
      data.specific_categories,
      data.specificCategories,
      data.specific_category_options,
      data.specificCategoryOptions,
      data.children,
      data.items,
    ].find(Array.isArray);

    const inlineSpecificOptions = Array.isArray(rawSpecificOptions)
      ? rawSpecificOptions.flatMap<TaxonomyOption>((item, index) => {
          if (typeof item === "string") {
            const specificId = item.trim();

            if (!specificId) {
              return [];
            }

            return [
              buildTaxonomyOption(
                specificId,
                subcategoryId,
                specificMetadataLookup.get(specificId),
                language,
              ),
            ];
          }

          if (!isRecord(item)) {
            return [];
          }

          const specificId = resolveMetadataId(String(index), item);

          if (!specificId) {
            return [];
          }

          return [
            buildTaxonomyOption(specificId, subcategoryId, item, language),
          ];
        })
      : [];
    const specificOptions = sortByLabel([
      ...inlineSpecificOptions,
      ...(specificEntriesBySubcategory[subcategoryId] ?? []),
    ]);

    const nextOption = buildTaxonomyOption(
      subcategoryId,
      resolvedCategoryId,
      data,
      language,
      specificOptions,
    );

    const current = subcategoriesByCategory[resolvedCategoryId] ?? [];
    subcategoriesByCategory[resolvedCategoryId] = sortByLabel([...current, nextOption]);
  });

  return {
    categories,
    subcategoriesByCategory,
  };
};

export const mergeTabs = (baseTabs: Tab[], overlayTabs: Tab[]) => {
  const merged = new Map<string, Tab>();

  baseTabs.forEach((tab) => {
    merged.set(tab.id, tab);
  });

  overlayTabs.forEach((tab) => {
    const canonicalId = normalizeString(tab.label) || normalizeString(tab.id);

    if (!canonicalId) {
      return;
    }

    const current = merged.get(canonicalId) ?? {
      id: canonicalId,
      label: canonicalId,
    };

    merged.set(canonicalId, {
      ...current,
      ...tab,
      id: canonicalId,
      label: normalizeString(tab.label) || current.label || canonicalId,
      groupId:
        normalizeString(tab.groupId) ||
        normalizeString(current.groupId) ||
        normalizeString(tab.type) ||
        normalizeString(current.type),
      groupLabel:
        normalizeString(tab.groupLabel) ||
        normalizeString(current.groupLabel) ||
        normalizeString(tab.type) ||
        normalizeString(current.type),
    });
  });

  return [...merged.values()];
};

const resolveTabGroupId = (tab: Tab) =>
  normalizeString(tab.groupId) ||
  normalizeString(tab.groupLabel) ||
  normalizeString(tab.type) ||
  "general";

const resolveTabGroupLabel = (tab: Tab, language: Language) => {
  const explicitLabel =
    normalizeString(tab.groupLabel) ||
    normalizeString(tab.groupId) ||
    normalizeString(tab.type);

  if (explicitLabel) {
    return explicitLabel;
  }

  return language === "es" ? "General" : "General";
};

export const buildTabOptionGroups = (
  tabs: Tab[],
  language: Language,
): TabOptionGroup[] => {
  const groupedTabs = new Map<string, TabOptionGroup>();

  tabs.forEach((tab) => {
    const groupId = resolveTabGroupId(tab);
    const existingGroup = groupedTabs.get(groupId) ?? {
      id: groupId,
      label: resolveTabGroupLabel(tab, language),
      options: [],
    };

    existingGroup.options.push(tab);
    groupedTabs.set(groupId, existingGroup);
  });

  return sortByLabel([...groupedTabs.values()]).map((group) => ({
    ...group,
    options: sortByLabel(group.options.map((tab) => ({
      ...tab,
      groupId: tab.groupId || group.id,
      groupLabel: tab.groupLabel || group.label,
    }))),
  }));
};
