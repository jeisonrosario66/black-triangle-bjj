import { useState, useEffect } from "react";
import { database } from "./fireBaseMobile";
import { tableNameDB, Tag, NodeTaxonomy } from "@bt/shared/packages/context";
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
} from "firebase/firestore";

/**
 * Hook que resuelve la taxonomía asociada a un nodo específico.
 * Centraliza la lógica de consulta distribuida entre la colección global de taxonomía
 * y las colecciones dinámicas de tabs por sistema, devolviendo la primera coincidencia válida.
 *
 * @param {number} nodeIndex - Índice único del nodo dentro del sistema global.
 * @param {string[]} firestoreRuta - Rutas de Firestore de los sistemas cargados para resolver tabs dinámicos.
 * @returns {any | null} Objeto de taxonomía asociado al nodo o null si no existe.
 */
export const useNodeTaxonomy = (nodeIndex: number, firestoreRuta: string[]) => {
    const [taxonomy, setTaxonomy] = useState<NodeTaxonomy | null>(null);
    useEffect(() => {
        if (!nodeIndex) {
            setTaxonomy(null);
            return;
        }

        const fetch = async () => {
            const systemsNodes: string[] = firestoreRuta;
            const systemsTabs = systemsNodes.map((path) =>
                path.replace("/nodes", "/tabs")
            );

            const queries = [
                query(
                    collection(database, tableNameDB.nodeTaxonomy),
                    where("node_index", "==", nodeIndex)
                ),
                ...systemsTabs.map((path) =>
                    query(
                        collection(database, path),
                        where("node_index", "==", nodeIndex)
                    )
                ),
            ];

            const snapshots = await Promise.all(
                queries.map((q) => getDocs(q))
            );

            const firstMatch = snapshots
                .flatMap((snap) =>
                    snap.docs.map((docSnap) => {
                        const data = docSnap.data() as NodeTaxonomy;

                        return {
                            id: docSnap.id,
                            ...data,
                        };
                    })
                )[0];

            setTaxonomy(firstMatch ?? null);

        };

        fetch();
    }, [nodeIndex]);

    return taxonomy;
};



/**
 * Hook que recupera y resuelve información de tabs a partir de una lista de identificadores.
 * Encapsula el acceso a Firestore para hidratar metadatos de navegación y categorización
 * utilizados por la interfaz según el contexto del nodo o sistema activo.
 *
 * @param {string[]} [tabIds] - Lista de identificadores de tabs a resolver.
 * @returns {Tag[]} Arreglo de tabs existentes correspondientes a los identificadores proporcionados.
 */
export const useTabsByIds = (tabIds?: string[]) => {
    const [tabs, setTabs] = useState<Tag[]>([]);

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
