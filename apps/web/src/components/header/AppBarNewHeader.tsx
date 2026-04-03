import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  useMediaQuery,
  Typography,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useTheme } from "@mui/material/styles";

import { HeaderActions, HeaderMenu } from "@src/components/index";
import { routeList } from "@src/context/index";
import { useSession } from "@src/hooks/index";
import { projectName } from "@bt/shared/context/configShared";
import logo from "@bt/shared/assets/logo.png";
import * as style from "@src/styles/header/stylesAppBarNewheader";

/**
 * Renderiza el encabezado principal de la aplicación web.
 * Este componente centraliza la barra superior (AppBar) y coordina la
 * visualización del branding, el título del proyecto y las acciones de usuario,
 * adaptando su comportamiento según el breakpoint activo (desktop o mobile).
 *
 * Actúa como punto de integración entre la navegación superior y los menús
 * contextuales dependientes del estado de autenticación.
 *
 * @returns {JSX.Element} Barra superior de la aplicación con acciones y menú contextual.
 */
export default function AppBarHeader() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, isAuthenticated, isLoading, login, logout } = useSession();
  const homeTarget = isAuthenticated ? routeList.home : routeList.root;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <>
      <AppBar
        position="sticky"
        sx={style.appBar}
        elevation={0}
      >
        <Toolbar>
          <Container
            maxWidth="xl"
            sx={style.toolbarContainer}
          >
            <Box
              onClick={() => navigate(homeTarget)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(homeTarget);
                }
              }}
              sx={style.brandButton}
              role="button"
              tabIndex={0}
              aria-label={t("components.header.goHome")}
            >
              <Box sx={style.brandLogo}>
                <img src={logo} alt="Logo" width={28} />
              </Box>

              <Typography
                sx={style.brandTitle}
                variant={isMobile ? "subtitle1" : "h6"}
              >
                {projectName}
              </Typography>
            </Box>

            <HeaderActions
              isMobile={isMobile}
              isLogin={isAuthenticated}
              isLoading={isLoading}
              userInitials={user?.initials}
              onAvatarClick={(e) => setAnchorEl(e.currentTarget)}
            />
          </Container>
        </Toolbar>
      </AppBar>

      <HeaderMenu
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        isLogin={isAuthenticated}
        isLoading={isLoading}
        user={user}
        onLogin={login}
        onLogout={logout}
      />
    </>
  );
}
