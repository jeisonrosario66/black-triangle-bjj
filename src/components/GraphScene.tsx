import { scenePropsDev } from "../context/configGlobal"; // Propiedades de la escena
import { NodeComponent } from "@src/components/index"; // Componente para los nodos
import { GizmoHelper, GizmoViewport, Stars } from "@react-three/drei";
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
      <directionalLight
        position={configGlobal.position}
        color={configGlobal.colorLight}
      />

      <GizmoHelper alignment="top-left" margin={[80, 150]}>
        <GizmoViewport
          labelColor="#fff"
          axisColors={["red", "green", "blue"]}
        />
      </GizmoHelper>
    </>
  );
};

export default GraphScene;
