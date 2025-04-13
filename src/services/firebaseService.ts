import database from "@src/hooks/fireBase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { debugLog } from "@src/utils/debugLog";
import { NodeOptionFirestone

 } from "@src/context/exportType";
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
      debugLog("info", "docData: ", docData)
      return {
        id: doc.id,
        index: docData.index,
        name: docData.name,
        position: docData.position,
      };
    });
    debugLog("debug", "Documentos obtenidos desde firestone: ", data);
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
  position: string,
  nodeSource: number,
  uploadedDate: string
) => {
  debugLog("info", "Agregando documentos a firestone...");
  try {
    const nodesRef = collection(database, dbNodesName);

    // 1. Crear una consulta para buscar si `name` ya existe
    const q = query(nodesRef, where("name", "==", name)); 
      
    // 2. Ejecutar la consulta con `getDocs`
    const querySnapshot = await getDocs(q);
    // 3. Si el documento ya existe, cancelar la operación
    if (!querySnapshot.empty) {
      console.error(" Error: Ya existe un documento con este `name`.");
      return { success: false, message: "El link ya está registrado." };
    }
    const docNodeRef = await addDoc(collection(database, dbNodesName), {
      name: name,
      index: index,
      position: position,
      uploadedDate: uploadedDate
    });


    const docLinkSource = await addDoc(collection(database, dbLinksName), {
      target: index,
      source: nodeSource,
    });

    debugLog("info", "Documento agregado con ID:", index, " - ", docNodeRef.firestore);
    debugLog("info", "Link  agregado con Source:", nodeSource, " - Target: ", index);
  } catch (error) {
    console.error("Error al agregar documento:", error);
  }
};


export { addData, getData, getIndex };
