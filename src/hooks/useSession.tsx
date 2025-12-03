/**
 * Hook para gestionar el estado de sesión del usuario mediante Auth0.
 * Proporciona información del usuario y métodos de autenticación listos para usar.
 *
 * @returns {object} Datos y acciones de la sesión del usuario.
 * @returns {object|null} returns.user Información del usuario autenticado.
 * @returns {boolean} returns.isAuthenticated Indica si el usuario está autenticado.
 * @returns {boolean} returns.isLoading Indica si la sesión aún está cargando.
 * @returns {Function} returns.getAccessToken Obtiene el token de acceso de manera silenciosa.
 * @returns {Function} returns.logout Cierra la sesión del usuario.
 * @returns {Function} returns.login Inicia sesión redirigiendo al proveedor.
 */
import { useAuth0 } from "@auth0/auth0-react";

export function useSession() {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    logout,
    loginWithRedirect,
  } = useAuth0();

  return {
    user,
    isAuthenticated,
    isLoading,
    getAccessToken: getAccessTokenSilently,
    logout,
    login: loginWithRedirect,
  };
}
