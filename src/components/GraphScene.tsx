// components/GraphScene.tsx || Componente representa la escena 3d

// Importa los módulos necesarios
import { Stars } from "@react-three/drei"; // Componente para renderizar un fondo estrellado
import { AxesHelper, GridHelper } from "three"; // Clases para dibujar ejes y cuadrículas
import { scenePropsDev } from "../context/configGlobal"; // Propiedades de la escena
import NodeComponent from "@src/components/NodeComponent"; // Componente para los nodos

// Define las props para GraphScene
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GraphSceneProps = { cameraControlsRef: React.RefObject<any> };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      {/* Helpers para orientación */}
      {/* Dibujar los ejes (rojo: X, verde: Y, azul: Z) */}
      <primitive object={new AxesHelper(300)} />
      {/* Dibujar una cuadrícula en el plano XZ para marcar el origen */}
      <primitive object={new GridHelper(200, 20)} />

      {/* Luces */}
      <ambientLight intensity={8} />
      <directionalLight position={[100, 20, 10]} color="purple" />
    </>
  );
};

export default GraphScene;
