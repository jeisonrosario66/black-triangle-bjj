import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSession } from "@src/hooks/index";
import { useUIStore } from "@src/store/index";
import { cacheUser, routeList } from "@src/context/index";
import { debugLog } from "@src/utils/index";
import MainAppLayout from "@src/layouts/MainAppLayout";
import { Categories } from "@src/pages/index";

import { AddNodeForm, LoginUser, Profile } from "@src/components/index";

import { useTranslation } from "react-i18next";

const textHardcoded = "components.app.";

/**
 * Componente principal de la aplicación.
 * Controla la inicialización de idioma, autenticación, alertas globales
 * y renderiza las rutas principales del proyecto.
 *
 * @returns {JSX.Element} Estructura principal del enrutador.
 */
function App() {
  // Estado global
  const { user, isAuthenticated } = useSession();
  const isConfigWindowActive = useUIStore(
    (state) => state.isConfigWindowActive
  );
  const systemsBjjSelectedNodesStore = useUIStore(
    (state) => state.systemBjjSelectedNodes
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
    localStorage.setItem(cacheUser.dagModeCache, cacheUser.dagMode);
    localStorage.setItem(
      cacheUser.dagLevelDistanceCache,
      String(cacheUser.dagLevelDistance)
    );
    debugLog("info", "Sistema de Bjj Cargado: ", systemsBjjSelectedNodesStore);
  }, [systemsBjjSelectedNodesStore]);

  // Hook para mostrar alertas cuando cambia el estado de inicio de sesión
  useEffect(() => {
    if (isAuthenticated) {
      triggerAlert(`${t(textHardcoded + "login")} ${user?.name}`, "success");
      useUIStore.setState({ isLoginWindowActive: false });
    } else {
      triggerAlert(`${t(textHardcoded + "closed")}`, "warning");
    }
  }, [isAuthenticated, t, triggerAlert, user?.name]);

  return (
    <Routes>
      <Route path={routeList.root} element={<MainAppLayout />} />
      <Route path={routeList.categories} element={<Categories />} />
      <Route path={routeList.addNode} element={<AddNodeForm />} />
      <Route path={routeList.loginUser} element={<LoginUser />} />
      <Route path={routeList.profile} element={<Profile />} />
    </Routes>
  );
}

export default App;
