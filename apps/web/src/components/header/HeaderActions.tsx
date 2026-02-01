import {
  IconButton,
  Divider,
  Badge,
  Avatar,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

import { Search, SearchIconWrapper, StyledInputBase } from "@src/styles/header/stylesAppBarNewheader";
import { getHeaderActions } from "@src/components/index";

/**
 * Renderiza las acciones principales del encabezado de la aplicación.
 * Centraliza la lógica de visualización de controles como búsqueda, avatar,
 * notificaciones y accesos contextuales según el estado de sesión y el breakpoint.
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
  onAvatarClick,
}: {
  isMobile: boolean;
  isLogin: boolean;
  onAvatarClick: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const theme = useTheme();
  const actions = getHeaderActions({ isMobile, isLogin });

  return (
    <>
      {actions.map((action, index) => {
        switch (action.type) {
          case "search":
            return (
              <Search key={index}>
                <SearchIconWrapper>
                  <SearchIcon fontSize="small" />
                </SearchIconWrapper>
                <StyledInputBase placeholder="Buscar…" />
              </Search>
            );

          case "avatar":
            return (
              <IconButton key={index} onClick={onAvatarClick}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  {action.initials}
                </Avatar>
              </IconButton>
            );

          case "divider":
            return <Divider key={index} orientation="vertical" flexItem />;

          case "notifications":
            return (
              <IconButton key={index}>
                <Badge badgeContent={action.unread} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            );

          case "explorer":
            return (
              <IconButton key={index}>
                <Typography variant="button">Explorar</Typography>
              </IconButton>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
