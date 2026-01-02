import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

import { tableNameDB } from "@src/context/configGlobal";
import { database } from "@src/hooks";

/**
 * Hook para obtener la taxonomía asociada a un nodo.
 * Recupera desde Firestore la información taxonómica basada en el índice del nodo.
 *
 * @param {number} nodeIndex Índice identificador del nodo.
 * @returns {any | null} Objeto de taxonomía del nodo o null si no existe.
 */
export const useNodeTaxonomy = (nodeIndex: number) => {
  const [taxonomy, setTaxonomy] = useState<any | null>(null);

  useEffect(() => {
    if (!nodeIndex) {
      setTaxonomy(null);
      return;
    }

    const fetch = async () => {
      const q = query(
        collection(database, tableNameDB.nodeTaxonomy),
        where("node_index", "==", nodeIndex)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setTaxonomy(null);
        return;
      }

      const docSnap = snap.docs[0];

      setTaxonomy({
        id: docSnap.id,
        ...docSnap.data(),
      });
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
        tabIds.map((id) => getDoc(doc(database, tableNameDB.tabs, id)))
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
