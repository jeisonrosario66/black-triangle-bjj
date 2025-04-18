import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";

import "@cssModule/App.css";

import { cameraPropsDev, configGlobal } from "./context/configGlobal";

import AccountMenu from "@src/components/AccountMenu";
import GraphScene from "@src/components/GraphScene";
import LoginUser from "@src/components/loginUser/LoginUser";
import NodeForm from "@src/components/addNode/AddNodeWindow";
import OutlinedAlerts from "@src/components/Alert";
import NodeView from "@src/components/NodeView";

import authListener from "@src/hooks/authListener";

import useUIStore from "@src/store/useCounterStore";
function App() {
  // Estado global: controla si el formulario de agregar nodo está activo
  const isAddNodeActive = useUIStore((state) => state.isAddNodeActive);
  const isLoginWindowActive = useUIStore((state) => state.isLoginWindowActive);
  const isUserLogin = useUIStore((state) => state.isUserLogin);
  const userLoginData = useUIStore((state) => state.userLoginData);
  const isNodeViewActive = useUIStore((state) => state.isNodeViewActive);
  // Referencia para los controles de la camara (usado por drei)
  const cameraControlsRef = useRef<CameraControls | null>(null);
  const triggerAlert = useUIStore((state) => state.triggerAlert);

  // Hook para inicializar el listener de autenticación al montar el componente
  useEffect(() => {
    authListener();
  }, []);

  // Hook para mostrar alertas cuando cambia el estado de inicio de sesión
  useEffect(() => {
    if (isUserLogin) {
      triggerAlert(`Sesión iniciada ${userLoginData.displayName}`, "success");
      useUIStore.setState({ isLoginWindowActive: false });
    } else {
      triggerAlert("Sesión Cerrada", "warning");
    }
  }, [isUserLogin]);

  return (
    <div className="appContainer">
      {/* Formulario de 
      nodo o botón de agregar nodo */}
      {isAddNodeActive ? <NodeForm /> : null}
      {isLoginWindowActive ? <LoginUser /> : <AccountMenu />}
      {isNodeViewActive && cameraControlsRef.current ? <NodeView controls={cameraControlsRef.current} /> : null}

      {/* Contenedor del lienzo 3D */}
      <div className="canvasContainer">
        <Canvas
          // Detiene el renderizado cuando se abre el formulario de nodo
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
      <OutlinedAlerts />
    </div>
  );
}

export default App;
