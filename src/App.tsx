import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useUIStore } from "@src/store/index";
import { cacheUser, routeList } from "@src/context/index";
import { debugLog } from "@src/utils/index";
import MainAppLayout from "@src/layouts/MainAppLayout";
import { AddFast } from "@src/pages/index";
// import { AddNodeForm, LoginUser, Profile } from "@src/components/index";

import { useTranslation } from "react-i18next";


/**
 * Componente principal de la aplicación.
 * Controla la inicialización de idioma, autenticación, alertas globales
 * y renderiza las rutas principales del proyecto.
 *
 * @returns {JSX.Element} Estructura principal del enrutador.
 */
function App() {
  // Estado global
  const isConfigWindowActive = useUIStore(
    (state) => state.isConfigWindowActive
  );
  const systemsBjjSelectedNodesStore = useUIStore(
    (state) => state.systemBjjSelectedNodes
  );

  // Hook de traducción
  const { i18n } = useTranslation();

  // Hook para inicializar el listener de autenticación al montar el componente
  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(cacheUser.languageUser) ?? cacheUser.languageDefault;
    i18n.changeLanguage(savedLanguage);
    useUIStore.setState({ languageGlobal: savedLanguage });
  }, [isConfigWindowActive]);

  useEffect(() => {
    localStorage.setItem(cacheUser.dagModeCache, cacheUser.dagMode);
    localStorage.setItem(
      cacheUser.dagLevelDistanceCache,
      String(cacheUser.dagLevelDistance)
    );
    debugLog("info", "Sistema de Bjj Cargado: ", systemsBjjSelectedNodesStore);
  }, [systemsBjjSelectedNodesStore]);

  return (
    <Routes>
      <Route path={routeList.root} element={<MainAppLayout />} />
      <Route path={routeList.test} element={<AddFast />} />
      {/* <Route path={routeList.addNode} element={<AddNodeForm />} /> */}
      {/* <Route path={routeList.profile} element={<Profile />} /> */}
      {/* <Route path={routeList.loginUser} element={<LoginUser />} /> */}
      {/* <Route path={routeList.categories} element={<Categories />} /> */}
    </Routes>
  );
}

export default App;
