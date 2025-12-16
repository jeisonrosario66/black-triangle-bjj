import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

import { debugLog } from "@src/utils/index";
import { database } from "@src/hooks/index";
import {
  GroupOptionFirestone,
  firestoreSchema,
  NodeInsertData,
  cacheUser,
  Category,
  Subcategory,
} from "@src/context/index";
import { useUIStore } from "@src/store/index";

/**
 * Recupera documentos desde Firestore en función del tipo de datos solicitado.
 * Permite obtener nodos o enlaces de múltiples colecciones simultáneamente.
 * Normaliza los datos según el idioma y la estructura esperada por el grafo.
 *
 * @param dbNames - Lista de colecciones de Firestore a consultar.
 * @param type - Define si se recuperan "nodes" o "links".
 * @returns Un arreglo de nodos o enlaces normalizados.
 */
export const getDataFirestore = async (
  dbNames: string[],
  type: "nodes" | "links"
) => {
  try {
    const promises = dbNames.map((dbName) =>
      getDocs(collection(database, dbName))
    );
    const snapshots = await Promise.all(promises);
    let results: any[] = [];

    if (type === "nodes") {
      const language = localStorage.getItem(cacheUser.languageUser) || "en";
      results = snapshots.flatMap((querySnapshot) =>
        querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: docData.index,
            index: docData.index,
            name: language === "es" ? docData.name_es : docData.name_en,
            group: docData.group,
            start: docData.start,
            end: docData.end,
            videoid: docData.videoid,
          };
        })
      );

      debugLog(
        "debug",
        `Nodos obtenidos desde Firestore(${dbNames}): `,
        results
      );
    } else if (type === "links") {
      results = snapshots.flatMap((querySnapshot) =>
        querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            target: docData.target,
            source: docData.source,
          };
        })
      );

      debugLog(
        "debug",
        `Enlaces obtenidos desde Firestore(${dbNames}): `,
        results
      );
    }

    return results;
  } catch (error) {
    console.error("Error obteniendo datos desde Firestore:", error);
    return [];
  }
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
    const promises = dbNames.map((dbName) =>
      getDocs(collection(database, dbName))
    );
    const snapshots = await Promise.all(promises);

    const results = snapshots
      .map((querySnapshot) =>
        querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            target: docData.target,
            source: docData.source,
          };
        })
      )
      .flat();

    debugLog(
      "debug",
      `Enlaces obtenidos desde Firestore(${dbNames}): `,
      results
    );
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
    const promises = dbNames.map((dbName) =>
      getDocs(collection(database, dbName))
    );
    const snapshots = await Promise.all(promises);

    const results = snapshots
      .map((querySnapshot) =>
        querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: docData.index,
            index: docData.index,
            name:
              localStorage.getItem(cacheUser.languageUser) === "es"
                ? docData.name_es
                : docData.name_en,
            group: docData.group,
            start: docData.start,
            end: docData.end,
            videoid: docData.videoid,
            description:
              localStorage.getItem(cacheUser.languageUser) === "es"
                ? docData.descrip_es
                : docData.descrip_en,
          };
        })
      )
      .flat();
    useUIStore.setState({ documentsFirestore: results });
    debugLog(
      "debug",
      `Documentos obtenidos desde Firestore(${firestoreSchema.cachedSystemNodes}): `,
      results
    );
    return results;
  } catch (error) {
    console.error("Error obteniendo documentos desde Firestore:", error);
    return [];
  }
};

/**
 * Obtiene el valor máximo del campo "index" desde la colección global de índices.
 * Se utiliza para asignar el siguiente identificador numérico disponible.
 *
 * @returns El valor máximo encontrado o 0 si ocurre un error.
 */
export const getIndex = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(database, firestoreSchema.globalIndexCollection)
    );
    const values = querySnapshot.docs.map((doc) => doc.data()["index"]);
    const maxValue = Math.max(...values.filter((v) => typeof v === "number"));
    return maxValue;
  } catch (error) {
    console.error("Error obteniendo el valor index: ", error);
    return 0;
  }
};

/**
 * Agrega un nuevo nodo en Firestore y, opcionalmente, crea un enlace
 * hacia otro nodo existente. Finalmente, actualiza el índice global
 * de nodos.
 *
 * @param data - Objeto que encapsula toda la información necesaria para la inserción.
 * @param data.dbNodesName - Nombre de la colección de Firestore donde se almacenan los nodos.
 * @param data.dbLinksName - Nombre de la colección de Firestore donde se almacenan los enlaces entre nodos.
 * @param data.index - Identificador numérico único del nodo dentro del grafo.
 * @param data.name_es - Nombre del nodo en español; se normaliza a minúsculas antes de persistirse.
 * @param data.name_en - Nombre del nodo en inglés; se normaliza a minúsculas antes de persistirse.
 * @param data.group - Grupo o categoría a la que pertenece el nodo (usado para clasificación o visualización).
 * @param data.nodeSource - Índice del nodo origen al que se conectará este nodo.
 *                           Si el valor es 1, se considera un nodo sin conexión y no se crea enlace.
 * @param data.videoid - Identificador del video asociado al nodo.
 * @param data.start - Tiempo inicial (en segundos) del fragmento relevante del video.
 * @param data.end - Tiempo final (en segundos) del fragmento relevante del video.
 * @param data.uploadedDate - Fecha de carga del nodo o del recurso asociado.
 * @param data.descrip_en - Descripción del nodo en inglés.
 * @param data.descrip_es - Descripción del nodo en español.
 */
