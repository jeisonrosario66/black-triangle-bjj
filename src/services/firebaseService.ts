import { database } from "@src/hooks/fireBase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { debugLog } from "@src/utils/debugLog";
import {
  NodeOptionFirestone

} from "@src/context/exportType";
import { tableNameDB } from "@src/context/configGlobal";
import useUIStore from "@src/store/useCounterStore";
import { useState } from "react";


const getDataWhere = async (dbName: string, rowName: string) => {
  try {
    const query = await getData(dbName)
    const filteredNodes = query
      ?.filter(({ group }) => group === rowName)
      .map(({ id, name, group }) => ({
        id,
        name,
        group,
      }));
    debugLog("info", "Query to group: ", filteredNodes)
    return filteredNodes
  } catch (error) {

    debugLog("error", "Query: ", rowName, error)
  }
}

const getData = async (dbName: string) => {
  /**
   * Consulta una colección de Firestore y devuelve una lista de nodos tipados.
   * @param dbName - Nombre de la colección en Firestore.
   * @returns Lista de nodos formateados como NodeOptionFirestone[].
   */
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
      addData(tableNameDB.nodes, tableNameDB.links, 1, "Escoja Nodo de origen", "", 1, "")
      getData(tableNameDB.nodes)
    }
    return data;
  } catch (error) {
    console.error("Error obteniendo documentos desde Firestore:", error);
  }
};

const getIndex = async (dbName: string) => {
  // Funcion: obtiene el dato ["index"] de mayor valor en el registro
  try {
    const querySnapshot = await getDocs(collection(database, dbName));
    const values = querySnapshot.docs.map((doc) => doc.data()["index"]);
    const maxValue = Math.max(...values.filter((v) => typeof v === "number"));

    //   console.log(`Valor más alto en index:`, maxValue);
    return maxValue;
  } catch (error) {
    console.error("Error obteniendo el valor index: ", error);
    return 0;
  }
};

const addData = async (
  dbNodesName: string,
  dbLinksName: string,
  index: number,
  name: string,
  group: string,
  nodeSource: number,
  uploadedDate: string
) => {
  try {
    const nodesRef = collection(database, dbNodesName);
    const nameLowerCase = name.toLowerCase
    // 1. Crear una consulta para buscar si `name` ya existe
    const q = query(nodesRef, where("name", "==", nameLowerCase));

    // 2. Ejecutar la consulta con `getDocs`
    const querySnapshot = await getDocs(q);
    // 3. Si el documento ya existe, cancelar la operación
    if (!querySnapshot.empty) {
      console.error(" Error: Ya existe un documento con este `name`.");
    }
    await addDoc(collection(database, dbNodesName), {
      name: nameLowerCase,
      index: index,
      group: group,
      uploadedDate: uploadedDate
    });


    if (nodeSource !== 1) {
      // Filtra para evitar guardar ensalaces cuando el source es igual a 1
      await addDoc(collection(database, dbLinksName), {
        target: index,
        source: nodeSource,
      });
    }
    // Modifica el estado global para indicar que se estan cargando datos a firestore
    useUIStore.setState({ isUploadFirestore: false })
    debugLog("info", "Nodo agregado:", nameLowerCase, index);
    debugLog("info", "Link  agregado: Source:", nodeSource !== 1 ? nodeSource : "Nodo sin conexción {1}");
  } catch (error) {
    console.error("Error al agregar documento:", error);
  }
};


export { addData, getData, getIndex, getDataWhere };
