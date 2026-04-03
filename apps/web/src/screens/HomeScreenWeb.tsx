import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  buildCourseLocationStateShared,
  getCachedHomePersonalizationShared,
  getPersonalizedHomeShared,
  trackCourseSelectionShared,
} from "@bt/shared/services";
import type {
  HomePersonalization,
  HomeRecommendedRoute,
  HomeRecommendedSystem,
} from "@bt/shared/services";
import { capitalizeFirstLetter } from "@bt/shared/utils/index";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
} from "firebase/firestore";

import * as style from "@src/styles/screens/styleHomeScreenWeb";
import * as loadingStyles from "@src/styles/screens/styleLoading";
import { routeList } from "@src/context/index";
import { database, useSession } from "@src/hooks/index";
import {
  AppBarNewHeader,
  PageContainer,
  SectionHeader,
  SimpleGrid,
  SystemCover,
} from "@src/components/index";

const HOME_TEXT = "components.home.";

const buildCoursePath = (label: string, coach: string) =>
  `${label}-${coach.replace(/ /g, "_")}`;

/**
 * Pantalla principal web personalizada.
 * Consume señales de actividad del usuario almacenadas en Firestore para
 * priorizar continuidad, recomendaciones y exploración guiada.
 *
 * @returns {JSX.Element} Home personalizado en función del comportamiento del usuario.
 */
