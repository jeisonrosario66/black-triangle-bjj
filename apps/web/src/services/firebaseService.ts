import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { debugLog } from "@src/utils/index";
import { database } from "@src/hooks/index";
import {
  GroupOptionFirestore,
  tableNameDB,
  cacheUser,
  NodeOptionFirestore,
  SystemOption,
  SystemOptionGroup,
  groupColor,
} from "@src/context/index";
import { useUIStore } from "@src/store/index";

const COURSE_METRICS_COLLECTION = "course_metrics";
const VIDEO_METRICS_SUBCOLLECTION = "videos";

const getCourseLabelFromCollectionPath = (path: string) => {
  const pathParts = path.split("/");
  return pathParts.length >= 2 ? pathParts[1] : "";
};

const getLinksPathFromNodesPath = (path: string) =>
  path.endsWith("/nodes") ? `${path.slice(0, -"/nodes".length)}/links` : path;

const buildVideoMetricsPath = (courseLabel: string) =>
  `${COURSE_METRICS_COLLECTION}/${courseLabel}/${VIDEO_METRICS_SUBCOLLECTION}`;

const buildTabsPathFromNodesPath = (path: string) =>
  path.endsWith("/nodes") ? `${path.slice(0, -"/nodes".length)}/tabs` : path;

