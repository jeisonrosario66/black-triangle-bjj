import { useEffect, useState } from "react";
import {
  collection,
  where,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

import { tableNameDB, NodeTaxonomy } from "@bt/shared/context/index";
import { database } from "@src/hooks";
import {
  mergeTabs,
} from "@src/utils/nodeEditorTaxonomy";

/**
 * Hook que resuelve la taxonomía asociada a un nodo específico.
 * Centraliza la lógica de consulta distribuida entre la colección global de taxonomía
 * y las colecciones dinámicas de tabs por sistema, devolviendo la primera coincidencia válida.
 *
 * @param {number} nodeIndex - Índice único del nodo dentro del sistema global.
 * @param {string[]} firestoreRuta - Rutas de Firestore de los sistemas cargados para resolver tabs dinámicos.
 * @returns {any | null} Objeto de taxonomía asociado al nodo o null si no existe.
 */
export const useNodeTaxonomy = (nodeIndex: number, firestoreRuta: string[] = []) => {
  const [taxonomy, setTaxonomy] = useState<NodeTaxonomy | null>(null);
  const firestoreRutaKey = getTaxonomyRoutesKey(firestoreRuta);

  useEffect(() => {
    if (!nodeIndex) {
      setTaxonomy(null);
      return;
    }

    const systemsNodes = firestoreRutaKey ? firestoreRutaKey.split("|") : [];
    const taxonomyCacheKey = getTaxonomyCacheKey(nodeIndex, systemsNodes);

    if (taxonomyCache.has(taxonomyCacheKey)) {
      setTaxonomy(taxonomyCache.get(taxonomyCacheKey) ?? null);
      return;
    }

    const fetch = async () => {
      const systemsTabs = systemsNodes.map((path) =>
        path.replace("/nodes", "/tabs"),
      );

      let firstMatch: NodeTaxonomy | null = null;

      for (const path of systemsTabs) {
        const dynamicSnapshot = await getDocs(
          query(
            collection(database, path),
            where("node_index", "==", nodeIndex),
            limit(1),
          ),
        );

        const dynamicDoc = dynamicSnapshot.docs[0];

        if (dynamicDoc) {
          firstMatch = {
            id: dynamicDoc.id,
            ...(dynamicDoc.data() as NodeTaxonomy),
          };
          break;
        }
      }

      if (!firstMatch) {
        const mainSnapshot = await getDocs(
          query(
            collection(database, tableNameDB.nodeTaxonomy),
            where("node_index", "==", nodeIndex),
            limit(1),
          ),
        );
        const mainDoc = mainSnapshot.docs[0];

        if (mainDoc) {
          firstMatch = {
            id: mainDoc.id,
            ...(mainDoc.data() as NodeTaxonomy),
          };
        }
      }

      taxonomyCache.set(taxonomyCacheKey, firstMatch);
      setTaxonomy(firstMatch ?? null);
    };

    void fetch();
  }, [firestoreRutaKey, nodeIndex]);

  return taxonomy;
};

export interface Tab {
  id: string;
  label: string;
  title_es?: string;
  title_en?: string;
  description_es?: string;
  description_en?: string;
  type?: string;
  groupId?: string;
  groupLabel?: string;
}

const taxonomyCache = new Map<string, NodeTaxonomy | null>();
const tabsCache = new Map<string, Tab>();
let allTabsCache: Tab[] | null = null;
let allTabsRequest: Promise<Tab[]> | null = null;

const getTaxonomyRoutesKey = (firestoreRuta: string[] = []) =>
  Array.from(new Set(firestoreRuta)).sort().join("|");

const getTaxonomyCacheKey = (nodeIndex: number, firestoreRuta: string[] = []) =>
  `${nodeIndex}:${getTaxonomyRoutesKey(firestoreRuta)}`;

export const primeNodeTaxonomyCache = (
  nodeIndex: number,
  firestoreRuta: string[] = [],
  taxonomy: NodeTaxonomy | null,
) => {
  taxonomyCache.set(getTaxonomyCacheKey(nodeIndex, firestoreRuta), taxonomy);
};

export const primeTabsCache = (tabs: Tab[]) => {
  const nextTabs = mergeTabs(allTabsCache ?? [], tabs);

  nextTabs.forEach((tab) => {
    tabsCache.set(tab.id, tab);
  });

  allTabsCache = nextTabs;
};

const loadAllTabs = () => {
  if (!allTabsRequest) {
    allTabsRequest = getDocs(collection(database, tableNameDB.tabs))
      .then((snapshot) =>
        snapshot.docs.map((tabSnapshot) => {
          const data = tabSnapshot.data() as Record<string, unknown>;
          const resolvedId =
            (typeof data.label === "string" && data.label.trim()) ||
            tabSnapshot.id;

          return {
            id: resolvedId,
            label: resolvedId,
            title_es: typeof data.title_es === "string" ? data.title_es : undefined,
            title_en: typeof data.title_en === "string" ? data.title_en : undefined,
            description_es:
              typeof data.description_es === "string"
                ? data.description_es
                : undefined,
            description_en:
              typeof data.description_en === "string"
                ? data.description_en
                : undefined,
            type: typeof data.type === "string" ? data.type : undefined,
          } satisfies Tab;
        }),
      )
        .then((resolvedTabs) => {
          primeTabsCache(resolvedTabs);
        return allTabsCache ?? [];
      })
      .catch((error) => {
        allTabsRequest = null;
        throw error;
      });
  }

  return allTabsRequest;
};

/**
 * Hook para resolver pestañas a partir de sus identificadores.
 * Obtiene desde Firestore la información de cada tab asociada a los IDs proporcionados.
 *
 * @param {string[]} [tabIds] Lista de identificadores de pestañas.
 * @returns {Tab[]} Arreglo de pestañas resueltas.
 */
export const useTabsByIds = (tabIds?: string[]) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const tabIdsKey = Array.from(new Set(tabIds ?? [])).sort().join("|");

  useEffect(() => {
    if (!tabIdsKey) {
      setTabs([]);
      return;
    }

    const fetch = async () => {
      const uniqueTabIds = tabIdsKey.split("|");
      const missingIds = uniqueTabIds.filter((id) => !tabsCache.has(id));

      if (missingIds.length === 0) {
        setTabs(uniqueTabIds.map((id) => tabsCache.get(id)!).filter(Boolean));
        return;
      }

      await loadAllTabs();

      const unresolvedTabs = uniqueTabIds
        .filter((id) => !tabsCache.has(id))
        .map((id) => ({
          id,
          label: id,
        }));

      if (unresolvedTabs.length > 0) {
        primeTabsCache(unresolvedTabs);
      }

      const resolved = uniqueTabIds.map((id) => tabsCache.get(id) ?? { id, label: id });

      setTabs(resolved);
    };

    void fetch();
  }, [tabIdsKey]);
  return tabs;
};

export const useAllTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>(allTabsCache ?? []);

  useEffect(() => {
    setTabs(allTabsCache ?? []);

    loadAllTabs()
      ?.then((resolvedTabs) => {
        setTabs(resolvedTabs);
      })
      .catch((error) => {
        console.error("No se pudieron cargar las tabs globales:", error);
        setTabs(allTabsCache ?? []);
      });
  }, []);

  return tabs;
};
