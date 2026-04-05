import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AppBarNewHeader, PageContainer } from "@src/components/index";
import { routeList } from "@src/context/index";
import { useSession } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleNotFoundPage";

const TEXT_KEY = "components.notFound.";

/**
 * Pantalla comodín para rutas inexistentes.
 * Informa al usuario que la URL no corresponde a una vista válida
 * y ofrece acciones claras para retomar la navegación.
 *
 * @returns {JSX.Element} Vista 404 pública y consistente con el sistema visual.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useSession();

  const primaryTarget = isAuthenticated ? routeList.home : routeList.root;
  const secondaryTarget = isAuthenticated ? routeList.explorerScreen : routeList.root;

  return (
    <Box sx={styles.page}>
      <AppBarNewHeader />
      <PageContainer maxWidth="md" sx={styles.pageContainer}>
        <Box sx={styles.card}>
          <Stack spacing={2.5} alignItems="center" textAlign="center">
            <Box sx={styles.iconWrap}>
              <ReportProblemOutlinedIcon sx={styles.icon} />
            </Box>

            <Box>
              <Typography sx={styles.code}>
                404
              </Typography>
              <Typography component="h1" variant="h4" sx={styles.title}>
                {t(TEXT_KEY + "title")}
              </Typography>
            </Box>

            <Typography sx={styles.description}>
              {t(TEXT_KEY + "description")}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              width="100%"
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(primaryTarget)}
              >
                {t(TEXT_KEY + "primaryAction")}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(secondaryTarget)}
              >
                {t(TEXT_KEY + "secondaryAction")}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </PageContainer>
    </Box>
  );
}