export default function HomeScreenWeb() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const language = i18n.language.startsWith("en") ? "en" : "es";
  const cachedHomeData = user?.email
    ? getCachedHomePersonalizationShared(user.email, language)
    : null;

  const [homeData, setHomeData] = useState<HomePersonalization | null>(
    () => cachedHomeData,
  );
  const [loading, setLoading] = useState(!cachedHomeData);

  useEffect(() => {
    let mounted = true;

    const loadHomeData = async () => {
      if (mounted) {
        setLoading(!cachedHomeData);

        if (cachedHomeData) {
          setHomeData(cachedHomeData);
        }
      }

      if (!user?.email) {
        if (mounted) {
          setHomeData(null);
          setLoading(false);
        }
        return;
      }

      try {
        const nextHomeData = await getPersonalizedHomeShared({
          email: user.email,
          firestore: {
            collection,
            database,
            doc,
            getDoc,
            getDocs,
          },
          language,
        });

        if (mounted) {
          setHomeData(nextHomeData);
        }
      } catch (error) {
        console.error("No se pudo construir el home personalizado:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadHomeData();

    return () => {
      mounted = false;
    };
  }, [cachedHomeData, language, user?.email]);

  const openCourse = (system: HomeRecommendedSystem | HomePersonalization["lastCourse"] | HomeRecommendedRoute["focusCourse"]) => {
    if (!system) {
      return;
    }

    if (user?.email) {
      void trackCourseSelectionShared({
        email: user.email,
        firestore: {
          arrayUnion,
          collection,
          database,
          doc,
          getDoc,
          getDocs,
          increment,
          setDoc,
        },
        source: "home",
        system,
      });
    }

    navigate(
      routeList.courseDetailScreen.replace(
        ":systemName",
        buildCoursePath(system.label, system.coach),
      ),
      {
        state: buildCourseLocationStateShared(system, "home"),
      },
    );
  };

  const routeTitle = (route: HomeRecommendedRoute) => {
    switch (route.reasonType) {
      case "set":
        return t(HOME_TEXT + "routeTitleSet", { topic: route.topic });
      case "coach":
        return t(HOME_TEXT + "routeTitleCoach", { topic: route.topic });
      default:
        return t(HOME_TEXT + "routeTitlePopular");
    }
  };

  const routeReason = (route: HomeRecommendedRoute) => {
    switch (route.reasonType) {
      case "set":
        return t(HOME_TEXT + "routeReasonSet", { topic: route.topic });
      case "coach":
        return t(HOME_TEXT + "routeReasonCoach", { topic: route.topic });
      default:
        return t(HOME_TEXT + "routeReasonPopular");
    }
  };

  const systemReason = (system: HomeRecommendedSystem) => {
    switch (system.reasonType) {
      case "set":
        return t(HOME_TEXT + "systemReasonSet", { topic: system.setSystem });
      case "coach":
        return t(HOME_TEXT + "systemReasonCoach", { topic: system.coach });
      case "recent":
        return t(HOME_TEXT + "systemReasonRecent");
      default:
        return t(HOME_TEXT + "systemReasonPopular");
    }
  };

  const greetingName = useMemo(
    () => user?.firstName || user?.name || "Fighter",
    [user?.firstName, user?.name],
  );

  if (loading && !homeData) {
    return (
      <Box sx={loadingStyles.loading}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={style.page}>
      <AppBarNewHeader />
      <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
        <Stack spacing={{ xs: 4, md: 6 }}>
          <Box sx={style.intro}>
            <Typography sx={style.introEyebrow}>
              {t(HOME_TEXT + "eyebrow")}
            </Typography>
            <SectionHeader
              title={t(HOME_TEXT + "title", { name: greetingName })}
              subtitle={t(HOME_TEXT + "subtitle")}
              withDivider={false}
            />
          </Box>

          <Box>
            <SectionHeader
              title={t(HOME_TEXT + "continueTitle")}
              subtitle={t(HOME_TEXT + "continueSubtitle")}
            />

            {homeData?.lastCourse ? (
              <Card sx={style.progressCard}>
                <Box sx={style.progressMedia}>
                  <SystemCover
                    title={capitalizeFirstLetter(homeData.lastCourse.name)}
                    subtitle={capitalizeFirstLetter(homeData.lastCourse.setSystem)}
                    coach={capitalizeFirstLetter(homeData.lastCourse.coach)}
                    coverUrl={homeData.lastCourse.coverUrl}
                    variant="card"
                  />
                </Box>

                <CardContent sx={style.progressContent}>
                  <Typography variant="overline" sx={style.cardLabelStyle}>
                    {t(HOME_TEXT + "lastSeenFromExplorer")}
                  </Typography>

                  <Typography variant="h6" sx={style.cardTitleStyle}>
                    {capitalizeFirstLetter(homeData.lastCourse.name)}
                  </Typography>

                  <Box sx={style.progressMetaRow}>
                    <Box component="span" sx={style.progressStat}>
                      {capitalizeFirstLetter(homeData.lastCourse.setSystem)}
                    </Box>
                    <Box component="span" sx={style.progressStat}>
                      {capitalizeFirstLetter(homeData.lastCourse.coach)}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={style.cardLabelStyle}>
                    {homeData.lastCourse.videoCount
                      ? t(HOME_TEXT + "progressLabel", {
                          current: homeData.lastCourse.watchedVideosCount,
                          percent: homeData.lastCourse.progressPercentage,
                          total: homeData.lastCourse.videoCount,
                        })
                      : t(HOME_TEXT + "progressFallback")}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={homeData.lastCourse.progressPercentage}
                    sx={style.progressBar}
                  />

                  {homeData.lastCourse.lastVideoName ? (
                    <Typography variant="body2" sx={style.cardLabelStyle}>
                      {t(HOME_TEXT + "lastVideo", {
                        name: homeData.lastCourse.lastVideoName,
                      })}
                    </Typography>
                  ) : null}

                  <Button
                    sx={style.cardBottomStyle}
                    variant="outlined"
                    onClick={() => openCourse(homeData.lastCourse)}
                  >
                    {t(HOME_TEXT + "continueCourse")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card sx={style.emptyCard}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={style.cardTitleStyle}>
                    {t(HOME_TEXT + "emptyProgressTitle")}
                  </Typography>

                  <Typography variant="body2" sx={style.cardLabelStyle}>
                    {t(HOME_TEXT + "emptyProgressDescription")}
                  </Typography>

                  <Button
                    variant="outlined"
                    sx={style.cardBottomStyle}
                    onClick={() => navigate(routeList.root)}
                  >
                    {t(HOME_TEXT + "startExploring")}
                  </Button>
                </Stack>
              </Card>
            )}
          </Box>

          <Box>
            <SectionHeader
              title={t(HOME_TEXT + "routesTitle")}
              subtitle={t(HOME_TEXT + "routesSubtitle")}
              action={
                <Button
                  endIcon={<ArrowForwardIosIcon />}
                  variant="outlined"
                  size="small"
                  sx={style.sectionAction}
                  onClick={() => navigate(routeList.root)}
                >
                  {t(HOME_TEXT + "seeAllSystems")}
                </Button>
              }
            />

            <SimpleGrid columns={{ xs: 1, md: 2 }} gap={2}>
              {(homeData?.recommendedRoutes ?? []).map((route) => (
                <Card key={route.id} sx={style.routeCard}>
                  <Box sx={style.routeHeader}>
                    <Typography sx={style.cardTitleStyle} variant="subtitle1">
                      {routeTitle(route)}
                    </Typography>

                    <Typography sx={style.routeMeta}>
                      {t(HOME_TEXT + "routeStats", {
                        courses: route.courseCount,
                        videos: route.totalVideos,
                      })}
                    </Typography>

                    <Typography variant="body2" sx={style.routeReason}>
                      {routeReason(route)}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    onClick={() => openCourse(route.focusCourse)}
                    sx={style.cardRouteButtom}
                  >
                    {t(HOME_TEXT + "openRoute")}
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          <Box>
            <SectionHeader
              title={t(HOME_TEXT + "systemsTitle")}
              subtitle={t(HOME_TEXT + "systemsSubtitle")}
              action={
                <Button
                  endIcon={<ArrowForwardIosIcon />}
                  variant="outlined"
                  size="small"
                  sx={style.sectionAction}
                  onClick={() => navigate(routeList.root)}
                >
                  {t(HOME_TEXT + "seeAllSystems")}
                </Button>
              }
            />

            <SimpleGrid columns={{ xs: 1, md: 3 }} gap={2}>
              {(homeData?.recommendedSystems ?? []).map((system) => (
                <Card key={system.label} sx={style.systemCard}>
                  <CardActionArea onClick={() => openCourse(system)}>
                    <Box sx={style.systemMedia}>
                      <SystemCover
                        title={capitalizeFirstLetter(system.name)}
                        subtitle={capitalizeFirstLetter(system.setSystem)}
                        coach={capitalizeFirstLetter(system.coach)}
                        coverUrl={system.coverUrl}
                        videoCount={system.videoCount}
                        variant="card"
                      />
                    </Box>

                    <CardContent sx={style.systemContent}>
                      <Typography variant="body2" sx={style.systemReason}>
                        {systemReason(system)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </Stack>
      </PageContainer>
    </Box>
  );
}
