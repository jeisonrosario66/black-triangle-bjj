import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Button } from "@mui/material";
// import { Routes, Route } from 'react-router-dom';

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
import { useUIStore } from "@src/store/index";
import {
  cameraPropsDev,
  configGlobal,
} from "@src/context/index";

import * as style from "@src/styles/stylesApp";
import { useTranslation } from "react-i18next";

const textHardcoded = "components.app.";

const MainAppLayout = () => {
  // Estado global
  const isAddNodeActive = useUIStore((state) => state.isAddNodeActive);
  const isLoginWindowActive = useUIStore((state) => state.isLoginWindowActive);
  const isNodeViewActive = useUIStore((state) => state.isNodeViewActive);
  const isConfigWindowActive = useUIStore(
    (state) => state.isConfigWindowActive
  );
  const overlayDontShowAgain = useUIStore(
    (state) => state.overlayDontShowAgain
  );
  const showFullGraph = useUIStore((state) => state.showFullGraph);
  const toggleGraph = () => {
    useUIStore.setState({ showFullGraph: !showFullGraph });
  };
  
  const { t } = useTranslation();
  // Referencia para los controles de la camara (usado por drei)
  const cameraControlsRef = useRef<CameraControls | null>(null);


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
          {/*  */}
          <Button
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              zIndex: 10,
              backgroundColor: "white",
              padding: "0.5rem 1rem",
            }}
            onClick={toggleGraph}
          >
            {showFullGraph
              ? `🔽 ${t(textHardcoded + "collapsedNodes")}`
              : `🔼 ${t(textHardcoded + "expandNodes")}`}
          </Button>
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
};

export default MainAppLayout;
