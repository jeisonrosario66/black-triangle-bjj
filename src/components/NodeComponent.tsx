import ForceGraph3D from "r3f-forcegraph";
import * as THREE from "three";
// import gsap from "gsap";
import animateCameraToNode from "@src/hooks/useCameraAnimation"; // Animación de la cámara
import React, { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import GraphComponent from "@src/utils/nodeGenerator"; // Datos del grafo
import { GraphRefType, GraphNode } from "@src/context/exportType"; // Tipo de referencia para el grafo
import { CameraControls } from "@react-three/drei";

type NodeComponentProps = {
  cameraControlsRef: React.RefObject<CameraControls>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NodeComponent: React.FC<NodeComponentProps> = ({ cameraControlsRef }) => {
  useFrame(() => graphRef.current?.tickFrame()); // Actualizar el grafo en cada frame
  const graphRef = useRef<GraphRefType>(undefined); // Referencia para el grafo 3D
  const gData = GraphComponent(); // Llama a la función para obtener los datos del grafo

  const handleNodeClick = useCallback(
    // Manejar el evento de clic sobre un nodo
    (node: GraphNode | null) => {
      // Si el nodo es null o no existe, la función simplemente retorna, evitando errores
      if (!node) {
        return;
      }
      if (!cameraControlsRef.current) {
        console.error("❌ cameraControlsRef no está inicializado.");
      }
      console.info("Node clicked:", node); // Imprimir el nodo en la consola
      // Creamos un vector con la posición del nodo
      const nodePosition = new THREE.Vector3(
        node.x || 0,
        node.y || 0,
        node.z || 0
      );
      // Llamamos a la animación de la cámara
      animateCameraToNode(cameraControlsRef.current, nodePosition, 30);
    },
    [cameraControlsRef]
  );

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={gData}
      onNodeClick={(node) => handleNodeClick(node)} // Pasamos controls
      //   onNodeHover={handleNodeHover}
    />
  );
};

export default NodeComponent;
