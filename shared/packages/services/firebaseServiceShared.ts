import {
  tableNameDB,
} from "../context/index";
import type {
  NodeOptionFirestore,
  SystemCardOption,
  SystemCardUI,
} from "../context/index";

/**
 * Recupera la lista de sistemas disponibles desde Firestore.
 * Construye las rutas de nodos y enlaces asociadas a cada sistema según el idioma activo.
 *
 * @returns Un arreglo de opciones de sistema listas para selección en la UI.
 */
type testType = {
  label: string;
  name: string;
  systems: SystemCardOption[];
};

export type SystemsGroupShared = testType;

const systemsCache = new Map<string, Promise<testType[]>>();
const systemsSnapshotCache = new Map<string, testType[]>();
const nodeCollectionsCache = new Map<string, Promise<NodeOptionFirestore[]>>();
const nodeCollectionsSnapshotCache = new Map<string, NodeOptionFirestore[]>();
const nodeCountCache = new Map<string, Promise<number>>();

const getSystemsCacheKey = (language: string) => `systems:${language}`;

const getNodesCacheKey = (dbNames: string[], language: string) =>
  `nodes:${language}:${[...dbNames].sort().join("|")}`;

export const buildSystemsUIShared = (data: SystemsGroupShared[]) => {
  const systemsMap = new Map<string, SystemCardUI>();

  data.forEach((group) => {
    group.systems.forEach((system) => {
      const systemKey = system.label || system.valueNodes;

      if (!systemsMap.has(systemKey)) {
        systemsMap.set(systemKey, {
          ...system,
          setSystem: group.name,
          coverUrl: system.coverUrl,
          name: system.name,
        });
      }
    });
  });

  return {
    systems: Array.from(systemsMap.values()),
    tagNavigation: Array.from(new Set(data.map((group) => group.name))),
  };
};

export const getCachedSystemsShared = (language = "es") =>
  systemsSnapshotCache.get(getSystemsCacheKey(language)) ?? null;

export const getCachedDataNodesShared = (
  dbNames: string[],
  language = "es",
) => nodeCollectionsSnapshotCache.get(getNodesCacheKey(dbNames, language)) ?? null;

const getNodeCount = async (
  getDocs: any,
  database: any,
  collectionRef: any,
  dbName: string,
) => {
  const cachedRequest = nodeCountCache.get(dbName);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = getDocs(collectionRef(database, dbName))
    .then((snapshot: { size: number }) => snapshot.size)
    .catch((error: unknown) => {
      nodeCountCache.delete(dbName);
      throw error;
    });

  nodeCountCache.set(dbName, request);

  return request;
};

export const getSystemshared = async (
  getDocs: any,
  collection: any,
  database: any,
  language = "es",
) => {
  const cacheKey = getSystemsCacheKey(language);
  const cachedRequest = systemsCache.get(cacheKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = (async () => {
  const dbName = tableNameDB.systemsCollections;
  // const language = localStorage.getItem(cacheUser.languageUser);

  try {
    // 1. Obtener todos los sistemas
    const querySnapshot = await getDocs(collection(database, dbName));
    const systems: SystemCardOption[] = await Promise.all(
      querySnapshot.docs.map(async (doc: any) => {
        const docData = doc.data();
        const label = docData.label;
        const name = language === "es" ? docData.name_es : docData.name_en;
        const coach = docData.coach.replaceAll("_", " ");
        const coverUrl = docData.coverUrl;
        const description = language === "es" ? docData.descrip_es : docData.descrip_en;
        const valueNodes = `${tableNameDB.systemsCollections}/${docData.label}/nodes`;
        const valueLinks = `${tableNameDB.systemsCollections}/${docData.label}/links`;

        return {
          label,
          name,
          valueNodes,
          valueLinks,
          coach,
          coverUrl,
          description,
          videoCount: await getNodeCount(getDocs, database, collection, valueNodes),
        };
      }),
    );
    const systemsById = new Map(
      systems.map((system) => [system.label, system]),
    );

    // 2. Obtener los sets de sistemas
    const setsSnapshot = await getDocs(
      collection(database, "systems_sets/essentials/set"),
    );
    const systemSets: testType[] = setsSnapshot.docs.map((doc: any) => {
      const docData = doc.data();
      const uniqueSystemIds = Array.from(
        new Set<string>(docData.systems as string[]),
      );
      const mappedSystems = uniqueSystemIds
        .map((systemId: string) => systemsById.get(systemId))
        .filter(Boolean) as SystemCardOption[];

      return {
        label: docData.label,
        name: language === "es" ? docData.name_es : docData.name_en,
        systems: mappedSystems,
      };
    });

    // 3. Identificar sistemas que no están en ningún set
    const usedSystemIds = new Set(
      systemSets.flatMap(
        (set) => set.systems.map((system) => system.label),
      ),
    );

    const unclassifiedSystems = systems.filter(
      (system) => !usedSystemIds.has(system.label),
    );

    if (unclassifiedSystems.length > 0) {
      systemSets.push({
        label: "otros",
        name: "otros sistemas",
        systems: unclassifiedSystems,
      });
    }

    return systemSets;
  } catch (error) {
    systemsCache.delete(cacheKey);
    console.error("Error obteniendo sistemas desde Firestore:", error);
    return [];
  }
  })();

  request.then((data) => {
    systemsSnapshotCache.set(cacheKey, data);
  });
  systemsCache.set(cacheKey, request);

  return request;
};

/**
 * Recupera y normaliza nodos desde múltiples colecciones Firestore.
 * Aplica traducción según el idioma configurado en cacheUser.languageUser.
 *
 * @param dbNames - Lista de colecciones de nodos.
 * @returns Un arreglo con los nodos combinados y normalizados.
 */
export const getDataNodesShared = async (
  dbNames: string[],
  getDocs: any,
  collection: any,
  database: any,
  language = "es",
) => {
  const cacheKey = getNodesCacheKey(dbNames, language);
  const cachedRequest = nodeCollectionsCache.get(cacheKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = (async () => {
  try {
    const promises = dbNames.map((dbName) =>
      getDocs(collection(database, dbName)),
    );
    const snapshots = await Promise.all(promises);

    const results: NodeOptionFirestore[] = snapshots
      .map((querySnapshot) =>
        querySnapshot.docs.map((doc: { data: () => any; }) => {
          const docData = doc.data();
          return {
            id: docData.index,
            index: docData.index,
            name: language === "es" ? docData.name_es : docData.name_en,
            group: docData.group,
            videoid: docData.videoid,
            description:
              language === "es" ? docData.descrip_es : docData.descrip_en,
          };
        }),
      )
      .flat();
    // useUIStore.setState({ documentsFirestore: results });
    // debugLog(
    //   "debug",
    //   `Documentos obtenidos desde Firestore(${
    //     tableNameDB.AllSystemsNodesArray
    //   }): `,
    //   results,
    // );7
    return results;
  } catch (error) {
    nodeCollectionsCache.delete(cacheKey);
    console.error("Error obteniendo documentos desde Firestore:", error);
    return [];
  }
  })();

  request.then((data) => {
    nodeCollectionsSnapshotCache.set(cacheKey, data);
  });
  nodeCollectionsCache.set(cacheKey, request);

  return request;
};
