import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  useMediaQuery,
  Typography,
  Container,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import { HeaderActions, HeaderMenu } from "@src/components/index";
import { projectName, isLogin} from "@bt/shared/context/configShared";
import logo from "@bt/shared/assets/logo.png";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: theme.palette.surface,
          borderBottom: `1px solid ${theme.palette.outlineVariant}`,
        }}
        elevation={0}
      >
        <Toolbar>
          <Container
            maxWidth="xl"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box sx={{ mr: 1 }}>
              <img src={logo} alt="Logo" width={28} />
            </Box>

            <Typography
              sx={{ color: theme.palette.text.primary, fontSize: 19 }}
              flexGrow={1}
              variant={isMobile ? "subtitle1" : "h6"}
            >
              {projectName}
            </Typography>

            <HeaderActions
              isMobile={isMobile}
              isLogin={isLogin}
              onAvatarClick={(e) => setAnchorEl(e.currentTarget)}
            />
          </Container>
        </Toolbar>
      </AppBar>

      <HeaderMenu
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        isLogin={isLogin}
      />
    </>
  );
}
