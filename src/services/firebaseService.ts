import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  DocumentData,
  setDoc,
  query,
  where,
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

// -------------------------------------------------------------------------
// 1️⃣ OBTENER DATOS (LINKS) DESDE VARIAS COLECCIONES
// -------------------------------------------------------------------------
// Hace un `getDocs` en paralelo de varias colecciones de enlaces.
// Combina todos en un solo array.
export const getDataLinks = async (dbNames: string[]) => {
  try {
    // Creamos promises en paralelo
    const promises = dbNames.map((dbName) =>
      getDocs(collection(database, dbName))
    );
    // Esperamos a que termine de leer todas las colecciones
    const snapshots = await Promise.all(promises);

    // Unificamos en un solo array
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
      `Enlaces obtenidos desde firestone(${dbNames}): `,
      results
    );
    return results;
  } catch (error) {
    console.error("Error obteniendo enlaces desde Firestore:", error);
    return []; // o puedes lanzar el error si así lo deseas
  }
};

// -------------------------------------------------------------------------
// 2️⃣ OBTENER DATOS (NODES) DESDE VARIAS COLECCIONES
// -------------------------------------------------------------------------
// Hace un `getDocs` en paralelo de varias colecciones de nodos.
// Combina todos en un solo array de nodos.
export const getDataNodes = async (dbNames: string[]) => {
  try {
    // Creamos promises en paralelo
    const promises = dbNames.map((dbName) =>
      getDocs(collection(database, dbName))
    );

    // Esperamos a que termine de leer todas las colecciones
    const snapshots = await Promise.all(promises);

    // Unificamos en un solo array de nodos
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
      `Documentos obtenidos desde firestone(${tableNameDB.nodesArray}): `,
      results
    );
    return results;
  } catch (error) {
    console.error("Error obteniendo documentos desde Firestore:", error);
    return []; // o puedes lanzar el error si así lo deseas
  }
};

// -------------------------------------------------------------------------
// 3️⃣ OBTENER ÚLTIMO INDEX (MAYOR)
// -------------------------------------------------------------------------
// Busca el valor más grande en el campo "index" de toda la colección.
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

// -------------------------------------------------------------------------
// 4️⃣ AGREGAR NUEVOS DATOS A NODES + LINKS
// -------------------------------------------------------------------------
// Agrega primero el nuevo nodo, luego actualiza el index, y finalmente
// añade el link si tiene fuente.
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
    // Agregar nuevo node
    await addDoc(collection(database, dbNodesName), {
      name_es: name_es.trim().toLowerCase(), // normalizamos
      name_en: name_en.trim().toLowerCase(), // normalizamos
      index,
      group,
      uploadedDate,
      videoid,
      start,
      end,
    });

    // Actualizamos el último index utilizado
    await updateDoc(
      doc(database, tableNameDB.indexGlobal, tableNameDB.indexGlobalID),
      { index }
    );

    // Finalmente, si tiene fuente, también grabamos el nuevo link
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

// -------------------------------------------------------------------------
// 5️⃣ OBTENER DATOS DE GRUPOS
// -------------------------------------------------------------------------
// Busca grupos en Firestore y proporciona la traducción según el idioma.
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

    debugLog("debug", "Groups obtenidos desde firestone: ", data);
    return data;
  } catch (error) {
    console.error("Error obteniendo grupos desde Firestore:", error);
    return []; // o puedes lanzar el error si así lo deseas
  }
};
