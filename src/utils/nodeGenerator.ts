import { useState, useEffect } from "react";
import useUIStore from "@src/store/useCounterStore";
import { GraphNode, GraphData } from "@src/context/exportType";
import { getDataNodes, getDataLinks } from "@src/services/index";

const useGraphData = () => {
  /**
   * Este hook recupera nodos y enlaces desde Firebase Firestore y los actualiza
   * dinámicamente cuando cambian las rutas en Zustand.
   */

  // Traemos los arrays directamente del store
  const nodesArray = useUIStore((state) => state.systemBjjSelectedNodes);
  const linksArray = useUIStore((state) => state.systemBjjSelectedLinks);

  const [gData, setGData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      useUIStore.setState({ isLoadingFirestore: true });
      try {
        // Obtener nodos
        const nodes = (await getDataNodes(nodesArray)) as GraphNode[];
        const filteredNodes = nodes.filter((node) => node.id !== 1);

        // Obtener enlaces
        const links = await getDataLinks(linksArray);
        useUIStore.setState({ linksData: links });

        // Actualizar datos globales del grafo
        setGData({ nodes: filteredNodes, links });
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        useUIStore.setState({ isLoadingFirestore: false });
      }
    };

    // Ejecuta cada vez que cambian los arrays del store
    fetchData();
  }, [nodesArray, linksArray]);

  return gData;
};

export default useGraphData;
