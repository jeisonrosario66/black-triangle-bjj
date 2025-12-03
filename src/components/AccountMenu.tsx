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
import { Settings, Logout } from "@mui/icons-material";
import HubIcon from "@mui/icons-material/hub";
import LoginIcon from "@mui/icons-material/Login";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { routeList } from "@src/context/index";
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
  const { user, isAuthenticated, logout } = useSession();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const isUserLogin = useUIStore((state) => state.isUserLogin);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const triggerAlert = useUIStore((state) => state.triggerAlert);

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
  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  /**
   * Abre la ventana de inicio de sesión y redirige al usuario.
   */
  const handleLoginWindow = () => {
    useUIStore.setState({ isLoginWindowActive: true });
    navigate(routeList.loginUser);
  };

  /**
   * Activa la opción de agregar nodo si el usuario está autenticado;
   * de lo contrario muestra una alerta.
   */
  const addNodeMenu = () => {
    if (isUserLogin) {
      navigate(routeList.addNode);
    } else {
      triggerAlert(t(textHardcoded + "triggerAlert"), "warning");
    }
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
              <PersonOutlineOutlinedIcon sx={style.accountAvatarSvg} />
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
          <MenuItem onClick={handleLoginWindow}>
            <ListItemIcon>
              <LoginIcon fontSize="small" />
            </ListItemIcon>
            {t(textHardcoded + "optionsMenu.login")}
          </MenuItem>
        )}

        <Divider />

        {/* Opción para agregar un nodo */}
        <MenuItem onClick={addNodeMenu}>
          <ListItemIcon>
            <HubIcon fontSize="small" />
          </ListItemIcon>
          {t(textHardcoded + "optionsMenu.addNode")}
        </MenuItem>

        <Divider />

        {/* Opción para configuración */}
        <MenuItem onClick={handleConfigWindow}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          {t(textHardcoded + "optionsMenu.configuration")}
        </MenuItem>

        {/* Opción para cerrar sesión */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>

          {t(textHardcoded + "optionsMenu.logOut")}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
