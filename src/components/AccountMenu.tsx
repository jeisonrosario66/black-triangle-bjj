import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import HubIcon from "@mui/icons-material/hub";
import Tooltip from "@mui/material/Tooltip";
import LoginIcon from "@mui/icons-material/Login";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import * as style from "@src/styles/stylesAccountMenu";
import useUIStore from "@src/store/useCounterStore";
import handleLogout from "@src/hooks/logOut";

export default function AccountMenu() {
  // Estado global para verificar si el usuario está logueado
  const isUserLogin = useUIStore((state) => state.isUserLogin);
  const userLoginData = useUIStore((state) => state.userLoginData);

  // Estado local para manejar la apertura/cierre del menú
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Función para mostrar alertas
  const triggerAlert = useUIStore((state) => state.triggerAlert);

  // Abre el menú al hacer clic en el botón
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    useUIStore.setState({ isNodeViewActive: false });
  };

  // Cierra el menú
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Abre la ventana de inicio de sesión
  const handleLoginWindow = () => {
    useUIStore.setState({ isLoginWindowActive: true });
  };

  // Activa el formulario de agregar nodo si el usuario está logueado
  const addNodeMenu = () => {
    isUserLogin
      ? useUIStore.setState({ isAddNodeActive: true })
      : triggerAlert("Sesión Cerrada", "warning");
  };

  return (
    <React.Fragment>
      {/* Botón del menú de usuario */}
      <Box sx={style.containerAccountMenu}>
        <Tooltip title="Menu Usuario">
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
        onClick={handleClose}
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
        {isUserLogin ? (
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Avatar
                alt={userLoginData.displayName ?? "User"}
                src={userLoginData.photoURL ?? undefined}
              />
            </ListItemIcon>
            {userLoginData.displayName}
          </MenuItem>
        ) : (
          // Si no está logueado, muestra la opción para iniciar sesión
          <MenuItem onClick={handleLoginWindow}>
            <ListItemIcon>
              <LoginIcon fontSize="small" />
            </ListItemIcon>
            Iniciar sesión
          </MenuItem>
        )}

        <Divider />

        {/* Opción para agregar un nodo */}
        <MenuItem onClick={addNodeMenu}>
          <ListItemIcon>
            <HubIcon fontSize="small" />
          </ListItemIcon>
          Agregar Nodo
        </MenuItem>

        <Divider />

        {/* Opción para configuración */}
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>

        {/* Opción para cerrar sesión */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
