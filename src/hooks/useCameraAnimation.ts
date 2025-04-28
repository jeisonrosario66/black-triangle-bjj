import gsap from "gsap";
import * as THREE from "three";
import { CameraControls } from "@react-three/drei";
import useUIStore from "@src/store/useCounterStore";

/**
 * Mueve la cámara hacia un nodo con animación y guarda la posición anterior.
 */
export const animateCameraToNode = (
  controls: CameraControls,
  nodePosition: THREE.Vector3,
  distance: number = 50
): void => {
  if (!controls) return;

  const fromPos = new THREE.Vector3();
  controls.getPosition(fromPos);

  const fromTarget = new THREE.Vector3();
  controls.getTarget(fromTarget);

  const direction = new THREE.Vector3()
    .subVectors(fromPos, nodePosition)
    .normalize();

  const finalPos = new THREE.Vector3()
    .copy(nodePosition)
    .addScaledVector(direction, distance);

  const animated = { x: fromPos.x, y: fromPos.y, z: fromPos.z };

  gsap.to(animated, {
    x: finalPos.x,
    y: finalPos.y,
    z: finalPos.z,
    duration: 1.5,
    ease: "power2.out",
    onUpdate: () => {
      controls.setLookAt(
        animated.x,
        animated.y,
        animated.z,
        nodePosition.x,
        nodePosition.y,
        nodePosition.z,
        true
      );
    },
    onComplete: () => {
      // Guarda la posición anterior en el store para revertir después
      useUIStore.setState({
        isNodeViewActive: true,
        cameraBackup: {
          pos: fromPos.toArray(),
          target: fromTarget.toArray(),
        },
      });
    },
  });
};

/**
 * Devuelve la cámara a su posición y target anterior con animación.
 */
export const animateCameraBackFromNode = (
  controls: CameraControls
): void => {
  const { cameraBackup } = useUIStore.getState();

  if (!controls || !cameraBackup) return;

  const [x, y, z] = cameraBackup.pos;
  const [tx, ty, tz] = cameraBackup.target;

  const currentPos = new THREE.Vector3();
  controls.getPosition(currentPos);

  const animated = { x: currentPos.x, y: currentPos.y, z: currentPos.z };

  gsap.to(animated, {
    x,
    y,
    z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => {
      controls.setLookAt(animated.x, animated.y, animated.z, tx, ty, tz, true);
    },
    onComplete: () => {
      // Limpia el estado
      useUIStore.setState({
        isNodeViewActive: false,
        cameraBackup: null,
      });
    },
  });
};