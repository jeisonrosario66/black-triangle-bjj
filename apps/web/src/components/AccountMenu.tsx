import React from "react";
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { useSession } from "@src/hooks/index";
import { debugLog } from "@src/utils/index";

import * as style from "@src/styles/stylesAccountMenu";

const textHardcoded = "components.accountMenu.";

/**
 * Menú de cuenta del usuario.
 * Gestiona las opciones del usuario autenticado o invitado, incluyendo perfil,
 * agregar nodos, configuración y cierre de sesión.
 *
 * @returns {JSX.Element} Menú interactivo de cuenta.
 */
export default function AccountMenu() {
  const { user, isAuthenticated, login, logout, isLoading } = useSession();

  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * Abre el menú anclándolo al elemento seleccionado.
   *
   * @param {React.MouseEvent<HTMLElement>} event Evento del clic en el botón del menú.
   */
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    useUIStore.setState({ isNodeAddViewActive: false });
  };

  /**
   * Maneja la acción de mostrar el perfil del usuario.
   */
  const handleProfile = () => {
    debugLog("debug", "Perfil del usuario");
    setAnchorEl(null);
  };

  /**
   * Cierra el menú desplegable.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Cierra sesión del usuario autenticado.
   */
  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
  };

  /**
   * Abre la ventana de inicio de sesión y redirige al usuario.
   */
  const handleLoginWindow = async () => {
    setAnchorEl(null);
    await login();
  };

  /**
   * Abre la ventana de configuración.
   */
  const handleConfigWindow = () => {
    useUIStore.setState({ isConfigWindowActive: true });
  };

  return (
    <React.Fragment>
      {/* Botón del menú de usuario */}
      <Box sx={style.containerAccountMenu}>
        <Tooltip title={t(textHardcoded + "title")}>
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "menu-user" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={style.containerAccountAvatar}>
              {isAuthenticated && user?.initials ? (
                user.initials
              ) : (
                <PersonOutlineOutlinedIcon sx={style.accountAvatarSvg} />
              )}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Menú desplegable */}
      <Menu
        anchorEl={anchorEl}
        id="menu-user"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Si el usuario está logueado, muestra su información */}
        {isAuthenticated ? (
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <Avatar
                alt={user?.name ?? "User"}
                src={user?.picture ?? undefined}
              />
            </ListItemIcon>
            {user?.name}
          </MenuItem>
        ) : (
          // Si no está logueado, muestra la opción para iniciar sesión
          <MenuItem onClick={() => void handleLoginWindow()} disabled={isLoading}>
            <ListItemIcon>
              <LoginIcon fontSize="small" />
            </ListItemIcon>
            {t(textHardcoded + "optionsMenu.login")}
          </MenuItem>
        )}

        <Divider />

        {/* Opción para configuración */}
        <MenuItem onClick={handleConfigWindow}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          {t(textHardcoded + "optionsMenu.configuration")}
        </MenuItem>

        {/* Opción para cerrar sesión */}
        <MenuItem onClick={() => void handleLogout()} disabled={!isAuthenticated || isLoading}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>

          {t(textHardcoded + "optionsMenu.logOut")}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
