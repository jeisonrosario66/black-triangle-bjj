import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import { authListener } from "@src/hooks/index";
import { useUIStore } from "@src/store/index";
import { cacheUser, tableNameDB, routeList} from "@src/context/index";
import { debugLog } from "@src/utils/index";
import MainAppLayout from "@src/layouts/MainAppLayout";
import { Categories } from "@src/pages/index";

import { AddNodeForm } from "@src/components/index";

import { useTranslation } from "react-i18next";

const textHardcoded = "components.app.";

function App() {
  // Estado global
  const isUserLogin = useUIStore((state) => state.isUserLogin);
  const userLoginData = useUIStore((state) => state.userLoginData);
  const isConfigWindowActive = useUIStore(
    (state) => state.isConfigWindowActive
  );
  // Hook de traducción
  const { t, i18n } = useTranslation();
  // Referencia para los controles de la camara (usado por drei)
  const triggerAlert = useUIStore((state) => state.triggerAlert);

  // Hook para inicializar el listener de autenticación al montar el componente
  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(cacheUser.languageUser) ?? cacheUser.languageDefault;
    i18n.changeLanguage(savedLanguage);
    useUIStore.setState({ languageGlobal: savedLanguage });
  }, [isConfigWindowActive]);

  useEffect(() => {
    authListener();
    localStorage.setItem(cacheUser.dagModeCache, cacheUser.dagMode);
    localStorage.setItem(
      cacheUser.dagLevelDistanceCache,
      String(cacheUser.dagLevelDistance)
    );
    debugLog("info", "Sistema de Bjj Cargado: ", tableNameDB.nodesArray);
  }, []);

  // Hook para mostrar alertas cuando cambia el estado de inicio de sesión
  useEffect(() => {
    if (isUserLogin) {
      triggerAlert(
        `${t(textHardcoded + "login")} ${userLoginData.displayName}`,
        "success"
      );
      useUIStore.setState({ isLoginWindowActive: false });
    } else {
      triggerAlert(`${t(textHardcoded + "closed")}`, "warning");
    }
  }, [isUserLogin]);

  // const controls = cameraControlsRef.current;
  // if (controls) {
  //   const { x, y, z } = controls.camera.position;
  //   console.log("Posición de la cámara:", x, y, z);
  // }

  // cordenadas en tiempo de la posicion de la camara

  return (
    <Routes>
      <Route path={routeList.root} element={<MainAppLayout />} />
      <Route path={routeList.categories} element={<Categories />} />
      <Route path={routeList.addNode} element={<AddNodeForm />} />
    </Routes>
  );
}

export default App;
