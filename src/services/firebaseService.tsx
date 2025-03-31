import database from "@src/hooks/fireBase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const getData = async (dbName: string) => {
  try {
    const querySnapshot = await getDocs(collection(database, dbName));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Datos obtenidos:", data);
    return data; // Devuelve los datos si necesitas usarlos en otro lugar
  } catch (error) {
    console.error("Error obteniendo documentos: ", error);
    return [];
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
  dbName: string,
  index: number,
  name: string,
  position: string,
  uniform: boolean,
  description?: string,
  autor?: string,
  linkVideoD?: string,
  uploadedDate?: string,
  uploadedBy?: string
) => {
  console.log("Agregando datos...");
  try {
    // // 📌 1. Crear una consulta para buscar si `name` ya existe
    // const nodesRef = collection(database, dbName);
    // const q = query(nodesRef, where("linkVideo", "==", linkVideoD)); // Cambié "name" a "nombre" para coincidir con Firestore

    // // 📌 2. Ejecutar la consulta con `getDocs`
    // const querySnapshot = await getDocs(q);

    // // 📌 3. Si el documento ya existe, cancelar la operación
    // if (!querySnapshot.empty) {
    //   console.log("❌ Error: Ya existe un documento con este `link`.");
    //   return { success: false, message: "El link ya está registrado." };
    // }

    const docRef = await addDoc(collection(database, dbName), {
      nombre: name,
      index: index,
      posicion: position,
      uniforme: uniform,
      descripcion: description || "null",
      autor: autor || "null",
      linkVideo: linkVideoD || "google.com",
      fechaSubida: uploadedDate || "null",
      subidoPor: uploadedBy || "null",
      likes: 0,
      disLikes: 0,
    });
    console.log("Documento agregado con ID:", index, " - ", docRef.firestore);
  } catch (error) {
    console.error("Error al agregar documento:", error);
  }
};

export { addData, getData, getIndex };
