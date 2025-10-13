import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { debugLog } from "@src/utils/index";
import { database } from "@src/hooks/index";
import {
  GroupOptionFirestone,
  tableNameDB,
  NodeInsertData,
  cacheUser,
} from "@src/context/index";
import { useUIStore } from "@src/store/index";
import { Category, Subcategory } from "@src/context/index";

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
      results = snapshots
        .map((querySnapshot) =>
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
        )
        .flat();
      debugLog(
        "debug",
        `Nodos obtenidos desde Firestore(${dbNames}): `,
        results
      );
    } else if (type === "links") {
      results = snapshots
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
          };
        })
      )
      .flat();

    useUIStore.setState({ documentsFirestore: results });
    debugLog(
      "debug",
      `Documentos obtenidos desde Firestore(${tableNameDB.AllSystemsNodesArray}): `,
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
      collection(database, tableNameDB.indexGlobal)
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
 * Agrega un nuevo nodo y, si corresponde, su enlace asociado en Firestore.
 * Además, actualiza el índice global de nodos tras la inserción.
 *
 * @param data - Objeto con la información del nodo y su vínculo opcional.
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
    });

    await updateDoc(
      doc(database, tableNameDB.indexGlobal, tableNameDB.indexGlobalID),
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
      nodeSource !== 1 ? nodeSource : "Nodo sin conexión {1}"
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
      const snapshot = await getDocs(collection(database, tableNameDB.group));
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
        tableNameDB.group,
        groupId,
        tableNameDB.subCategory
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
