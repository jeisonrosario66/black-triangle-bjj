import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
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

    const fetch = async () => {
      const systemsNodes: string[] = firestoreRuta;
      const systemsTabs = systemsNodes.map((path) =>
        path.replace("/nodes", "/tabs"),
      );

      const queries = [
        // colección principal
        query(
          collection(database, tableNameDB.nodeTaxonomy),
          where("node_index", "==", nodeIndex),
        ),

        // colecciones dinámicas
        ...systemsTabs.map((path) =>
          query(
            collection(database, path),
            where("node_index", "==", nodeIndex),
          ),
        ),
      ];

      const snapshots = await Promise.all(queries.map((q) => getDocs(q)));

      const firstMatch = snapshots.flatMap((snap) =>
        snap.docs.map((docSnap) => {
          const data = docSnap.data() as NodeTaxonomy;

          return {
            id: docSnap.id,
            ...data,
          };
        }),
      )[0];
      setTaxonomy(firstMatch ?? null);
    };

    fetch();
  }, [nodeIndex]);

  return taxonomy;
};

export interface Tab {
  id: string;
  label: string;
  title_es?: string;
  title_en?: string;
}

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
      const snaps = await Promise.all(
        tabIds.map((id) => getDoc(doc(database, tableNameDB.tabs, id))),
      );

      const resolved = snaps
        .filter((s) => s.exists())
        .map((s) => ({
          id: s.id,
          ...(s.data() as { label: string }),
          title_es: (s.data() as { title_es?: string }).title_es,
          title_en: (s.data() as { title_en?: string }).title_en,
        }));

      setTabs(resolved);
    };

    fetch();
  }, [tabIds]);
  return tabs;
};
