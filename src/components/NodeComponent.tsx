import React, { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import ForceGraph3D from "r3f-forcegraph";
import * as THREE from "three";

import { animateCameraToNode } from "@src/hooks/index";
import { useGraphData, debugLog, createNodeObject} from "@src/utils/index";
import { GraphRefType, GraphNode, groupColor } from "@src/context/index";
import { useUIStore } from "@src/store/index";

type NodeComponentProps = {
  cameraControlsRef: React.RefObject<CameraControls>;
};

const NodeComponent: React.FC<NodeComponentProps> = ({ cameraControlsRef }) => {
  const graphRef = useRef<GraphRefType>(undefined); // Referencia para el grafo 3D
  useFrame(() => graphRef.current?.tickFrame()); // Actualizar el grafo en cada frame
  // Llama a la función para obtener los datos del grafo
  const gData = useGraphData();
  
  const handleNodeClick = useCallback(
    /**
     * @summary: Manejar el evento de clic sobre un nodo
     * @param node
     */
    (node: GraphNode) => {
      if (!node) {
        return;
      }

      if (!cameraControlsRef.current) {
        console.error("cameraControlsRef no está inicializado.");
        return;
      }
      debugLog("info", "Node clicked:", node);
      // nodePosition: Vector con la posición del nodo
      const nodePosition = new THREE.Vector3(
        node.x ?? 0,
        node.y ?? 0,
        node.z ?? 0
      );
      // Llamamos a la animación de la cámara
      animateCameraToNode(cameraControlsRef.current, nodePosition, 30);
      useUIStore.setState({ nodeViewData: node });
    },
    [cameraControlsRef]
  );

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={gData}
      linkWidth={2}
      linkCurvature={0.05}
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={2}
      onNodeClick={handleNodeClick}
      nodeAutoColorBy={(node) => (node.group ? groupColor[node.group] : "gray")}
      nodeThreeObject={(node) => createNodeObject(node as GraphNode)}
    />
  );
};

export default NodeComponent;
