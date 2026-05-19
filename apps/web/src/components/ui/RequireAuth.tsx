import { logoBlackTriangleOnlyText } from "@bt/shared/assets";
import { Box, Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { routeList } from "@src/context/index";
import { useSession } from "@src/hooks/index";
import * as loadingStyles from "@src/styles/screens/styleLoading";
import AppBarNewHeader from "@src/components/header/AppBarNewHeader";
import PageContainer from "@src/components/ui/PageContainer";

/**
 * Protege una ruta para que solo sea accesible cuando existe una sesión activa.
 * Mientras la autenticación se resuelve, mantiene un estado de carga neutro.
 *
 * @param {{ children: ReactNode }} props - Contenido protegido por autenticación.
 * @returns {JSX.Element} Contenido autorizado o redirección a la raíz pública.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useSession();
  const targetPath = `${location.pathname}${location.search}${location.hash}`;

  if (isLoading) {
    return (
      <Box sx={loadingStyles.loading}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `
            radial-gradient(circle at 12% 18%, rgba(179, 138, 75, 0.18) 0%, transparent 24%),
            radial-gradient(circle at 82% 16%, rgba(255, 255, 255, 0.08) 0%, transparent 20%),
            linear-gradient(160deg, #101317 0%, #171C22 42%, #1D2530 100%)
          `,
        }}
      >
        <AppBarNewHeader />
        <PageContainer
          sx={{
            minHeight: "calc(100vh - 72px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: { xs: 2, md: 3 },
            pb: { xs: 4, md: 6 },
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 760,
              p: { xs: 2.25, md: 3.25 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, md: 2.4 },
              borderRadius: 4,
              border: `1px solid ${alpha("#FFFFFF", 0.12)}`,
              background: `
                radial-gradient(circle at 14% 18%, ${alpha("#B38A4B", 0.16)} 0%, transparent 22%),
                radial-gradient(circle at 86% 12%, ${alpha("#FFFFFF", 0.05)} 0%, transparent 18%),
                linear-gradient(160deg, #161C23 0%, #1B222B 44%, #222B35 100%)
              `,
              boxShadow: "0 22px 60px rgba(2, 6, 23, 0.38)",
            }}
          >
            <Stack spacing={{ xs: 1.3, md: 1.6 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  px: { xs: 1.1, md: 1.35 },
                  py: { xs: 0.9, md: 1.05 },
                  borderRadius: 3,
                  backgroundColor: alpha("#0B0F14", 0.46),
                  border: `1px solid ${alpha("#FFFFFF", 0.08)}`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  component="img"
                  src={logoBlackTriangleOnlyText}
                  alt="Black Triangle BJJ"
                  sx={{
                    width: { xs: 210, md: 280 },
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </Box>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  color: "primary.light",
                }}
              >
                {t("components.authGate.eyebrow")}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: "#F8FAFC",
                  fontSize: { xs: "1.65rem", md: "2.3rem" },
                }}
              >
                {t("components.authGate.title")}
              </Typography>
              <Typography
                sx={{
                  color: alpha("#E2E8F0", 0.82),
                  maxWidth: 620,
                  lineHeight: 1.6,
                  fontSize: { xs: "0.96rem", md: "1rem" },
                }}
              >
                {t("components.authGate.description")}
              </Typography>
            </Stack>

            <Box
              sx={{
                p: { xs: 1.15, md: 1.35 },
                borderRadius: 3,
                backgroundColor: alpha("#0B0F14", 0.34),
                border: `1px solid ${alpha("#FFFFFF", 0.08)}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: alpha("#E2E8F0", 0.74),
                  mb: 0.6,
                }}
              >
                {t("components.authGate.routeLabel")}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: { xs: "0.8rem", md: "0.88rem" },
                  color: "#F8FAFC",
                  overflowWrap: "anywhere",
                }}
              >
                {targetPath}
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                variant="contained"
                size="large"
                onClick={() =>
                  navigate(routeList.root, {
                    replace: true,
                    state: { from: targetPath },
                  })
                }
              >
                {t("components.authGate.action")}
              </Button>
              <Typography
                sx={{
                  alignSelf: { xs: "flex-start", sm: "center" },
                  color: alpha("#E2E8F0", 0.72),
                  fontSize: "0.92rem",
                }}
              >
                {t("components.authGate.hint")}
              </Typography>
            </Stack>
          </Card>
        </PageContainer>
      </Box>
    );
  }

  return <>{children}</>;
}
