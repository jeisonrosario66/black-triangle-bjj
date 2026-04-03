import { Box, CircularProgress } from "@mui/material";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { routeList } from "@src/context/index";
import { useSession } from "@src/hooks/index";
import * as loadingStyles from "@src/styles/screens/styleLoading";

/**
 * Protege una ruta para que solo sea accesible cuando existe una sesión activa.
 * Mientras la autenticación se resuelve, mantiene un estado de carga neutro.
 *
 * @param {{ children: ReactNode }} props - Contenido protegido por autenticación.
 * @returns {JSX.Element} Contenido autorizado o redirección a la raíz pública.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <Box sx={loadingStyles.loading}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={routeList.root}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
