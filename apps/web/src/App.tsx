import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useUIStore } from "@src/store/index";
import { cacheUser, routeList } from "@src/context/index";
import { debugLog } from "@src/utils/index";
import {
  LandingPage,
  NotFoundPage,
  ExplorerScreen,
  CourseDetailScreen,
  VideoDetailScreen, 
  HomeScreenWeb
} from "@src/screens/index";
import { useTranslation } from "react-i18next";
import { RequireAuth } from "@src/components/index";
/**
 * Componente principal de la aplicación.
 * Controla la inicialización de idioma, autenticación, alertas globales
 * y renderiza las rutas principales del proyecto.
 *
 * @returns {JSX.Element} Estructura principal del enrutador.
 */
function App() {
  const systemsBjjSelectedNodesStore = useUIStore(
    (state) => state.systemBjjSelectedNodes,
  );

  // Hook de traducción
  const { i18n } = useTranslation();

  // Hook inicializador al montar el componente
  useEffect(() => {
    const savedLanguage = (localStorage.getItem(cacheUser.languageUser) ??
      cacheUser.languageDefault) as "es" | "en";

    useUIStore.setState({ languageGlobal: { locale: savedLanguage } });

    localStorage.setItem(cacheUser.dagModeCache, cacheUser.dagMode);
    localStorage.setItem(
      cacheUser.dagLevelDistanceCache,
      String(cacheUser.dagLevelDistance),
    );
    localStorage.setItem(cacheUser.languageUser, savedLanguage);
    debugLog("info", "Sistema de Bjj Cargado: ", systemsBjjSelectedNodesStore);
    i18n.changeLanguage(savedLanguage);
  }, [systemsBjjSelectedNodesStore]);

  return (
    <Routes>
      <Route path={routeList.root} element={<LandingPage />} />
      <Route
        path={routeList.home}
        element={(
          <RequireAuth>
            <HomeScreenWeb />
          </RequireAuth>
        )}
      />
      <Route
        path={routeList.explorerScreen}
        element={(
          <RequireAuth>
            <ExplorerScreen />
          </RequireAuth>
        )}
      />
      <Route
        path={routeList.courseDetailScreen}
        element={(
          <RequireAuth>
            <CourseDetailScreen />
          </RequireAuth>
        )}
      />
      <Route
        path={routeList.videoDetailScreen}
        element={(
          <RequireAuth>
            <VideoDetailScreen />
          </RequireAuth>
        )}
      />
      <Route path="*" element={<NotFoundPage />} />
      {/* <Route path={routeList.nodeViewer} element={<MainAppLayout />} /> */}
      {/* <Route path={routeList.addNode} element={<AddNodeForm />} /> */}
      {/* <Route path={routeList.profile} element={<Profile />} /> */}
      {/* <Route path={routeList.loginUser} element={<LoginUser />} />  */}
      {/* <Route path={routeList.categories} element={<Categories />} /> */}
    </Routes>
  );
}

export default App;
