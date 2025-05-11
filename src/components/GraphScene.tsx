import { Stars } from "@react-three/drei"; // Componente para renderizar un fondo estrellado
import { scenePropsDev } from "../context/configGlobal"; // Propiedades de la escena
import {NodeComponent} from "@src/components/index"; // Componente para los nodos
import { configGlobal } from "@src/context/index";
// Define las props para GraphScene
type GraphSceneProps = { cameraControlsRef: React.RefObject<any> };

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
      <directionalLight position={configGlobal.position} color={configGlobal.colorLight} />
    </>
  );
};

export default GraphScene;
