import { useEffect, useState, type ReactNode } from "react";
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  SessionContext,
  type SessionUser,
  type SessionUserRole,
} from "@src/context/authSession";
import { auth, database, provider } from "@src/hooks/fireBase";
import { SPECIAL_GRAPH_EDITOR_EMAIL } from "@src/utils";

const USERS_COLLECTION = "users";
const POPUP_REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
]);
const GRAPH_EDITOR_EMAILS = new Set(
  String(import.meta.env.VITE_GRAPH_EDITOR_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);
if (SPECIAL_GRAPH_EDITOR_EMAIL) {
  GRAPH_EDITOR_EMAILS.add(SPECIAL_GRAPH_EDITOR_EMAIL);
}

const VALID_SESSION_ROLES = new Set<SessionUserRole>(["viewer", "editor", "owner"]);

/**
 * Normaliza el correo electrónico para garantizar consistencia
 * en autenticación, comparación y persistencia en Firestore.
 *
 * @param {string | null | undefined} email - Correo recibido desde Firebase Auth.
 * @returns {string} Correo en minúsculas y sin espacios laterales.
 */
const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? "";

/**
 * Construye las iniciales visibles del usuario a partir de su nombre.
 * Define un fallback corto para mantener estable el avatar en la UI.
 *
 * @param {string} firstName - Nombre principal del usuario.
 * @param {string} lastName - Apellido del usuario.
 * @returns {string} Iniciales listas para renderizar en el avatar.
 */
const buildInitials = (firstName: string, lastName: string) => {
  const parts = [firstName, lastName].filter(Boolean);

  if (parts.length === 0) {
    return "BT";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const isSessionUserRole = (value: unknown): value is SessionUserRole =>
  typeof value === "string" && VALID_SESSION_ROLES.has(value as SessionUserRole);

const normalizeUserRoles = (
  rawRole: unknown,
  rawRoles: unknown,
  email: string,
): SessionUserRole[] => {
  const rolesFromDocument = Array.isArray(rawRoles)
    ? rawRoles.filter(isSessionUserRole)
    : [];
  const fallbackRole = isSessionUserRole(rawRole) ? [rawRole] : [];

  const nextRoles = new Set<SessionUserRole>([...rolesFromDocument, ...fallbackRole]);

  if (GRAPH_EDITOR_EMAILS.has(email)) {
    nextRoles.add("editor");
  }

  if (nextRoles.size === 0) {
    nextRoles.add("viewer");
  }

  if (nextRoles.has("owner")) {
    nextRoles.add("editor");
  }

  return [...nextRoles];
};

const resolvePrimaryRole = (roles: SessionUserRole[]): SessionUserRole => {
  if (roles.includes("owner")) {
    return "owner";
  }

  if (roles.includes("editor")) {
    return "editor";
  }

  return "viewer";
};

/**
 * Extrae y separa el nombre del usuario autenticado.
 * Usa el displayName de Firebase y, si no existe, deriva un fallback desde el correo.
 *
 * @param {User} firebaseUser - Usuario autenticado provisto por Firebase.
 * @returns {{ firstName: string; lastName: string }} Nombre y apellido normalizados para la app.
 */
const extractUserName = (firebaseUser: User) => {
  const fallbackName = normalizeEmail(firebaseUser.email)
    .split("@")[0]
    ?.replace(/[._-]+/g, " ")
    .trim();

  const nameSource = firebaseUser.displayName?.trim() || fallbackName || "Usuario";
  const parts = nameSource.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "Usuario";
  const lastName = parts.slice(1).join(" ");

  return {
    firstName,
    lastName,
  };
};

/**
 * Sincroniza el usuario autenticado con Firestore.
 * Garantiza que exista un único documento por correo electrónico y devuelve
 * la versión adaptada al modelo de sesión consumido por la UI.
 *
 * @param {User} firebaseUser - Usuario autenticado desde Firebase Auth.
 * @returns {Promise<SessionUser | null>} Usuario normalizado para sesión o null si no existe correo.
 */
const syncUserRecord = async (firebaseUser: User): Promise<SessionUser | null> => {
  const email = normalizeEmail(firebaseUser.email);

  if (!email) {
    return null;
  }

  const { firstName, lastName } = extractUserName(firebaseUser);
  const userRef = doc(database, USERS_COLLECTION, email);
  const currentUserSnapshot = await getDoc(userRef);
  const currentUserData = currentUserSnapshot.exists()
    ? currentUserSnapshot.data()
    : null;
  const roles = normalizeUserRoles(
    currentUserData?.role,
    currentUserData?.roles,
    email,
  );
  const role = resolvePrimaryRole(roles);

  await setDoc(
    userRef,
    {
      firstName,
      lastName,
      email,
      role,
      roles,
    },
    { merge: true },
  );

  return {
    email,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ").trim(),
    initials: buildInitials(firstName, lastName),
    picture: firebaseUser.photoURL ?? null,
    role,
    roles,
    canManageGraphLinks: role === "owner" || role === "editor",
  };
};

const isFirebaseAuthError = (
  error: unknown,
): error is { code: string; message?: string } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code?: unknown }).code === "string";

/**
 * Determina si un error del popup amerita fallback al flujo por redirect.
 * Se usa para cubrir navegadores o contextos donde el popup no puede abrirse,
 * manteniendo el login funcional sin romper desktop.
 *
 * @param {unknown} error - Error recibido al intentar abrir el popup.
 * @returns {boolean} true cuando el redirect puede resolver el intento de login.
 */
const shouldFallbackToRedirect = (error: unknown) =>
  isFirebaseAuthError(error) && POPUP_REDIRECT_FALLBACK_CODES.has(error.code);

/**
 * Registra una pista útil cuando el entorno de ejecución puede bloquear
 * la autenticación de Google en mobile, especialmente durante desarrollo local.
 *
 * @param {unknown} error - Error devuelto por Firebase Auth.
 */
const logLoginEnvironmentHint = (error: unknown) => {
  if (!isFirebaseAuthError(error) || typeof window === "undefined") {
    return;
  }

  if (error.code === "auth/unauthorized-domain") {
    console.error(
      `El origen actual (${window.location.origin}) no está autorizado en Firebase Auth. ` +
        "En móvil suele ocurrir al abrir la app desde la IP local del servidor de Vite.",
    );
  }
};

/**
 * Provider global de autenticación para la aplicación web.
 * Orquesta la sesión con Firebase Auth, persiste el usuario en Firestore
 * y expone a todo el árbol React el estado autenticado y las acciones de login/logout.
 *
 * @param {{ children: ReactNode }} props - Contenido envuelto por el contexto de sesión.
 * @returns {JSX.Element} Context provider con el estado de autenticación de la aplicación.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | undefined;

    /**
     * Inicializa la sesión al montar el provider.
     * Configura persistencia local, resuelve posibles redirects pendientes
     * y suscribe el listener principal de cambios de autenticación.
     *
     * @returns {Promise<void>} Promesa de arranque del estado de sesión.
     */
    const initializeSession = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("No se pudo configurar la persistencia de sesión:", error);
      }

      try {
        const redirectResult = await getRedirectResult(auth);

        if (redirectResult?.user) {
          await syncUserRecord(redirectResult.user);
        }
      } catch (error) {
        console.error("No se pudo completar el login por redirección:", error);
      }

      if (!isActive) {
        return;
      }

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isActive) {
          return;
        }

        if (!firebaseUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        try {
          const nextUser = await syncUserRecord(firebaseUser);
          if (isActive) {
            setUser(nextUser);
          }
        } catch (error) {
          console.error("No se pudo sincronizar el usuario en Firestore:", error);
          if (isActive) {
            setUser(null);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      });
    };

    void initializeSession();

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);

  /**
   * Inicia sesión con Google.
   * Intenta abrir primero un popup para evitar los problemas frecuentes del
   * redirect en navegadores móviles actuales, y usa redirect como fallback
   * cuando el navegador no permite ese popup.
   *
   * @returns {Promise<void>} Promesa del flujo de autenticación.
   */
  const login = async () => {
    const popupLoginPromise = signInWithPopup(auth, provider);
    setIsLoading(true);

    try {
      const credential = await popupLoginPromise;
      const nextUser = await syncUserRecord(credential.user);
      setUser(nextUser);
      setIsLoading(false);
      return;
    } catch (popupError) {
      if (!shouldFallbackToRedirect(popupError)) {
        logLoginEnvironmentHint(popupError);
        console.error("No se pudo iniciar sesión con Google:", popupError);
        setIsLoading(false);
        throw popupError;
      }
    }

    try {
      await signInWithRedirect(auth, provider);
    } catch (redirectError) {
      logLoginEnvironmentHint(redirectError);
      console.error("No se pudo iniciar sesión con Google:", redirectError);
      setIsLoading(false);
      throw redirectError;
    }
  };

  /**
   * Cierra la sesión actual del usuario autenticado.
   * Limpia el estado local del provider y delega la invalidación al SDK de Firebase.
   *
   * @returns {Promise<void>} Promesa de cierre de sesión.
   */
  const logout = async () => {
    setIsLoading(true);

    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Recupera el token ID vigente del usuario autenticado.
   * Permite reutilizar el contexto de sesión para futuras integraciones seguras.
   *
   * @returns {Promise<string | null>} Token del usuario actual o null si no hay sesión.
   */
  const getAccessToken = async () => {
    if (!auth.currentUser) {
      return null;
    }

    return auth.currentUser.getIdToken();
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
