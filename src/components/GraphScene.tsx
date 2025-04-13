import { Stars } from "@react-three/drei"; // Componente para renderizar un fondo estrellado
import { AxesHelper, GridHelper } from "three"; // Clases para dibujar ejes y cuadrículas
import { scenePropsDev } from "../context/configGlobal"; // Propiedades de la escena
import NodeComponent from "@src/components/NodeComponent"; // Componente para los nodos
import { useMemo } from "react";

// Define las props para GraphScene
type GraphSceneProps = { cameraControlsRef: React.RefObject<any> };

const GraphScene: React.FC<GraphSceneProps> = ({ cameraControlsRef }) => {
  // useMemo para helpers
  const axesHelper = useMemo(() => new AxesHelper(300), []);
  const gridHelper = useMemo(() => new GridHelper(200, 20), []);

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

      {/* Helpers */}
      <primitive object={axesHelper} />
      <primitive object={gridHelper} />

      {/* Luces */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 20, 10]} color="yellow" />
    </>
  );
};

export default GraphScene;
