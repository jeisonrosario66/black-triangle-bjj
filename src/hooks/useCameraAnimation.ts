import gsap from "gsap";
import * as THREE from "three";
import { CameraControls } from "@react-three/drei";

const animateCameraToNode = (
  controls: CameraControls,
  nodePosition: THREE.Vector3,
  distance: number = 50
) => {
  if (!controls) return;

  // Obtenemos la posición actual de la cámara
  const currentPos = new THREE.Vector3();
  controls.getPosition(currentPos);

  // Calculamos la dirección desde el nodo a la cámara
  const direction = new THREE.Vector3()
    .subVectors(currentPos, nodePosition)
    .normalize();

  // Posición final: nos alejamos del nodo a la distancia indicada
  const finalPos = new THREE.Vector3().copy(nodePosition).addScaledVector(direction, distance);

  // Usamos gsap para animar tanto la posición como el lookAt de la cámara
  gsap.to(currentPos, {
    x: finalPos.x,
    y: finalPos.y,
    z: finalPos.z,
    duration: 1.5,
    ease: "power2.out",
    onUpdate: () => {
      // Actualizamos la posición y la dirección de la cámara en cada frame de la animación
      controls.setLookAt(
        currentPos.x,
        currentPos.y,
        currentPos.z, // Posición actual de la cámara
        nodePosition.x,
        nodePosition.y,
        nodePosition.z, // El nodo al que apuntamos
        true // Indica si se debe actualizar inmediatamente
      );
    },
  });
};

export default animateCameraToNode;