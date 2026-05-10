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

const COURSE_METRICS_COLLECTION = "course_metrics";
const VIDEO_METRICS_SUBCOLLECTION = "videos";

export type SystemsGroupShared = testType;
export type SystemsPageCursorShared = any;
export type SystemsPageShared = {
  systems: SystemCardUI[];
  tagNavigation: string[];
  cursor: SystemsPageCursorShared | null;
  hasMore: boolean;
};

const systemsCache = new Map<string, Promise<testType[]>>();
const systemsSnapshotCache = new Map<string, testType[]>();
const systemSetsCache = new Map<string, Promise<testType[]>>();
const systemSetsSnapshotCache = new Map<string, testType[]>();
const nodeCollectionsCache = new Map<string, Promise<NodeOptionFirestore[]>>();
const nodeCollectionsSnapshotCache = new Map<string, NodeOptionFirestore[]>();
const nodeCountSnapshotCache = new Map<string, number>();
const VIDEO_COUNT_STORAGE_KEY = "bt_course_video_counts";

const getSystemsCacheKey = (language: string) => `systems:${language}`;

const getNodesCacheKey = (dbNames: string[], language: string) =>
  `nodes:${language}:${[...dbNames].sort().join("|")}`;

const readStoredVideoCounts = () => {
  if (typeof localStorage === "undefined") {
    return {} as Record<string, number>;
  }

  try {
    const raw = localStorage.getItem(VIDEO_COUNT_STORAGE_KEY);

    if (!raw) {
      return {} as Record<string, number>;
    }

    return JSON.parse(raw) as Record<string, number>;
  } catch (error) {
    console.error("No se pudo leer el cache local de conteos de videos:", error);
    return {} as Record<string, number>;
  }
};

const persistStoredVideoCount = (dbName: string, size: number) => {
  nodeCountSnapshotCache.set(dbName, size);

  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    const nextCounts = {
      ...readStoredVideoCounts(),
      [dbName]: size,
    };

    localStorage.setItem(VIDEO_COUNT_STORAGE_KEY, JSON.stringify(nextCounts));
  } catch (error) {
    console.error("No se pudo persistir el cache local de conteos de videos:", error);
  }
};

const getCachedVideoCount = (dbName: string) =>
  nodeCountSnapshotCache.get(dbName) ?? readStoredVideoCounts()[dbName];

const getOtherSystemsLabel = (language: string) =>
  language === "es" ? "Otros sistemas" : "Other systems";

const getCourseLabelFromNodesPath = (valueNodes: string) =>
  valueNodes.split("/")[1] ?? "";

const buildVideoMetricsPath = (courseLabel: string) =>
  `${COURSE_METRICS_COLLECTION}/${courseLabel}/${VIDEO_METRICS_SUBCOLLECTION}`;

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

const getCachedSystemSetsShared = (language = "es") =>
  systemSetsSnapshotCache.get(`system-sets:${language}`) ?? null;

export const getCachedDataNodesShared = (
  dbNames: string[],
  language = "es",
) => nodeCollectionsSnapshotCache.get(getNodesCacheKey(dbNames, language)) ?? null;

