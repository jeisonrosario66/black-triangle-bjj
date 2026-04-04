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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { startTransition, useEffect, useMemo, useState } from "react";
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
import { editorialMedia } from "@bt/shared/context";
import { capitalizeFirstLetter } from "@bt/shared/utils/index";
import {
  collection,
  doc,
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
  EditorialImagePanel,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

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
          database,
          doc,
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

  const toggleRoute = (routeId: string) => {
    startTransition(() => {
      setExpandedRouteId((currentRouteId) =>
        currentRouteId === routeId ? null : routeId,
      );
    });
  };

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
          <Box sx={style.introGrid}>
            <Box sx={style.intro}>
              <SectionHeader
                title={t(HOME_TEXT + "title", { name: greetingName })}
                withDivider={false}
              />
            </Box>

            {!isMobile ? (
              <EditorialImagePanel
                src={editorialMedia.homeIntro.src}
                alt={t(HOME_TEXT + "title", { name: greetingName })}
                eyebrow={t(HOME_TEXT + "continueTitle")}
                title={t(HOME_TEXT + "continueSubtitle")}
                objectPosition={editorialMedia.homeIntro.objectPosition}
                sx={style.introVisual}
              />
            ) : null}
          </Box>

          <Box>

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
                    onClick={() => navigate(routeList.explorerScreen)}
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
                  onClick={() => navigate(routeList.explorerScreen)}
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
                    onClick={() => toggleRoute(route.id)}
                    sx={style.cardRouteButtom}
                  >
                    {expandedRouteId === route.id
                      ? t(HOME_TEXT + "hideRoute")
                      : t(HOME_TEXT + "openRoute")}
                  </Button>

                  {expandedRouteId === route.id ? (
                    <Stack sx={style.routeCourseList}>
                      {route.courses.map((course) => (
                        <Box key={`${route.id}:${course.label}`} sx={style.routeCourseCard}>
                          <Box sx={style.routeCourseLayout}>
                            <Box sx={style.routeCourseContent}>
                              <Typography sx={style.routeCourseTitle}>
                                {capitalizeFirstLetter(course.name)}
                              </Typography>

                              <Typography variant="body2" sx={style.routeCourseMeta}>
                                {`${capitalizeFirstLetter(course.setSystem)} · ${capitalizeFirstLetter(course.coach)}`}
                              </Typography>

                              <Button
                                variant="text"
                                onClick={() => openCourse(course)}
                                sx={style.routeCourseButton}
                              >
                                {t(HOME_TEXT + "openCourse")}
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : null}
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
                  onClick={() => navigate(routeList.explorerScreen)}
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
