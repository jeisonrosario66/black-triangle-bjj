import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { editorialMedia, projectName } from "@bt/shared/context";
import { logoBlackTriangleFull } from "@bt/shared/assets";
import {
  AppBarNewHeader,
  EditorialImagePanel,
  PageContainer,
  SimpleGrid,
} from "@src/components/index";
import { routeList } from "@src/context/index";
import { useSession } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleLandingPage";

const LANDING_TEXT = "components.landing.";

/**
 * Pantalla pública de bienvenida a la plataforma.
 * Presenta la propuesta de valor y dirige el acceso al flujo autenticado.
 *
 * @returns {JSX.Element} Landing page pública.
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, login } = useSession();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(routeList.home, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Box sx={styles.page}>
      <AppBarNewHeader />
      <PageContainer sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Box sx={styles.heroSection}>
            <Box sx={styles.heroGrid}>
              <Box sx={styles.heroCopy}>
                <Box>
                  <Typography sx={styles.eyebrow}>
                    {t(LANDING_TEXT + "eyebrow")}
                  </Typography>
                  <Typography component="h1" variant="h4" sx={styles.heroTitle}>
                    {t(LANDING_TEXT + "title")}
                  </Typography>
                </Box>

                <Typography sx={styles.heroDescription}>
                  {t(LANDING_TEXT + "subtitle")}
                </Typography>

                <Box sx={styles.metricsRow}>
                  <Box sx={styles.metricCard}>
                    <Typography sx={styles.metricValue}>
                      {t(LANDING_TEXT + "metricGraphValue")}
                    </Typography>
                    <Typography sx={styles.metricLabel}>
                      {t(LANDING_TEXT + "metricGraphLabel")}
                    </Typography>
                  </Box>

                  <Box sx={styles.metricCard}>
                    <Typography sx={styles.metricValue}>
                      {t(LANDING_TEXT + "metricRoutesValue")}
                    </Typography>
                    <Typography sx={styles.metricLabel}>
                      {t(LANDING_TEXT + "metricRoutesLabel")}
                    </Typography>
                  </Box>

                  <Box sx={styles.metricCard}>
                    <Typography sx={styles.metricValue}>
                      {t(LANDING_TEXT + "metricProgressValue")}
                    </Typography>
                    <Typography sx={styles.metricLabel}>
                      {t(LANDING_TEXT + "metricProgressLabel")}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={styles.actionRow}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <LockOpenRoundedIcon />
                      )
                    }
                    onClick={() => void login()}
                    disabled={isLoading}
                  >
                    {t(LANDING_TEXT + "primaryCta")}
                  </Button>

                  <Typography sx={styles.helperText}>
                    {t(LANDING_TEXT + "helper")}
                  </Typography>
                </Box>
              </Box>

              <Box sx={styles.heroVisual}>
                <Box sx={styles.heroVisualContent}>
                  <Box
                    component="img"
                    src={logoBlackTriangleFull}
                    alt={projectName}
                    sx={styles.heroBrand}
                  />
                  <Typography sx={styles.heroVisualTitle}>
                    {t(LANDING_TEXT + "visualTitle")}
                  </Typography>
                  <Typography sx={styles.heroVisualBody}>
                    {t(LANDING_TEXT + "visualBody")}
                  </Typography>
                  <EditorialImagePanel
                    src={editorialMedia.landingHero.src}
                    alt={t(LANDING_TEXT + "visualTitle")}
                    objectPosition={editorialMedia.landingHero.objectPosition}
                    sx={styles.heroEditorialMedia}
                  />
                </Box>

                <Box sx={styles.heroFeatureStack}>
                  <Box sx={styles.heroFeatureCard}>
                    <Typography sx={styles.heroFeatureTitle}>
                      {t(LANDING_TEXT + "featurePersonalizedTitle")}
                    </Typography>
                    <Typography sx={styles.heroFeatureBody}>
                      {t(LANDING_TEXT + "featurePersonalizedDescription")}
                    </Typography>
                  </Box>

                  <Box sx={styles.heroFeatureCard}>
                    <Typography sx={styles.heroFeatureTitle}>
                      {t(LANDING_TEXT + "featureContinuityTitle")}
                    </Typography>
                    <Typography sx={styles.heroFeatureBody}>
                      {t(LANDING_TEXT + "featureContinuityDescription")}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <SimpleGrid columns={{ xs: 1, md: 3 }} gap={2}>
            <Box sx={styles.featureCard}>
              <AutoAwesomeRoundedIcon color="primary" />
              <Typography variant="h6" sx={styles.featureTitle}>
                {t(LANDING_TEXT + "featurePrecisionTitle")}
              </Typography>
              <Typography sx={styles.featureDescription}>
                {t(LANDING_TEXT + "featurePrecisionDescription")}
              </Typography>
            </Box>

            <Box sx={styles.featureCard}>
              <RouteRoundedIcon color="primary" />
              <Typography variant="h6" sx={styles.featureTitle}>
                {t(LANDING_TEXT + "featureRoutesTitle")}
              </Typography>
              <Typography sx={styles.featureDescription}>
                {t(LANDING_TEXT + "featureRoutesDescription")}
              </Typography>
            </Box>

            <Box sx={styles.featureCard}>
              <PlayCircleOutlineRoundedIcon color="primary" />
              <Typography variant="h6" sx={styles.featureTitle}>
                {t(LANDING_TEXT + "featureTrackingTitle")}
              </Typography>
              <Typography sx={styles.featureDescription}>
                {t(LANDING_TEXT + "featureTrackingDescription")}
              </Typography>
            </Box>
          </SimpleGrid>
        </Stack>
      </PageContainer>
    </Box>
  );
}
