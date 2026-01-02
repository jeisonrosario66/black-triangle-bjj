import React, {useRef, useCallback, useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import {CameraControls} from "@react-three/drei";
import ForceGraph3D from "r3f-forcegraph";
import * as THREE from "three";

import {animateCameraToNode} from "@src/hooks/index";
import {useGraphData, debugLog, createNodeObject} from "@src/utils/index";
import {GraphRefType, GraphNode, groupColor} from "@src/context/index";
import {useUIStore} from "@src/store/index";

type NodeComponentProps = {
    cameraControlsRef: React.RefObject<CameraControls | null>;
};

const NodeComponent: React.FC<NodeComponentProps> = ({cameraControlsRef}) => { // Configuración global desde el store
    const dagMode = useUIStore((state) => state.dagModeConfig);
    const dagLevel = useUIStore((state) => state.dagLevelDistanceConfig);
    const showFullGraph = useUIStore((state) => state.showFullGraph);

    // Referencia al grafo 3D
    const graphRef = useRef < GraphRefType > (undefined);

    // Tick en cada frame para animación continua
    useFrame(() => graphRef.current ?. tickFrame());

    // Datos del grafo (nodos y enlaces) obtenidos de Firestore u otra fuente
    const gData = useGraphData();
    const rootGroup = "system"; // Grupo raíz desde el cual se expande el grafo

    const displayedGraph = useMemo(() => {
        if (! gData.nodes.length || ! gData.links.length) {
            return {nodes: [], links: []};
        }
        if (showFullGraph) {
            return gData;
        }
        // Filtra según el grupo root
        const systemNodes = gData.nodes.filter((n) => n.group === rootGroup);
        if (! systemNodes.length) 
            return {nodes: [], links: []};
        

        const systemIds = new Set(systemNodes.map((n) => n.id));

        const directLinks = gData.links.filter((l) => systemIds.has(l.source));

        const childIds = new Set(directLinks.map((l) => l.target));

        const childNodes = gData.nodes.filter((n) => childIds.has(n.id));

        return {
            nodes: [
                ... systemNodes,
                ... childNodes
            ],
            links: directLinks
        };
    }, [gData, showFullGraph]);

    /**
   * Maneja el clic sobre un nodo: guarda la vista del nodo clickeado y anima la cámara hacia él.
   */
    const handleNodeClick = useCallback((node : GraphNode) => {
        if (!node) 
            return;
        

        if (!cameraControlsRef.current) {
            console.error("cameraControlsRef no está inicializado.");
            return;
        }

        debugLog("info", "Node clicked:", node);

        // Posición del nodo clickeado
        const nodePosition = new THREE.Vector3(node.x, node.y, node.z);

        // (Opcional) animar la cámara hacia el nodo
        animateCameraToNode(cameraControlsRef.current, nodePosition, 30);
        // Guardar datos del nodo clickeado en el store
        useUIStore.setState({nodeViewData: node});
    }, [cameraControlsRef]);

    return (<ForceGraph3D ref={graphRef}
        graphData={displayedGraph}
        dagMode={dagMode}
        dagLevelDistance={dagLevel}
        linkWidth={2}
        linkCurvature={0.05}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={2}
        onNodeClick={handleNodeClick}
        nodeAutoColorBy={
            (node) => (node.group ? groupColor[node.group] : "gray")
        }
        nodeThreeObject={
            (node) => createNodeObject(node as GraphNode)
        }/>);
};

export default NodeComponent;
