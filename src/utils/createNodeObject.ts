import * as THREE from "three";
import SpriteText from "three-spritetext";
import { groupColor, GraphNode } from "@src/context";

function createNodeObject(node: GraphNode) {
  const group = new THREE.Group();
  const nodeColor = groupColor[node.group || "default"] || "gray";

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 5),
    new THREE.MeshStandardMaterial({ color: nodeColor })
  );

  const sprite = new SpriteText(`${node.name} {${node.id}}`);
  sprite.color = "white";
  sprite.textHeight = 3;
  sprite.position.set(0, 7, 0);
  sprite.backgroundColor = "#000";
  group.add(sphere);
  group.add(sprite);

  return group;
}

export default createNodeObject;
