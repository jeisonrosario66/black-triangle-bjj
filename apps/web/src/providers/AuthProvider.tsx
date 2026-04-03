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
import { doc, setDoc } from "firebase/firestore";

import { SessionContext, type SessionUser } from "@src/context/authSession";
import { auth, database, provider } from "@src/hooks/fireBase";

const USERS_COLLECTION = "users";
const MOBILE_BREAKPOINT = 900;

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

  await setDoc(
    doc(database, USERS_COLLECTION, email),
    {
      firstName,
      lastName,
      email,
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
  };
};

/**
 * Detecta si el viewport actual debe priorizar un flujo mobile-first.
 * Se utiliza para alternar entre popup en desktop y redirect en mobile.
 *
 * @returns {boolean} true cuando el ancho actual coincide con el breakpoint mobile.
 */
const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 0.05}px)`).matches;

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
   * Usa redirect en mobile para una experiencia más robusta y popup en desktop
   * para mantener el flujo dentro del contexto actual de navegación.
   *
   * @returns {Promise<void>} Promesa del flujo de autenticación.
   */
  const login = async () => {
    setIsLoading(true);

    try {
      if (isMobileViewport()) {
        await signInWithRedirect(auth, provider);
        return;
      }

      const credential = await signInWithPopup(auth, provider);
      const nextUser = await syncUserRecord(credential.user);
      setUser(nextUser);
      setIsLoading(false);
    } catch (error) {
      console.error("No se pudo iniciar sesión con Google:", error);
      setIsLoading(false);
      throw error;
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
