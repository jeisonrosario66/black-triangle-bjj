import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";

import {
  GraphScene,
  AccountMenu,
  LoginUser,
  NodeForm,
  OutlinedAlerts,
  NodeView,
  NavigationGestures,
  ConfigWindow,
} from "@src/components/index";
import { authListener } from "@src/hooks/index";
import { useUIStore } from "@src/store/index";
import { cameraPropsDev, configGlobal, cacheUser } from "@src/context/index";

import * as style from "@src/styles/stylesApp";
import { useTranslation } from "react-i18next";

function App() {
  // Estado global
  const isAddNodeActive = useUIStore((state) => state.isAddNodeActive);
  const isLoginWindowActive = useUIStore((state) => state.isLoginWindowActive);
  const isUserLogin = useUIStore((state) => state.isUserLogin);
  const userLoginData = useUIStore((state) => state.userLoginData);
  const isNodeViewActive = useUIStore((state) => state.isNodeViewActive);
  const overlayDontShowAgain = useUIStore(
    (state) => state.overlayDontShowAgain
  );
  const isConfigWindowActive = useUIStore(
    (state) => state.isConfigWindowActive
  );
  const { i18n } = useTranslation();

  // Referencia para los controles de la camara (usado por drei)
  const cameraControlsRef = useRef<CameraControls | null>(null);
  const triggerAlert = useUIStore((state) => state.triggerAlert);

  // Hook para inicializar el listener de autenticación al montar el componente
  
  useEffect(() => {
    authListener();
    const savedLanguage =
    localStorage.getItem(cacheUser.languageUser) ?? cacheUser.languageDefault;
    i18n.changeLanguage(savedLanguage);
    console.log("useeffect: " ,savedLanguage)
    useUIStore.setState({ languageGlobal: savedLanguage });
  }, [isConfigWindowActive]);
  
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
    <>
      {style.globalStyles}
      <div style={style.appContainer}>
        {isAddNodeActive ? <NodeForm /> : null}
        {isLoginWindowActive ? <LoginUser /> : <AccountMenu />}
        {isNodeViewActive && cameraControlsRef.current && !isAddNodeActive ? (
          <NodeView controls={cameraControlsRef.current} isAddNode={false} />
        ) : null}
        {isConfigWindowActive ? <ConfigWindow /> : null}

        {/* Contenedor del lienzo 3D */}
        <div style={style.canvasContainer}>
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
        {overlayDontShowAgain ? null : <NavigationGestures />}
        <OutlinedAlerts />
      </div>
    </>
  );
}

export default App;
