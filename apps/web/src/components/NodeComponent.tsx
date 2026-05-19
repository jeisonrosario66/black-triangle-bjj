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

const brightenColor = (colorValue: string, amount: number) =>
  `#${new THREE.Color(colorValue).lerp(new THREE.Color("#ffffff"), amount).getHexString()}`;

/**
 * @deprecated Este componente está fuera de uso.
 * Se mantiene temporalmente por compatibilidad histórica.
 * Fecha de deprecación: 2026-02
 */
const NodeComponent: React.FC<NodeComponentProps> = ({ cameraControlsRef }) => {
  const dagMode = useUIStore((state) => state.dagModeConfig);
  const dagLevel = useUIStore((state) => state.dagLevelDistanceConfig);
  const showFullGraph = useUIStore((state) => state.showFullGraph);
  const graphRefreshToken = useUIStore((state) => state.graphRefreshToken);

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

  const nodeColorById = useMemo(
    () =>
      new Map(
        displayedGraph.nodes.map((node) => [
          node.id,
          node.color ?? groupColor[node.group ?? "default"] ?? "#8E8E8E",
        ]),
      ),
    [displayedGraph.nodes],
  );
  const linkLineColorById = useMemo(
    () =>
      new Map(
        [...nodeColorById.entries()].map(([nodeId, colorValue]) => [
          nodeId,
          brightenColor(colorValue, 0.18),
        ]),
      ),
    [nodeColorById],
  );
  const linkParticleColorById = useMemo(
    () =>
      new Map(
        [...nodeColorById.entries()].map(([nodeId, colorValue]) => [
          nodeId,
          brightenColor(colorValue, 0.38),
        ]),
      ),
    [nodeColorById],
  );

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
  const graphLayoutKey = `${dagMode || "none"}:${dagLevel}:${showFullGraph ? "full" : "focus"}:${graphRefreshToken}`;

  return (
    <ForceGraph3D
      key={graphLayoutKey}
      ref={graphRef}
      graphData={displayedGraph}
      dagMode={dagMode || undefined}
      dagLevelDistance={dagLevel}
      cooldownTicks={80}
      linkWidth={2.4}
      linkOpacity={0.92}
      linkCurvature={0.045}
      linkColor={(link) =>
        linkLineColorById.get(getLinkEndpointId(link.source) ?? -1) ?? "#A3B7D8"
      }
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={3.1}
      linkDirectionalParticleSpeed={0.0035}
      linkDirectionalParticleColor={(link) =>
        linkParticleColorById.get(getLinkEndpointId(link.source) ?? -1) ?? "#EAF4FF"
      }
      onNodeClick={(node) => handleNodeClick(node as GraphNode)}
      nodeAutoColorBy={(node) =>
        (node as GraphNode).color ??
        ((node as GraphNode).group ? groupColor[(node as GraphNode).group] : "gray")
      }
      nodeThreeObject={resolveNodeObject}
    />
  );
};

export default NodeComponent;
