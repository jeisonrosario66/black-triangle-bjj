import { Stars } from "@react-three/drei"; // Componente para renderizar un fondo estrellado
import { scenePropsDev } from "../context/configGlobal"; // Propiedades de la escena
import NodeComponent from "@src/components/NodeComponent"; // Componente para los nodos

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
      <ambientLight intensity={0.9} />
      <directionalLight position={[100, 20, 10]} color="yellow" />
    </>
  );
};

export default GraphScene;
