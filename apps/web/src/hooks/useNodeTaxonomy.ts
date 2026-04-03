import { useEffect, useState } from "react";
import {
  collection,
  documentId,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

import { tableNameDB, NodeTaxonomy } from "@bt/shared/context/index";
import { database } from "@src/hooks";

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

  useEffect(() => {
    if (!nodeIndex) {
      setTaxonomy(null);
      return;
    }

    const taxonomyCacheKey = `${nodeIndex}:${[...firestoreRuta].sort().join("|")}`;

    if (taxonomyCache.has(taxonomyCacheKey)) {
      setTaxonomy(taxonomyCache.get(taxonomyCacheKey) ?? null);
      return;
    }

    const fetch = async () => {
      const systemsNodes: string[] = firestoreRuta;
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
  }, [firestoreRuta, nodeIndex]);

  return taxonomy;
};

export interface Tab {
  id: string;
  label: string;
  title_es?: string;
  title_en?: string;
}

const taxonomyCache = new Map<string, NodeTaxonomy | null>();
const tabsCache = new Map<string, Tab>();
const chunkIds = (ids: string[], size: number) => {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
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

  useEffect(() => {
    if (!tabIds || tabIds.length === 0) {
      setTabs([]);
      return;
    }

    const fetch = async () => {
      const uniqueTabIds = Array.from(new Set(tabIds));
      const missingIds = uniqueTabIds.filter((id) => !tabsCache.has(id));

      if (missingIds.length === 0) {
        setTabs(uniqueTabIds.map((id) => tabsCache.get(id)!).filter(Boolean));
        return;
      }

      const snapshots = await Promise.all(
        chunkIds(missingIds, 10).map((idsChunk) =>
          getDocs(
            query(
              collection(database, tableNameDB.tabs),
              where(documentId(), "in", idsChunk),
            ),
          ),
        ),
      );

      const fetchedTabs = snapshots
        .flatMap((snapshot) => snapshot.docs)
        .map((snapshot) => ({
          id: snapshot.id,
          ...(snapshot.data() as { label: string }),
          title_es: (snapshot.data() as { title_es?: string }).title_es,
          title_en: (snapshot.data() as { title_en?: string }).title_en,
        }));

      fetchedTabs.forEach((tab) => {
        tabsCache.set(tab.id, tab);
      });

      const resolved = uniqueTabIds
        .map((id) => tabsCache.get(id))
        .filter(Boolean) as Tab[];

      setTabs(resolved);
    };

    void fetch();
  }, [tabIds]);
  return tabs;
};
