// import { useState } from "react";
import "@cssModules/App.css";
import { Canvas } from "@react-three/fiber";
import { cameraPropsDev, configGlobal } from "./context/configGlobal";
import { CameraControls } from "@react-three/drei";
import GraphScene from "./components/GraphScene";
import { useRef, useEffect } from "react";
import NodeForm from "@src/components/addNode/addNodeWindow";
import ButtonAddNode from "@src/components/ButtonAddNode";
import useUIStore from "@src/store/useCounterStore";

function App() {
  const isAddNodeActive = useUIStore((state) => state.isAddNodeActive);
  const isLoadingFirestore = useUIStore((state) => state.isLoadingFirestore);
  // Referencia para los controles de la camara
  useEffect(() => {}, [isAddNodeActive]);

  useEffect(() => {
    console.log("cargando datos firestore... ", isLoadingFirestore);
  }, [isLoadingFirestore]);

  const cameraControlsRef = useRef<CameraControls | null>(null);
  return (
    <div className="appContainer">
      {isAddNodeActive ? (
        <div className="formContainer">
          <NodeForm />
        </div>
      ) : (
        <ButtonAddNode />
      )}

      <div className="canvasContainer">
        <Canvas
          frameloop={isAddNodeActive ? "never" : "always"}
          camera={{
            fov: cameraPropsDev.fov,
            near: cameraPropsDev.near,
            far: cameraPropsDev.far,
            position: cameraPropsDev.position,
          }}
          style={{ backgroundColor: configGlobal.canvasBackgraundColor }}
        >
          {/* Componente de la escena del grafo */}
          <GraphScene cameraControlsRef={cameraControlsRef} />
          <CameraControls
            ref={cameraControlsRef}
            dollySpeed={cameraPropsDev.dollySpeed}
            maxDistance={cameraPropsDev.maxDistance}
            minDistance={cameraPropsDev.minDistance}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
