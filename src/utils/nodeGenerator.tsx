import database from "@src/hooks/fireBase";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import useUIStore from "@src/store/useCounterStore";

// 📌 Define los nodos y enlaces

// const N = 10;
// const gData = {
//   nodes: [...Array(N).keys()].map((i) => ({
//     id: i,
//     // x: Math.random() * 200 - 100, // Posición aleatoria en el espacio 3D
//     // y: Math.random() * 200 - 100,
//     // z: Math.random() * 200 - 100,
//   })),
//   links: [...Array(N).keys()]
//     .filter((id) => id)
//     .map((id) => ({
//       source: id,
//       target: Math.round(Math.random() * (id - 1)),
//     })),
// };

// const isLoadingFirestore = useUIStore((state) =>  state.isLoadingFirestore);

const GraphComponent = () => {
  const [gData, setGData] = useState<{
    nodes: { id: number }[];
    links: { source: number; target: number }[];
  }>({ nodes: [], links: [] });

  useEffect(() => {
    useUIStore.setState({ isLoadingFirestore: true });
    const fetchData = async () => {
      try {
        // 1. Obtener nodos
        const nodesSnapshot = await getDocs(collection(database, "nodos"));
        const nodes = nodesSnapshot.docs.map((doc) => ({
          id: parseInt(doc.data().index, 10), // Asegura que el ID es un número
          nombre: doc.data().nombre,
          posicion: doc.data().posicion,
          uniforme: doc.data().uniforme,
          descripcion: doc.data().descripcion,
          linkVideo: doc.data().linkVideo,
          likes: doc.data().likes,
          fechaSubida: doc.data().fechaSubida,
          subidoPor: doc.data().subidoPor,
          autor: doc.data().autor,
          disLikes: doc.data().disLikes,

          

          // ...doc.data(),
        }));

        // 2. Obtener enlaces
        const linksSnapshot = await getDocs(collection(database, "links"));
        const links = linksSnapshot.docs.map((doc) => ({
          source: doc.data().source,
          target: doc.data().target,
        }));

        setGData({ nodes, links });
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        useUIStore.setState({ isLoadingFirestore: false });
      }
    };

    fetchData();
  }, []);
  return gData;
};

export default GraphComponent;
