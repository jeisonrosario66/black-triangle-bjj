import {
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Box,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import type { SessionUser } from "@src/context/index";

/**
 * Menú contextual del encabezado de la aplicación.
 * Gestiona la visualización de opciones relacionadas con el perfil del usuario
 * y autenticación, adaptándose al estado de sesión.
 *
 * @param {Object} props - Propiedades de control del menú.
 * @param {HTMLElement | null} props.anchorEl - Elemento ancla que determina la posición y visibilidad del menú.
 * @param {() => void} props.onClose - Función para cerrar el menú.
 * @param {boolean} props.isLogin - Indica si el usuario se encuentra autenticado.
 * @returns {JSX.Element} Menú desplegable con opciones contextuales del usuario.
 */
export default function HeaderMenu({
  anchorEl,
  onClose,
  isLogin,
  isLoading,
  user,
  onLogin,
  onLogout,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  isLogin: boolean;
  isLoading: boolean;
  user: SessionUser | null;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLogin = async () => {
    onClose();
    await onLogin();
  };

  const handleLogout = async () => {
    onClose();
    await onLogout();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {isLogin ? (
        <MenuItem onClick={onClose}>
          <ListItemIcon>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 24,
                height: 24,
              }}
            >
              {user?.initials}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={user?.name}
            secondary={user?.email}
          />
        </MenuItem>
      ) : (
        <MenuItem onClick={() => void handleLogin()} disabled={isLoading}>
          <ListItemIcon>
            <Box
              component="img"
              src="/google-logo.png"
              alt="Google"
              sx={{ width: 18, height: 18 }}
            />
          </ListItemIcon>
          <ListItemText primary={t("components.header.continueWithGoogle")} />
        </MenuItem>
      )}

      {isLogin && <Divider />}

      {isLogin && (
        <MenuItem onClick={() => void handleLogout()} disabled={isLoading}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("components.header.logOut")}
            sx={{ color: "error.main" }}
          />
        </MenuItem>
      )}
    </Menu>
  );
}
