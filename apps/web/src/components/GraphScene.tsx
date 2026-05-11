import {
  Stars,
  CameraControls,
} from "@react-three/drei";

import { scenePropsDev } from "@src/context/configGlobal";
import { NodeComponent } from "@src/components/index";
import { configGlobal } from "@src/context/index";

// Define las props para GraphScene
type GraphSceneProps = {
  cameraControlsRef: React.RefObject<CameraControls | null>;
};

/**
 * Escena principal del grafo 3D.
 * Renderiza el fondo estrellado, los nodos y las luces principales.
 *
 * @param {GraphSceneProps} props Referencia a los controles de cámara.
 * @returns {JSX.Element} Escena 3D configurada.
 */
const GraphScene: React.FC<GraphSceneProps> = ({ cameraControlsRef }) => {
  return (
    <>
      {/* Fondo estrellado */}
      <Stars
        radius={scenePropsDev.radius}
        depth={scenePropsDev.depth}
        count={scenePropsDev.count}
        factor={scenePropsDev.factor}
        saturation={scenePropsDev.saturation}
        fade
        speed={scenePropsDev.speed}
      />
      {/* Grafo 3D */}
      <NodeComponent cameraControlsRef={cameraControlsRef} />

      {/* Luces */}
      <ambientLight intensity={configGlobal.intensity} />
      <directionalLight
        position={configGlobal.position}
        color={configGlobal.colorLight}
      />
    </>
  );
};

export default GraphScene;
