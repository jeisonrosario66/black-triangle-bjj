import database from "@src/hooks/fireBase";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import useUIStore from "@src/store/useCounterStore";
import { GraphNode, GraphLink, GraphData } from "@src/context/exportType";
import { tableNameDB } from "@src/context/configGlobal";
import { getData } from "@src/services/firebaseService";


const useGraphData = () => {
  /**
   * Este hook recupera nodos y enlaces desde Firebase Firestore y los almacena
   * en el estado local para ser usados en una visualización de grafo.
   */
  const [gData, setGData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    useUIStore.setState({ isLoadingFirestore: true });
    const fetchData = async () => {
      try {
        // 1. Obtener nodos
        // Usamos `getData()` para obtener nodos
        const nodes = await getData(tableNameDB.nodes) as GraphNode[];
        // Filtrar el nodo con index o id igual a 1
        const filteredNodes = nodes.filter((node) => node.id !== 1);


        // 2. Obtener enlaces
        const linksSnapshot = await getDocs(collection(database, tableNameDB.links));
        const links: GraphLink[] = linksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            source: data.source,
            target: data.target,
          };
        });

        setGData({ nodes: filteredNodes, links });
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

export default useGraphData;
