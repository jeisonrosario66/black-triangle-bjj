import { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Button } from "@mui/material";

import {
  GraphScene,
  AccountMenu,
  OutlinedAlerts,
  NavigationGestures,
  ConfigWindow,
  WindowViewNode,
} from "@src/components/index";
import { useUIStore } from "@src/store/index";
import { animateCameraBackFromNode } from "@src/hooks/index";
import { cameraPropsDev, configGlobal } from "@src/context/index";

import * as style from "@src/styles/stylesApp";
import { useTranslation } from "react-i18next";

const textHardcoded = "components.app.";

const MainAppLayout = () => {
  // Estado global
  // const isAddNodeActive = useUIStore((state) => state.isAddNodeActive);
  const nodeViewData = useUIStore((state) => state.nodeViewData);
  const isViewNodeActive = useUIStore((state) => state.isNodeSceneViewActive);
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

  const handleCloseNodeView = useCallback(() => {
    // Cierra la ventana de vista de nodo en el store
    useUIStore.setState({ isNodeSceneViewActive: false });
    // Si los controles están disponibles, anima la cámara de vuelta
    if (cameraControlsRef.current) {
      animateCameraBackFromNode(cameraControlsRef.current);
    }
  }, [cameraControlsRef]);

  return (
    <>
      {style.globalStyles}
      <div style={style.appContainer}>
        {isConfigWindowActive ? <ConfigWindow /> : <AccountMenu />}
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

        <WindowViewNode
          open={isViewNodeActive}
          onClose={handleCloseNodeView}
          nodeData={nodeViewData}
        />
      </div>
    </>
  );
};

export default MainAppLayout;
