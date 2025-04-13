import "@cssModule/App.css";
import { debugLog } from "@src/utils/debugLog";
import { Canvas } from "@react-three/fiber";
import { cameraPropsDev, configGlobal } from "./context/configGlobal";
import { CameraControls } from "@react-three/drei";
import GraphScene from "./components/GraphScene";
import { useRef, useEffect } from "react";
import NodeForm from "@src/components/addNode/AddNodeWindow";
import ButtonAddNode from "@src/components/ButtonAddNode";
import useUIStore from "@src/store/useCounterStore";

function App() {
  // Estado global: controla si el formulario de agregar nodo está activo
  const isAddNodeActive = useUIStore((state) => state.isAddNodeActive);
  const isLoadingFirestore = useUIStore((state) => state.isLoadingFirestore);

  // DEBUG: log de carga de Firestore
  useEffect(() => {
    debugLog("debug", "cargando datos firestore... ", isLoadingFirestore);
  }, [isLoadingFirestore]);

  // Referencia para los controles de la camara (usado por drei)
  const cameraControlsRef = useRef<CameraControls | null>(null);
  return (
    <div className="appContainer">
      {/* Muestra el formulario para agregar nodos si está activo */}
      {isAddNodeActive ? (
        <NodeForm />
      ) : (
        // Botón para abrir el formulario de nodo
        <ButtonAddNode />
      )}

      {/* Contenedor del lienzo 3D */}
      <div className="canvasContainer">
        <Canvas
          // Detiene el renderizado cuando se abre el formulario de nodo
          frameloop={isAddNodeActive ? "never" : "always"}
          camera={{
            fov: cameraPropsDev.fov,
            near: cameraPropsDev.near,
            far: cameraPropsDev.far,
            position: cameraPropsDev.position,
          }}
          style={{ backgroundColor: configGlobal.canvasBackgraundColor }}
        >
          {/* Escena del grafo (nodos y conexiones) */}
          <GraphScene cameraControlsRef={cameraControlsRef} />

          {/* Controles de cámara (pan, zoom, etc.) */}
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
