import {
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Box,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { cacheUser } from "@src/context/index";
import { useUIStore } from "@src/store";
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
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.startsWith("en") ? "en" : "es";

  const handleLogin = async () => {
    onClose();
    await onLogin();
  };

  const handleLogout = async () => {
    onClose();
    await onLogout();
  };

  const handleLanguageChange = async (language: "es" | "en") => {
    localStorage.setItem(cacheUser.languageUser, language);
    useUIStore.setState({ languageGlobal: { locale: language } });
    await i18n.changeLanguage(language);
    onClose();
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
              alt={t("components.header.googleAlt")}
              sx={{ width: 18, height: 18 }}
            />
          </ListItemIcon>
          <ListItemText primary={t("components.header.continueWithGoogle")} />
        </MenuItem>
      )}

      <Divider />

      <MenuItem disabled>
        <ListItemIcon>
          <TranslateRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("components.header.languageTitle")} />
      </MenuItem>

      <MenuItem onClick={() => void handleLanguageChange("es")}>
        <ListItemIcon>
          {currentLanguage === "es" ? <CheckRoundedIcon fontSize="small" /> : null}
        </ListItemIcon>
        <ListItemText primary={t("components.header.languageSpanish")} />
      </MenuItem>

      <MenuItem onClick={() => void handleLanguageChange("en")}>
        <ListItemIcon>
          {currentLanguage === "en" ? <CheckRoundedIcon fontSize="small" /> : null}
        </ListItemIcon>
        <ListItemText primary={t("components.header.languageEnglish")} />
      </MenuItem>

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