const chunkNumbers = (values: number[], size: number) => {
  const chunks: number[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
};

const normalizeCategoryId = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const buildNodeCategoryKey = (valueNodes: string, nodeId: number) =>
  `${valueNodes}:${nodeId}`;

const resolveNodeTaxonomyCategories = async (nodes: NodeOptionFirestore[]) => {
  const nodeIdsByCollection = new Map<string, Set<number>>();
  const categoryByNodeKey = new Map<string, string>();

  nodes.forEach((node) => {
    if (!node.valueNodes || !Number.isFinite(node.id)) {
      return;
    }

    const currentIds = nodeIdsByCollection.get(node.valueNodes) ?? new Set<number>();
    currentIds.add(node.id);
    nodeIdsByCollection.set(node.valueNodes, currentIds);
  });

  await Promise.all(
    [...nodeIdsByCollection.entries()].map(async ([valueNodes, nodeIdsSet]) => {
      const uniqueNodeIds = [...nodeIdsSet];

      if (uniqueNodeIds.length === 0) {
        return;
      }

      const tabsPath = buildTabsPathFromNodesPath(valueNodes);
      const dynamicSnapshots = await Promise.all(
        chunkNumbers(uniqueNodeIds, 10).map((nodeIdsChunk) =>
          getDocs(
            query(
              collection(database, tabsPath),
              where("node_index", "in", nodeIdsChunk),
            ),
          ),
        ),
      );

      const resolvedNodeIds = new Set<number>();

      dynamicSnapshots
        .flatMap((snapshot) => snapshot.docs)
        .forEach((taxonomyDoc) => {
          const taxonomyData = taxonomyDoc.data();
          const nodeId = Number(taxonomyData.node_index);
          const categoryId = normalizeCategoryId(taxonomyData.category_id);

          if (!Number.isFinite(nodeId) || !categoryId) {
            return;
          }

          resolvedNodeIds.add(nodeId);
          categoryByNodeKey.set(buildNodeCategoryKey(valueNodes, nodeId), categoryId);
        });

      const missingNodeIds = uniqueNodeIds.filter((nodeId) => !resolvedNodeIds.has(nodeId));

      if (missingNodeIds.length === 0) {
        return;
      }

      const fallbackSnapshots = await Promise.all(
        chunkNumbers(missingNodeIds, 10).map((nodeIdsChunk) =>
          getDocs(
            query(
              collection(database, tableNameDB.nodeTaxonomy),
              where("node_index", "in", nodeIdsChunk),
            ),
          ),
        ),
      );

      fallbackSnapshots
        .flatMap((snapshot) => snapshot.docs)
        .forEach((taxonomyDoc) => {
          const taxonomyData = taxonomyDoc.data();
          const nodeId = Number(taxonomyData.node_index);
          const categoryId = normalizeCategoryId(taxonomyData.category_id);

          if (!Number.isFinite(nodeId) || !categoryId) {
            return;
          }

          const cacheKey = buildNodeCategoryKey(valueNodes, nodeId);

          if (!categoryByNodeKey.has(cacheKey)) {
            categoryByNodeKey.set(cacheKey, categoryId);
          }
        });
    }),
  );

  return categoryByNodeKey;
};

const normalizeCoachName = (coach: unknown, language: string) => {
  const coachName =
    typeof coach === "string" && coach.trim().length > 0
      ? coach.replace(/_/g, " ").trim()
      : "";

  if (coachName) {
    return coachName;
  }

  return language === "es" ? "Sin coach asignado" : "Unassigned coach";
};

const buildSystemsGroups = (
  systems: SystemOption[],
  language: string,
): SystemOptionGroup[] => {
  const uniqueSystems = Array.from(
    new Map(systems.map((system) => [system.valueNodes, system])).values(),
  );

  const completeSystems = uniqueSystems
    .filter((system) => system.coverage?.isComplete)
    .sort((systemA, systemB) => systemA.label.localeCompare(systemB.label));
  const pendingSystems = uniqueSystems
    .filter((system) => !system.coverage?.isComplete)
    .sort((systemA, systemB) => systemA.label.localeCompare(systemB.label));

  const groups: SystemOptionGroup[] = [
    {
      label: "complete",
      name: language === "es" ? "Sistemas completos" : "Complete systems",
      status: "complete",
      systems: completeSystems,
    },
    {
      label: "pending",
      name: language === "es" ? "Pendientes por conectar" : "Pending systems",
      status: "pending",
      systems: pendingSystems,
    },
  ];

  return groups.filter((group) => group.systems.length > 0);
};

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

    const results = snapshots
      .map((querySnapshot, index) => {
        const valueLinks = dbNames[index];
        const systemLabel = getCourseLabelFromCollectionPath(valueLinks);

        return querySnapshot.docs.map((doc) => {
          const docData = doc.data();

          return {
            docId: doc.id,
            valueLinks,
            systemLabel,
            target: docData.target,
            source: docData.source,
          };
        });
      })
      .flat();

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
    const videoMetricsRequests = dbNames.map((dbName) => {
      const courseLabel = getCourseLabelFromCollectionPath(dbName);

      if (!courseLabel) {
        return Promise.resolve(null);
      }

      return getDocs(collection(database, buildVideoMetricsPath(courseLabel)));
    });
    const [snapshots, videoMetricSnapshots] = await Promise.all([
      Promise.all(promises),
      Promise.all(videoMetricsRequests),
    ]);

    const rawResults: NodeOptionFirestore[] = snapshots
      .map((querySnapshot, index) => {
        const valueNodes = dbNames[index];
        const valueLinks = getLinksPathFromNodesPath(valueNodes);
        const systemLabel = getCourseLabelFromCollectionPath(valueNodes);
        const language = localStorage.getItem(cacheUser.languageUser);
        const videoMetricsByNodeId = new Map<number, number>();
        const videoMetricsSnapshot = videoMetricSnapshots[index];

        videoMetricsSnapshot?.docs.forEach((metricDoc) => {
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

        return querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          const nodeId = docData.index;

          return {
            id: nodeId,
            index: nodeId,
            docId: doc.id,
            valueNodes,
            valueLinks,
            systemLabel,
            name: language === "es" ? docData.name_es : docData.name_en,
            group: docData.group,
            videoid: docData.videoid,
            subtitleEs:
              typeof docData.subtitleEs === "string" ? docData.subtitleEs : undefined,
            subtitleEn:
              typeof docData.subtitleEn === "string" ? docData.subtitleEn : undefined,
            viewsCount:
              videoMetricsByNodeId.get(nodeId) ??
              docData.viewsCount ??
              0,
            description: language === "es" ? docData.descrip_es : docData.descrip_en,
          };
        });
      })
      .flat();

    const taxonomyCategories = await resolveNodeTaxonomyCategories(rawResults);
    const results: NodeOptionFirestore[] = rawResults.map((node) => {
      const taxonomyCategoryId = node.valueNodes
        ? taxonomyCategories.get(buildNodeCategoryKey(node.valueNodes, node.id))
        : undefined;
      const nodeColor =
        (taxonomyCategoryId ? groupColor[taxonomyCategoryId] : undefined) ??
        groupColor[node.group ?? ""] ??
        undefined;

      return {
        ...node,
        color: nodeColor,
      };
    });

    useUIStore.setState({ documentsFirestore: results });
    debugLog(
      "debug",
      `Documentos obtenidos desde Firestore(${tableNameDB.AllSystemsNodesArray}): `,
      results,
    );
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
export const getSystem = async () => {
  const dbName = tableNameDB.systemsCollections;
  const language = localStorage.getItem(cacheUser.languageUser) ?? "es";

  try {
    const querySnapshot = await getDocs(collection(database, dbName));
    const systemEntries = querySnapshot.docs.map((doc) => {
      const docData = doc.data();
      const valueNodes = `${tableNameDB.systemsCollections}/${docData.label}/nodes`;
      const valueLinks = `${tableNameDB.systemsCollections}/${docData.label}/links`;
      const totalNodesFromDoc =
        docData.nodesCount ??
        docData.videoCount ??
        docData.videosCount ??
        docData.totalVideos ??
        null;

      return {
        coach: normalizeCoachName(docData.coach, language),
        courseLabel: docData.label,
        label: language === "es" ? docData.name_es : docData.name_en,
        totalNodesFromDoc:
          typeof totalNodesFromDoc === "number" && Number.isFinite(totalNodesFromDoc)
            ? totalNodesFromDoc
            : null,
        valueNodes,
        valueLinks,
      };
    });
    const systems: SystemOption[] = await Promise.all(
      systemEntries.map(async (entry) => {
        const linksSnapshot = await getDocs(collection(database, entry.valueLinks));
        const connectedIds = new Set<number>();

        linksSnapshot.docs.forEach((linkDoc) => {
          const linkData = linkDoc.data();
          const sourceId = Number(linkData.source);
          const targetId = Number(linkData.target);

          if (Number.isFinite(sourceId)) {
            connectedIds.add(sourceId);
          }

          if (Number.isFinite(targetId)) {
            connectedIds.add(targetId);
          }
        });

        const totalNodes =
          entry.totalNodesFromDoc ??
          (await getDocs(collection(database, entry.valueNodes))).size;
        const connectedNodes = Math.min(connectedIds.size, totalNodes);
        const pendingNodes = Math.max(totalNodes - connectedNodes, 0);

        return {
          courseLabel: entry.courseLabel,
          label: entry.label,
          coach: entry.coach,
          valueNodes: entry.valueNodes,
          valueLinks: entry.valueLinks,
          coverage: {
            totalNodes,
            connectedNodes,
            pendingNodes,
            completionRatio: totalNodes > 0 ? connectedNodes / totalNodes : 0,
            isComplete: totalNodes > 0 && connectedNodes >= totalNodes,
          },
        };
      }),
    );

    const groupedSystems = buildSystemsGroups(systems, language);

    debugLog("debug", "Sistemas obtenidos desde Firestore: ", systems);
    debugLog("debug", "Grupos reconstruidos para UI: ", groupedSystems);

    return groupedSystems;
  } catch (error) {
    console.error("Error obteniendo sistemas desde Firestore:", error);
    return [];
  }
};
