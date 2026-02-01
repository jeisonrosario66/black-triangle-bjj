import {
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Badge,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useTheme } from "@mui/material/styles";

import { userIniciales, userName } from "@bt/shared/context";

/**
 * Menú contextual del encabezado de la aplicación.
 * Gestiona la visualización de opciones relacionadas con el perfil del usuario,
 * autenticación, notificaciones y configuración, adaptándose al estado de sesión.
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
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  isLogin: boolean;
}) {
  const theme = useTheme();

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
              {userIniciales}
            </Avatar>
          </ListItemIcon>
          <ListItemText primary={userName} />
        </MenuItem>
      ) : (
        <MenuItem onClick={onClose}>
          <ListItemIcon>
            <LoginOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Perfil" />
        </MenuItem>
      )}

      {isLogin && (
        <MenuItem onClick={onClose}>
          <ListItemIcon>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Notificaciones" />
        </MenuItem>
      )}

      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <SettingsOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Configuración" />
      </MenuItem>

      {isLogin && <Divider />}

      {isLogin && (
        <MenuItem onClick={onClose}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" sx={{ color: "error.main" }} />
        </MenuItem>
      )}
    </Menu>
  );
}
