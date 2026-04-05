import {
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useTheme } from "@mui/material/styles";

import { getHeaderActions } from "@src/components/index";

/**
 * Renderiza las acciones principales del encabezado de la aplicación.
 * Centraliza la lógica de visualización de controles como búsqueda y avatar
 * según el estado de sesión y el breakpoint.
 *
 * @param {Object} props - Propiedades de configuración del encabezado.
 * @param {boolean} props.isMobile - Indica si la vista corresponde a un dispositivo móvil.
 * @param {boolean} props.isLogin - Indica si el usuario se encuentra autenticado.
 * @param {(e: React.MouseEvent<HTMLElement>) => void} props.onAvatarClick - Manejador del evento de clic sobre el avatar del usuario.
 * @returns {JSX.Element} Conjunto de acciones renderizadas dinámicamente en el header.
 */
export default function HeaderActions({
  isMobile,
  isLogin,
  isLoading,
  userInitials,
  onAvatarClick,
}: {
  isMobile: boolean;
  isLogin: boolean;
  isLoading: boolean;
  userInitials?: string;
  onAvatarClick: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const theme = useTheme();
  const actions = getHeaderActions({ isMobile, isLogin, userInitials });

  return (
    <>
      {actions.map((action, index) => {
        switch (action.type) {
          case "avatar":
            return (
              <IconButton key={index} onClick={onAvatarClick} disabled={isLoading}>
                <Avatar
                  sx={{
                    bgcolor: action.initials
                      ? theme.palette.primary.main
                      : theme.palette.surfaceVariant,
                    color: action.initials
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : action.initials ? (
                    action.initials
                  ) : (
                    <PersonOutlineOutlinedIcon fontSize="small" />
                  )}
                </Avatar>
              </IconButton>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
