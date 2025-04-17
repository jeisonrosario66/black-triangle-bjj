import ForceGraph3D from "r3f-forcegraph";
import * as THREE from "three";
import animateCameraToNode from "@src/hooks/useCameraAnimation";
import React, { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import useGraphData from "@src/utils/nodeGenerator";
import { GraphRefType, GraphNode } from "@src/context/exportType";
import { CameraControls } from "@react-three/drei";
import { positionColor } from "@src/context/configGlobal";
import SpriteText from "three-spritetext";
import { debugLog } from "@src/utils/debugLog";
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
      // Si el nodo es null o no existe, la función simplemente retorna, evitando errores
      if (!node) {
        return;
      }

      if (!cameraControlsRef.current) {
        console.error("cameraControlsRef no está inicializado.");
      }
      debugLog("info", "Node clicked:", node);
      // nodePosition: Vector con la posición del nodo
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
      linkWidth={2}
      linkCurvature={0.05}
      linkDirectionalParticles={4}
      linkColor={"#000"}
      linkDirectionalParticleWidth={2}
      onNodeClick={handleNodeClick}
      nodeAutoColorBy={(node) =>
        node.position ? positionColor[node.position] : "gray"
      }
      nodeThreeObject={(node: GraphNode) => {
        const group = new THREE.Group();
        const nodeColor = positionColor[node.position || "default"] || "gray"; // Default a gris si no se encuentra el grupo

        const sphereGeometry = new THREE.SphereGeometry(5, 5);
        const sphereMaterial = new THREE.MeshStandardMaterial({
          color: nodeColor, // Asigna el color basado en el grupo
        });

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const sprite = new SpriteText(
          `${node.name} {${node.id}}` || `Node ${node.id}`
        );
        sprite.color = "white";
        sprite.textHeight = 3;
        sprite.position.set(0, 5 + 2, 0);
        sprite.backgroundColor = "#000";

        group.add(sphere);
        group.add(sprite);
        return group;
      }}
    />
  );
};

export default NodeComponent;
