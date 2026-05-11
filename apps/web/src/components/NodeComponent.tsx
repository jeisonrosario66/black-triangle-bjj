import React, { useRef, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import ForceGraph3D from "r3f-forcegraph";
import * as THREE from "three";

import { animateCameraToNode } from "@src/hooks/index";
import { useGraphData, debugLog, createNodeObject } from "@src/utils/index";
import { GraphNode, groupColor, tableNameDB, GraphLink } from "@src/context/index";
import { useUIStore } from "@src/store/index";

type NodeComponentProps = {
  cameraControlsRef: React.RefObject<CameraControls | null>;
};

const getLinkEndpointId = (endpoint: GraphLink["source"] | GraphLink["target"]) =>
  typeof endpoint === "number" ? endpoint : endpoint?.id;

/**
 * @deprecated Este componente está fuera de uso.
 * Se mantiene temporalmente por compatibilidad histórica.
 * Fecha de deprecación: 2026-02
 */
const NodeComponent: React.FC<NodeComponentProps> = ({ cameraControlsRef }) => {
  const dagMode = useUIStore((state) => state.dagModeConfig);
  const dagLevel = useUIStore((state) => state.dagLevelDistanceConfig);
  const showFullGraph = useUIStore((state) => state.showFullGraph);

  const graphRef = useRef<any>(undefined);

  useFrame(() => graphRef.current?.tickFrame());

  const gData = useGraphData();
  const rootGroup = tableNameDB.systemsCollections;

  const displayedGraph = useMemo(() => {
    if (!gData.nodes.length) {
      return { nodes: [], links: [] };
    }

    if (showFullGraph) {
      return gData;
    }

    if (!gData.links.length) {
      return {
        nodes: gData.nodes,
        links: [],
      };
    }

    const systemNodes = gData.nodes.filter((node) => node.group === rootGroup);

    if (!systemNodes.length) {
      return gData;
    }

    const systemIds = new Set(systemNodes.map((node) => node.id));
    const directLinks = gData.links.filter((link) => {
      const sourceId = getLinkEndpointId(link.source);
      return typeof sourceId === "number" && systemIds.has(sourceId);
    });

    if (!directLinks.length) {
      return {
        nodes: systemNodes,
        links: [],
      };
    }

    const childIds = new Set(
      directLinks
        .map((link) => getLinkEndpointId(link.target))
        .filter((linkId): linkId is number => typeof linkId === "number"),
    );
    const childNodes = gData.nodes.filter((node) => childIds.has(node.id));

    return {
      nodes: [...systemNodes, ...childNodes],
      links: directLinks,
    };
  }, [gData, rootGroup, showFullGraph]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (!node) {
      return;
    }

    if (!cameraControlsRef.current) {
      console.error("cameraControlsRef no está inicializado.");
      return;
    }

    debugLog("info", "Node clicked:", node);

    const nodePosition = new THREE.Vector3(node.x, node.y, node.z);

    animateCameraToNode(cameraControlsRef.current, nodePosition, 30);
    useUIStore.setState({ nodeViewData: node });
  }, [cameraControlsRef]);

  const resolveNodeObject = useCallback(
    (node: object) => createNodeObject(node as GraphNode),
    [],
  );

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={displayedGraph}
      dagMode={dagMode}
      dagLevelDistance={dagLevel}
      cooldownTicks={80}
      linkWidth={1.5}
      linkCurvature={0.02}
      linkDirectionalParticles={0}
      onNodeClick={(node) => handleNodeClick(node as GraphNode)}
      nodeAutoColorBy={(node) => (node.group ? groupColor[node.group] : "gray")}
      nodeThreeObject={resolveNodeObject}
    />
  );
};

export default NodeComponent;
