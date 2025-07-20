import { Subcategory } from "@src/context";
import { database } from "@src/hooks/index";

// -------------------------------------------------------------------------
// AGREGAR DATOS RAPIDOS A GRUPOS EN FIRESTORE
// -------------------------------------------------------------------------


const submissionSubcategories: Subcategory[] = [
  {
    label: "armbar",
    title_en: "Armbar",
    title_es: "Llave de brazo",
    description_en:
      "A joint lock that hyperextends the opponent’s elbow by controlling their wrist and applying pressure at the elbow.",
    description_es:
      "Una llave que hiperextiende el codo del oponente controlando su muñeca y aplicando presión en el codo.",
    groupId: "hyperextensions",
    categoryId: "submission",
  },
  {
    label: "kneebar",
    title_en: "Kneebar",
    title_es: "Barra de rodilla",
    description_en:
      "A leg lock that hyperextends the opponent’s knee by isolating the leg and applying backward pressure.",
    description_es:
      "Una llave de pierna que hiperextiende la rodilla del oponente al aislar la pierna y aplicar presión hacia atrás.",
    groupId: "hyperextensions",
    categoryId: "submission",
  },
  {
    label: "straight_ankle_lock",
    title_en: "Straight Ankle Lock",
    title_es: "Llave de tobillo recta",
    description_en:
      "A submission that targets the ankle by forcing plantar flexion, often from Ashi Garami positions.",
    description_es:
      "Una sumisión que ataca el tobillo forzando la flexión plantar, común desde posiciones como Ashi Garami.",
    groupId: "hyperextensions",
    categoryId: "submission",
  },
  {
    label: "estima_lock",
    title_en: "Estima Lock",
    title_es: "Estima Lock",
    description_en:
      "A powerful variation of the straight ankle lock, where pressure is applied quickly while turning inward using the foot's rotation.",
    description_es:
      "Una variación potente de la llave de tobillo recta, aplicando presión rápidamente con rotación interna del pie.",
    groupId: "hyperextensions",
    categoryId: "submission",
  },
];



/**
 * Agrega múltiples subcategorías a Firestore bajo una ruta anidada específica.
 * @param categoryId ID de la categoría principal (ej. "submission")
 * @param groupId ID del grupo secundario (ej. "joint_locks")
 * @param data Arreglo de subcategorías
 */
export const addSubcategoriesToGroup = async (
  categoryId: string,
  groupId: string,
  data: Subcategory[]
) => {
  try {
    const basePath = `taxonomy/${categoryId}/subcategories/${groupId}`;

    for (const sub of data) {
      const docRef = doc(database, basePath, sub.label); // usamos el label como ID de documento
      await setDoc(docRef, {
        ...sub,
        categoryId,
        groupId,
      });
      debugLog("info", `✅ Subcategoría '${sub.label}' añadida correctamente.`);
    }
  } catch (error) {
    console.error("❌ Error al agregar subcategorías:", error);
  }
};
addSubcategoriesToGroup("submission", "hyperextensions|", submissionSubcategories);




const dataExpress = {
  label: "hyperextensions",
  title_en: "Hyperextensions",
  title_es: "Hiperextensiones",
  description_en:
    "Submission techniques that aim to force a joint, such as the elbow or knee, to extend beyond its natural range, typically causing intense pressure and potential damage.",
  description_es:
    "Técnicas de sumisión que buscan forzar una articulación, como el codo o la rodilla, a extenderse más allá de su rango natural, generando presión intensa y posible daño.",
  categoryId: "submission",
};
export const addDataExpress = async (
  dbName: string,
  docId: string,
  data: object
) => {
  try {
    const docRef = doc(database, dbName, docId);
    await setDoc(docRef, data);
    debugLog(
      "info",
      "Data Express agregada a firestore con ID personalizado: ",
      docId,
      data
    );
  } catch (error) {
    console.error("Error al agregar datos express a Firestore:", error);
  }
};
// Ejemplo de uso:
addDataExpress(
  "/taxonomy/submission/subcategories",
  dataExpress.label,
  dataExpress
);

// -------------------------------------------------------------------------
// CONSULTAR DATOS RAPIDOS A GRUPOS EN FIRESTORE
// -------------------------------------------------------------------------
export const getDataExpress = async (dbName: string) => {
  try {
    const subRef = collection(
      database,
      "taxonomy",
      "submission",
      "subcategories",
      "joint_locks",
      "items"
    );

    const querySnapshot = await getDocs(subRef);
    const data = querySnapshot.docs.map((doc) => doc.data());

    // const querySnapshot = await getDocs(q);

    // const data = querySnapshot.docs.map((doc) => doc.data());

    debugLog("info", "Data Express Obtenida de firestore: ", data);
  } catch (error) {
    console.error("Error al obtener datos express de Firestore:", error);
  }
};
getDataExpress("taxonomy");

const normalizeCategoryIds = async () => {
  const oldCollectionRef = collection(database, "taxonomy");
  const snapshot = await getDocs(oldCollectionRef);

  for (const oldDoc of snapshot.docs) {
    const data = oldDoc.data();
    const label = data.label;

    if (!label) continue;

    const newDocRef = doc(database, "taxonomy", label); // Usamos `label` como nuevo ID

    // Crea el nuevo documento
    // await setDoc(newDocRef, data);

    // Elimina el documento antiguo
    // await deleteDoc(oldDoc.ref);

    console.log(`Reemplazado ID ${oldDoc.id} → ${label}`);
  }
};

// normalizeCategoryIds()