export const addData = async (data: NodeInsertData) => {
  const {
    dbNodesName,
    dbLinksName,
    index,
    name_es,
    name_en,
    group,
    nodeSource,
    videoid,
    start,
    end,
    uploadedDate,
    descrip_en,
    descrip_es,
  } = data;

  try {
    await addDoc(collection(database, dbNodesName), {
      name_es: name_es.trim().toLowerCase(),
      name_en: name_en.trim().toLowerCase(),
      index,
      group,
      uploadedDate,
      videoid,
      start,
      end,
      descrip_en,
      descrip_es,
    });

    await updateDoc(
      doc(database, firestoreSchema.globalIndexCollection, firestoreSchema.globalIndexDocId),
      { index }
    );

    if (nodeSource !== 1) {
      await addDoc(collection(database, dbLinksName), {
        target: index,
        source: nodeSource,
      });
    }

    debugLog("info", "Nodo agregado:", name_es, name_en, index);
    debugLog(
      "info",
      "Link agregado: Source:",
      nodeSource === 1 ? "Nodo sin conexión {1}" : nodeSource
    );
  } catch (error) {
    console.error("Error al agregar documento:", error);
  } finally {
    useUIStore.setState({ isUploadFirestore: false });
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

    const data: GroupOptionFirestone[] = querySnapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        label: docData.label,
        title: language === "es" ? docData.title_es : docData.title_en,
        description:
          language === "es" ? docData.description_es : docData.description_en,
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
 * Hook React que obtiene las categorías principales desde Firestore.
 * Realiza la traducción de campos de texto según el idioma configurado.
 *
 * @returns Lista de categorías traducidas.
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const language = localStorage.getItem(cacheUser.languageUser) || "en";

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDocs(collection(database, firestoreSchema.categories));
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data() as Category;
        return {
          label: doc.id,
          title: language === "en" ? docData.title_en : docData.title_es,
          title_es: docData.title_es,
          title_en: docData.title_en,
          description:
            language === "en" ? docData.description_en : docData.description_es,
          description_es: docData.description_es,
          description_en: docData.description_en,
          categoryId: docData.categoryId,
        };
      });
      setCategories(data);
    };
    fetch();
  }, [language]);

  return categories;
};

/**
 * Hook React que obtiene las subcategorías asociadas a un grupo específico.
 * Las descripciones y títulos se adaptan al idioma activo en cacheUser.
 *
 * @param groupId - Identificador del grupo al que pertenecen las subcategorías.
 * @returns Lista de subcategorías traducidas pertenecientes al grupo indicado.
 */
export const useSubcategories = (groupId: string) => {
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const language = localStorage.getItem(cacheUser.languageUser) || "en";

  useEffect(() => {
    if (!groupId) return;
    const fetch = async () => {
      const subRef = collection(
        database,
        firestoreSchema.categories,
        groupId,
        firestoreSchema.subcategories
      );
      const snapshot = await getDocs(subRef);
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data() as Subcategory;
        return {
          label: doc.id,
          title: language === "en" ? docData.title_en : docData.title_es,
          title_es: docData.title_es,
          title_en: docData.title_en,
          description:
            language === "en" ? docData.description_en : docData.description_es,
          description_es: docData.description_es,
          description_en: docData.description_en,
          categoryId: docData.categoryId,
          groupId: docData.groupId,
        };
      });
      setSubCategories(data);
    };

    fetch();
  }, [groupId, language]);

  return subCategories;
};

/**
 * Interfaz para insertar la taxonomía de un nodo.
 * Define los campos requeridos y opcionales al crear o asignar taxonomía a un nodo.
 *
 * @property {number} nodeIndex Índice identificador del nodo.
 * @property {string} [categoryId] ID de la categoría principal del nodo.
 * @property {string} [subcategoryId] ID de la subcategoría asociada.
 * @property {string[]} tabIds Lista de IDs de pestañas asociadas al nodo.
 */
export interface NodeTaxonomyInsert {
  nodeIndex: number;
  categoryId?: string;
  subcategoryId?: string;
  specificCategoryId?: string;
  tabIds: string[];
}

/**
 * Asigna taxonomía a un nodo en Firestore.
 * Crea un documento en la colección de nodeTaxonomy con la información proporcionada.
 *
 * @param {NodeTaxonomyInsert} data Objeto con los datos de taxonomía a insertar.
 * @returns {Promise<void>} Promesa que se resuelve cuando la operación finaliza.
 */
export const addNodeTaxonomy = async (data: NodeTaxonomyInsert) => {
  try {
    await addDoc(collection(database, firestoreSchema.nodeTaxonomy), {
      node_index: data.nodeIndex,
      category_id: data.categoryId ?? null,
      subcategory_id: data.subcategoryId ?? null,
      specific_category_id: data.specificCategoryId ?? null,
      tab_ids: data.tabIds,
    });

    debugLog("info", "Taxonomía asignada al nodo:", data.nodeIndex);
  } catch (error) {
    console.error("Error asignando taxonomía:", error);
  }
};
