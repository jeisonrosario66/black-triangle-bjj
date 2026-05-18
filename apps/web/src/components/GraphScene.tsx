import {
  Stars,
  Sparkles,
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
      <Sparkles
        count={72}
        size={2.4}
        scale={[260, 160, 260]}
        speed={0.22}
        opacity={0.5}
        color="#62DAFF"
        noise={0.8}
      />
      {/* Grafo 3D */}
      <NodeComponent cameraControlsRef={cameraControlsRef} />

      {/* Luces */}
      <ambientLight intensity={configGlobal.intensity} />
      <hemisphereLight
        intensity={0.55}
        color="#78CFFF"
        groundColor="#050816"
      />
      <directionalLight
        position={configGlobal.position}
        color={configGlobal.colorLight}
        intensity={1.2}
      />
      <pointLight position={[-90, 32, -60]} color="#FF6FB0" intensity={16} distance={340} />
      <pointLight position={[110, -18, 85]} color="#47E7C2" intensity={12} distance={300} />
    </>
  );
};

export default GraphScene;
