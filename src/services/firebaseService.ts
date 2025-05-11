import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

import { debugLog } from "@src/utils/index";
import { database } from "@src/hooks/index";
import { NodeOptionFirestone, tableNameDB, NodeInsertData} from "@src/context/index";
import { useUIStore } from "@src/store/index";

export const getDataWhere = async (dbName: string, rowName: string) => {
  try {
    const query = await getData(dbName);
    const filteredNodes = query
      ?.filter(({ group }) => group === rowName)
      .map(({ id, name, group }) => ({
        id,
        name,
        group,
      }));
    debugLog("info", "Query to group: ", filteredNodes);
    return filteredNodes;
  } catch (error) {
    debugLog("error", "Query: ", rowName, error);
  }
};

/**
 * Consulta una colección de Firestore y devuelve una lista de nodos tipados.
 * @param dbName - Nombre de la colección en Firestore.
 * @returns Lista de nodos formateados como NodeOptionFirestone[].
 */
export const getData = async (dbName: string) => {
  try {
    const querySnapshot = await getDocs(collection(database, dbName));
    const data: NodeOptionFirestone[] = querySnapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: docData.index,
        index: docData.index,
        name: docData.name,
        group: docData.group,
        start: docData.start,
        end: docData.end,
        videoid: docData.videoid,
      };
    });
    debugLog("debug", "Documentos obtenidos desde firestone: ", data);
    // Si no existe ningun registro, crea el primero necesario para el funcionamiento de select
    if (data.length == 0) {
      addData({
        dbNodesName: tableNameDB.nodes,
        dbLinksName: tableNameDB.links,
        index: 1,
        name: "Escoja Nodo de origen",
        group: "",
        nodeSource: 1,
        videoid: "",
        start: "",
        end: "",
        uploadedDate: ""
      });
      getData(tableNameDB.nodes);
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
    name,
    group,
    nodeSource,
    videoid,
    start,
    end,
    uploadedDate,
  } = data;

  try {
    const nodesRef = collection(database, dbNodesName);
    const nameLowerCase = name.toLowerCase();

    const q = query(nodesRef, where("name", "==", nameLowerCase));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.error(" Error: Ya existe un documento con este `name`.");
      return;
    }

    await addDoc(collection(database, dbNodesName), {
      name: nameLowerCase,
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

    debugLog("info", "Nodo agregado:", nameLowerCase, index);
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