export const updateCachedNodeViewsShared = ({
  docId,
  id,
  nextViewsCount,
}: {
  docId?: string;
  id: number;
  nextViewsCount: number;
}) => {
  nodeCollectionsSnapshotCache.forEach((nodes, cacheKey) => {
    const nextNodes = nodes.map((node) => {
      const isTargetNode =
        (docId && node.docId === docId) ||
        (!docId && node.id === id);

      if (!isTargetNode) {
        return node;
      }

      return {
        ...node,
        viewsCount: nextViewsCount,
      };
    });

    nodeCollectionsSnapshotCache.set(cacheKey, nextNodes);
  });
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
    // 1. Obtener todos los sistemas y sus métricas globales
    const [querySnapshot, metricsSnapshot] = await Promise.all([
      getDocs(collection(database, dbName)),
      getDocs(collection(database, COURSE_METRICS_COLLECTION)),
    ]);
    const metricsByLabel = new Map<string, any>(
      metricsSnapshot.docs.map((metricDoc: any) => [
        metricDoc.id,
        metricDoc.data(),
      ]),
    );
    const systems: SystemCardOption[] = await Promise.all(
      querySnapshot.docs.map(async (doc: any) => {
        const docData = doc.data();
        const label = docData.label;
        const metricData = metricsByLabel.get(label);
        const name = language === "es" ? docData.name_es : docData.name_en;
        const coach = docData.coach.replaceAll("_", " ");
        const coverUrl = docData.coverUrl;
        const description = language === "es" ? docData.descrip_es : docData.descrip_en;
        const valueNodes = `${tableNameDB.systemsCollections}/${docData.label}/nodes`;
        const valueLinks = `${tableNameDB.systemsCollections}/${docData.label}/links`;
        const cachedVideoCount = getCachedVideoCount(valueNodes);
        const videoCount =
          docData.nodesCount ??
          docData.videoCount ??
          docData.videosCount ??
          docData.totalVideos ??
          cachedVideoCount;

        return {
          label,
          name,
          valueNodes,
          valueLinks,
          set: "",
          coach,
          coverUrl,
          description,
          videoCount,
          viewsCount:
            metricData?.courseViews ??
            metricData?.viewsCount ??
            docData.viewsCount ??
            0,
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
        name: getOtherSystemsLabel(language),
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

const mapSystemDocToOption = (docData: any, language: string): SystemCardOption => {
  const label = docData.label;
  const name = language === "es" ? docData.name_es : docData.name_en;
  const coach = docData.coach.replaceAll("_", " ");
  const coverUrl = docData.coverUrl;
  const description = language === "es" ? docData.descrip_es : docData.descrip_en;
  const valueNodes = `${tableNameDB.systemsCollections}/${docData.label}/nodes`;
  const valueLinks = `${tableNameDB.systemsCollections}/${docData.label}/links`;
  const cachedVideoCount = getCachedVideoCount(valueNodes);
  const videoCount =
    docData.nodesCount ??
    docData.videoCount ??
    docData.videosCount ??
    docData.totalVideos ??
    cachedVideoCount;

  return {
    label,
    name,
    valueNodes,
    valueLinks,
    set: "",
    coach,
    coverUrl,
    description,
    videoCount,
    viewsCount: docData.viewsCount ?? 0,
  };
};

export const getSystemSetsShared = async (
  getDocs: any,
  collection: any,
  database: any,
  language = "es",
) => {
  const cacheKey = `system-sets:${language}`;
  const cachedRequest = systemSetsCache.get(cacheKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = (async () => {
    try {
      const setsSnapshot = await getDocs(
        collection(database, "systems_sets/essentials/set"),
      );

      return setsSnapshot.docs.map((doc: any) => {
        const docData = doc.data();
        const uniqueSystemIds = Array.from(
          new Set<string>(docData.systems as string[]),
        );

        return {
          label: docData.label,
          name: language === "es" ? docData.name_es : docData.name_en,
          systems: uniqueSystemIds.map((systemId: string) => ({
            label: systemId,
            name: "",
            valueNodes: "",
            valueLinks: "",
            set: "",
            coach: "",
            coverUrl: "",
            description: "",
          })),
        };
      });
    } catch (error) {
      systemSetsCache.delete(cacheKey);
      console.error("Error obteniendo sets de sistemas desde Firestore:", error);
      return [];
    }
  })();

  request.then((data) => {
    systemSetsSnapshotCache.set(cacheKey, data);
  });
  systemSetsCache.set(cacheKey, request);

  return request;
};

export const getSystemsPageShared = async ({
  firestore,
  language = "es",
  pageSize = 12,
  cursor = null,
}: {
  firestore: {
    collection: any;
    database: any;
    getDocs: any;
    limit: any;
    orderBy: any;
    query: any;
    startAfter: any;
  };
  language?: string;
  pageSize?: number;
  cursor?: SystemsPageCursorShared | null;
}): Promise<SystemsPageShared> => {
  const {
    collection,
    database,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
  } = firestore;

  const dbName = tableNameDB.systemsCollections;
  const systemSets = getCachedSystemSetsShared(language)
    ?? await getSystemSetsShared(getDocs, collection, database, language);
  const baseQueryParts = [
    collection(database, dbName),
    orderBy("label"),
    limit(pageSize),
  ];
  const systemsQuery = cursor
    ? query(baseQueryParts[0], baseQueryParts[1], startAfter(cursor), baseQueryParts[2])
    : query(...baseQueryParts);
  const [querySnapshot, metricsSnapshot] = await Promise.all([
    getDocs(systemsQuery),
    getDocs(collection(database, COURSE_METRICS_COLLECTION)),
  ]);
  const metricsByLabel = new Map<string, any>(
    metricsSnapshot.docs.map((metricDoc: any) => [metricDoc.id, metricDoc.data()]),
  );
  const systems = querySnapshot.docs.map((snapshot: any) => {
    const system = mapSystemDocToOption(snapshot.data(), language);
    const metricData = metricsByLabel.get(system.label);

    return {
      ...system,
      viewsCount:
        metricData?.courseViews ??
        metricData?.viewsCount ??
        system.viewsCount ??
        0,
    };
  });
  const systemToSetName = new Map<string, string>();

  systemSets.forEach((set: testType) => {
    set.systems.forEach((system: SystemCardOption) => {
      if (!systemToSetName.has(system.label)) {
        systemToSetName.set(system.label, set.name);
      }
    });
  });

  const pageSystems: SystemCardUI[] = systems.map((system: SystemCardOption) => ({
    ...system,
    setSystem: systemToSetName.get(system.label) ?? getOtherSystemsLabel(language),
  }));
  const nextCursor =
    querySnapshot.docs.length > 0
      ? querySnapshot.docs[querySnapshot.docs.length - 1]
      : null;

  return {
    systems: pageSystems,
    tagNavigation: Array.from(new Set(systemSets.map((set: testType) => set.name))),
    cursor: nextCursor,
    hasMore: querySnapshot.docs.length === pageSize,
  };
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
    const nodesRequests = dbNames.map((dbName) => getDocs(collection(database, dbName)));
    const videoMetricsRequests = dbNames.map((dbName) => {
      const courseLabel = getCourseLabelFromNodesPath(dbName);

      if (!courseLabel) {
        return Promise.resolve(null);
      }

      return getDocs(collection(database, buildVideoMetricsPath(courseLabel)));
    });
    const [snapshots, videoMetricSnapshots] = await Promise.all([
      Promise.all(nodesRequests),
      Promise.all(videoMetricsRequests),
    ]);

    const results: NodeOptionFirestore[] = snapshots
      .map((querySnapshot, index) => {
        persistStoredVideoCount(dbNames[index], querySnapshot.size);
        const videoMetricsByNodeId = new Map<number, number>();
        const videoMetricsSnapshot = videoMetricSnapshots[index];

        videoMetricsSnapshot?.docs.forEach((metricDoc: any) => {
          const metricData = metricDoc.data();
          const rawNodeId = metricData.nodeId ?? Number(metricDoc.id);
          const nodeId =
            typeof rawNodeId === "number" && Number.isFinite(rawNodeId)
              ? rawNodeId
              : Number(rawNodeId);

          if (Number.isFinite(nodeId)) {
            videoMetricsByNodeId.set(nodeId, metricData.viewsCount ?? 0);
          }
        });

        return querySnapshot.docs.map((doc: { id: string; data: () => any; }) => {
          const docData = doc.data();
          const nodeId = docData.index;
          return {
            docId: doc.id,
            id: nodeId,
            index: nodeId,
            name: language === "es" ? docData.name_es : docData.name_en,
            group: docData.group,
            videoid: docData.videoid,
            viewsCount:
              videoMetricsByNodeId.get(nodeId) ??
              docData.viewsCount ??
              0,
            description:
              language === "es" ? docData.descrip_es : docData.descrip_en,
          };
        });
      })
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
