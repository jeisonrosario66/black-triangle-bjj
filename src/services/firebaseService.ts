import {
    collection,
    getDocs,
} from "firebase/firestore";

import { debugLog } from "@src/utils/index";
import { database } from "@src/hooks/index";
import {
    GroupOptionFirestore,
    tableNameDB,
    cacheUser,
    NodeOptionFirestore,
    SystemOption
} from "@src/context/index";
import { useUIStore } from "@src/store/index";


/**
 * Recupera y unifica enlaces desde múltiples colecciones Firestore.
 * Ejecuta las lecturas de forma paralela para optimizar el rendimiento.
 *
 * @param dbNames - Lista de colecciones de enlaces.
 * @returns Un arreglo plano con todos los enlaces encontrados.
 */
export const getDataLinks = async (dbNames: string[]) => {
    try {
        const promises = dbNames.map((dbName) => getDocs(collection(database, dbName)));
        const snapshots = await Promise.all(promises);

        const results = snapshots.map((querySnapshot) => querySnapshot.docs.map((doc) => {
            const docData = doc.data();
            return { target: docData.target, source: docData.source };
        })).flat();

        debugLog("debug", `Enlaces obtenidos desde Firestore(${dbNames}): `, results);
        return results;
    } catch (error) {
        console.error("Error obteniendo enlaces desde Firestore:", error);
        return [];
    }
};

/**
 * Recupera y normaliza nodos desde múltiples colecciones Firestore.
 * Aplica traducción según el idioma configurado en cacheUser.languageUser.
 *
 * @param dbNames - Lista de colecciones de nodos.
 * @returns Un arreglo con los nodos combinados y normalizados.
 */
export const getDataNodes = async (dbNames: string[]) => {
    try {
        const promises = dbNames.map((dbName) => getDocs(collection(database, dbName)));
        const snapshots = await Promise.all(promises);

        const results: NodeOptionFirestore[] = snapshots.map((querySnapshot) => querySnapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
                id: docData.index,
                index: docData.index,
                name: localStorage.getItem(cacheUser.languageUser) === "es" ? docData.name_es : docData.name_en,
                group: docData.group,
                videoid: docData.videoid,
                description: localStorage.getItem(cacheUser.languageUser) === "es" ? docData.descrip_es : docData.descrip_en
            };
        })).flat();
        useUIStore.setState({ documentsFirestore: results });
        debugLog("debug", `Documentos obtenidos desde Firestore(${tableNameDB.AllSystemsNodesArray
            }): `, results);
        return results;
    } catch (error) {
        console.error("Error obteniendo documentos desde Firestore:", error);
        return [];
    }
};


/**
 * Recupera información de los grupos almacenados en Firestore.
 * Incluye la traducción dinámica de títulos y descripciones según el idioma activo.
 *
 * @param dbName - Nombre de la colección de grupos.
 * @returns Un arreglo de grupos traducidos.
 */
export const getDataGroup = async (dbName: string) => {
    const language = localStorage.getItem(cacheUser.languageUser);
    try {
        const querySnapshot = await getDocs(collection(database, dbName));

        const data: GroupOptionFirestore[] = querySnapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
                label: docData.label,
                title: language === "es" ? docData.title_es : docData.title_en,
                description: language === "es" ? docData.description_es : docData.description_en,
            };
        });

        debugLog("debug", "Grupos obtenidos desde Firestore: ", data);
        return data;
    } catch (error) {
        console.error("Error obteniendo grupos desde Firestore:", error);
        return [];
    }
};


/**
 * Recupera la lista de sistemas disponibles desde Firestore.
 * Construye las rutas de nodos y enlaces asociadas a cada sistema según el idioma activo.
 *
 * @returns Un arreglo de opciones de sistema listas para selección en la UI.
 */
type testType = {
    label: string,
    name: string,
    systems: SystemOption[];
}


export const getSystem = async () => {
    const dbName = tableNameDB.systemsCollections;
    const language = localStorage.getItem(cacheUser.languageUser);

    try {
        // 1. Obtener todos los sistemas
        const querySnapshot = await getDocs(collection(database, dbName));
        const systems: SystemOption[] = querySnapshot.docs.map((doc) => {
            const docData = doc.data();
            const label = language === "es" ? docData.name_es : docData.name_en;
            return {
                label,
                valueNodes: `${tableNameDB.systemsCollections}/${docData.label}/nodes`,
                valueLinks: `${tableNameDB.systemsCollections}/${docData.label}/links`,
            };
        });

        // 2. Obtener los sets de sistemas
        const setsSnapshot = await getDocs(collection(database, "systems_sets/essentials/set"));
        const systemSets: testType[] = setsSnapshot.docs.map((doc) => {
            const docData = doc.data();
            const mappedSystems = docData.systems.map((sId: string) => {
                const systemObj = systems.find((s) => s.valueNodes.includes(sId));
                if (!systemObj) {
                    return { label: sId, valueNodes: "", valueLinks: "" };
                }
                return systemObj;
            });

            return {
                label: docData.label,
                name: language === "es" ? docData.name_es : docData.name_en,
                systems: mappedSystems,
            };
        });

        // 3. Identificar sistemas que no están en ningún set
        const usedSystemIds = new Set(
            systemSets.flatMap((set) =>
                set.systems.map((s) => s.valueNodes.split("/")[1]) // extraemos el id
            )
        );

        const unclassifiedSystems = systems.filter(
            (s) => !usedSystemIds.has(s.valueNodes.split("/")[1])
        );

        if (unclassifiedSystems.length > 0) {
            systemSets.push({
                label: "otros",
                name: "otros sistemas",
                systems: unclassifiedSystems,
            });
        }

        debugLog("debug", "Sistemas obtenidos desde Firestore: ", systems);
        debugLog("debug", "Sets mapeados para UI: ", systemSets);

        return systemSets; 
    } catch (error) {
        console.error("Error obteniendo sistemas desde Firestore:", error);
        return [];
    }
};
