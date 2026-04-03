import { HeaderAction } from "@bt/shared/context/index";
/**
 * Genera la lista de acciones visibles en el encabezado de la aplicación.
 * Esta función centraliza la lógica de decisión sobre qué acciones de UI
 * deben mostrarse en el header, adaptándose al contexto de dispositivo
 * (mobile o desktop) y al estado de autenticación del usuario.
 *
 * Su responsabilidad es abstraer la configuración del header para que
 * los componentes visuales consuman únicamente una definición declarativa
 * de acciones, manteniendo coherencia entre plataformas.
 *
 * @param {boolean} isMobile - Indica si la vista actual corresponde a un dispositivo móvil.
 * @param {boolean} isLogin - Indica si el usuario se encuentra autenticado.
 * @returns {HeaderAction[]} Arreglo de acciones que deben renderizarse en el encabezado.
 */

export default function getHeaderActions({
  isMobile,
  isLogin,
  userInitials,
}: {
  isMobile: boolean;
  isLogin: boolean;
  userInitials?: string;
}): HeaderAction[] {
  const actions: HeaderAction[] = [
    { type: "search" },
  ];

  if (!isMobile) {
    actions.push(
      { type: "divider" },
      { type: "avatar", initials: isLogin ? userInitials : undefined },
    );
  } else {
    actions.push({ type: "avatar", initials: isLogin ? userInitials : undefined });
  }

  return actions;
}
