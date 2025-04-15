import database from "@src/hooks/fireBase";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import useUIStore from "@src/store/useCounterStore";
import { GraphNode, GraphLink, GraphData} from "@src/context/exportType";
import { tableNameDB } from "@src/context/configGlobal";



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
        const nodesSnapshot = await getDocs(
          collection(database, tableNameDB.nodes)
        );
        const nodes: GraphNode[] = nodesSnapshot.docs.map((doc) => {
          const data = doc.data();

          // Esta informacion se mostrara al hacer click en un nodo
          // handleCLickNode
          return {
            id: parseInt(data.index, 10), 
            name: data.name,
            position: data.position, 
            color: data.color,
            group: data.group,
          };
        });

        // 2. Obtener enlaces
        const linksSnapshot = await getDocs(collection(database, tableNameDB.links));
        const links: GraphLink[] = linksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            source: data.source,
            target: data.target,
          };
        });

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

export default useGraphData;
