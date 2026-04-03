import {
  tableNameDB,
  NodeOptionFirestore,
  SystemCardOption,
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

export const getSystemshared = async (
  getDocs: any,
  collection: any,
  database: any,
  language = "es",
) => {
  const dbName = tableNameDB.systemsCollections;
  // const language = localStorage.getItem(cacheUser.languageUser);

  try {
    // 1. Obtener todos los sistemas
    const querySnapshot = await getDocs(collection(database, dbName));
    const systems: SystemCardOption[] = querySnapshot.docs.map((doc: any) => {
      const docData = doc.data();
      const label = docData.label;
      const name = language === "es" ? docData.name_es : docData.name_en;
      const coach = docData.coach.replaceAll("_", " "); 
      const coverUrl = docData.coverUrl
      const description = language === "es" ? docData.descrip_es : docData.descrip_en;

      return {
        label,
        name,
        valueNodes: `${tableNameDB.systemsCollections}/${docData.label}/nodes`,
        valueLinks: `${tableNameDB.systemsCollections}/${docData.label}/links`,
        coach,
        coverUrl,
        description
      };
    });
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
    console.error("Error obteniendo sistemas desde Firestore:", error);
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
export const getDataNodesShared = async (
  dbNames: string[],
  getDocs: any,
  collection: any,
  database: any,
  language = "es",
) => {
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
    console.error("Error obteniendo documentos desde Firestore:", error);
    return [];
  }
};
