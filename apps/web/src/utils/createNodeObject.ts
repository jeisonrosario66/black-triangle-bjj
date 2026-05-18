import * as THREE from "three";
import SpriteText from "three-spritetext";
import { groupColor, GraphNode } from "@src/context";

function createNodeObject(node: GraphNode) {
  const group = new THREE.Group();
  const nodeColor = node.color ?? groupColor[node.group ?? "default"] ?? "gray";
  const emissiveColor = new THREE.Color(nodeColor)
    .lerp(new THREE.Color("#ffffff"), 0.2)
    .getStyle();

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 10, 10),
    new THREE.MeshStandardMaterial({
      color: nodeColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.45,
      roughness: 0.32,
      metalness: 0.18,
    })
  );

  const sprite = new SpriteText(`${node.name} {${node.id}}`);
  sprite.color = "white";
  sprite.textHeight = 3;
  sprite.position.set(0, 7, 0);
  sprite.backgroundColor = "rgba(4, 10, 24, 0.82)";
  group.add(sphere);
  group.add(sprite);

  return group;
}

export default createNodeObject;
