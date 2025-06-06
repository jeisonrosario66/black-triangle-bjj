import { addDoc, collection, getDocs } from "firebase/firestore";

import { debugLog } from "@src/utils/index";
import { database } from "@src/hooks/index";
import {
  NodeOptionFirestone,
  GroupOptionFirestone,
  tableNameDB,
  NodeInsertData,
  cacheUser,
} from "@src/context/index";
import { useUIStore } from "@src/store/index";

/**
 * Consulta una colección de Firestore y devuelve una lista de nodos tipados.
 * @param dbName - Nombre de la colección en Firestore.
 * @returns Lista de nodos formateados como NodeOptionFirestone[].
 */
export const getDataNodes = async (dbName: string) => {
  try {
    const querySnapshot = await getDocs(collection(database, dbName));
    const data: NodeOptionFirestone[] = querySnapshot.docs.map((doc) => {
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
    });
    useUIStore.setState({ documentsFirestore: data})
    debugLog("info", "Idioma: ",  localStorage.getItem(cacheUser.languageUser));
    debugLog("debug", "Documentos obtenidos desde firestone: ", data);
    // Si no existe ningun registro, crea el primero necesario para el funcionamiento de select
    if (data.length == 0) {
      addData({
        dbNodesName: tableNameDB.nodes,
        dbLinksName: tableNameDB.links,
        index: 1,
        name_es: "default",
        name_en: "default",
        group: "",
        nodeSource: 1,
        videoid: "",
        start: "",
        end: "",
        uploadedDate: "",
      });
      getDataNodes(tableNameDB.nodes);
    }
    return data;
  } catch (error) {
    console.error("Error obteniendo documentos desde Firestore:", error);
  }
};

export const getIndex = async (dbName: string) => {
  // Funcion: obtiene el dato ["index"] de mayor valor en el registro
  try {
    const querySnapshot = await getDocs(collection(database, dbName));
    const values = querySnapshot.docs.map((doc) => doc.data()["index"]);
    const maxValue = Math.max(...values.filter((v) => typeof v === "number"));

    return maxValue;
  } catch (error) {
    console.error("Error obteniendo el valor index: ", error);
    return 0;
  }
};

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
    debugLog("debug", "Group obtenidos desde firestone: ", data);
    return data;
  } catch (error) {
    console.error("Error obteniendo documentos desde Firestore:", error);
  }
};
