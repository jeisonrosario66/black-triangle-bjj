import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
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

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  buildSystemsUIShared,
  getCachedSystemsShared,
  getCachedUserCourseStatsShared,
  buildCourseLocationStateShared,
  getCachedHomePersonalizationShared,
  getPersonalizedHomeShared,
  getSystemshared,
  getUserCourseStatsShared,
  trackCourseSelectionShared,
} from "@bt/shared/services";
import type {
  HomePersonalization,
  HomeRecommendedSystem,
  UserCourseStatDoc,
} from "@bt/shared/services";
import type { SystemCardUI } from "@bt/shared/context";
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
  PageContainer,
  SectionHeader,
  SimpleGrid,
  SystemCover,
} from "@src/components/index";

const HOME_TEXT = "components.home.";

const buildCoursePath = (label: string, coach: string) =>
  `${label}-${coach.replace(/ /g, "_")}`;

const formatGreetingName = (value?: string | null) =>
  value
    ?.split(/(\s+)/)
    .map((segment) =>
      /\s+/.test(segment) ? segment : capitalizeFirstLetter(segment.toLowerCase()),
    )
    .join("");

const formatCoachName = (value?: string | null) =>
  value
    ?.split(/(\s+|&)/)
    .map((segment) =>
      /\s+/.test(segment) || segment === "&"
        ? segment
        : capitalizeFirstLetter(segment.toLowerCase()),
    )
    .join("") ?? "";

type RecentHomeCourse = NonNullable<HomePersonalization["lastCourse"]>;

const buildRecentCourses = ({
  homeData,
  statsMap,
  systems,
}: {
  homeData: HomePersonalization | null;
  statsMap: Map<string, UserCourseStatDoc>;
  systems: SystemCardUI[];
}): RecentHomeCourse[] => {
  const systemsByLabel = new Map(systems.map((system) => [system.label, system]));
  const recentLabels = Array.from(statsMap.entries())
    .filter(([, stat]) =>
      Boolean(stat.lastExplorerAt || stat.lastVideoAt || stat.watchedVideoIds?.length),
    )
    .sort((a, b) => {
      const aDate = new Date(a[1].lastExplorerAt ?? a[1].lastVideoAt ?? 0).getTime();
      const bDate = new Date(b[1].lastExplorerAt ?? b[1].lastVideoAt ?? 0).getTime();
      return bDate - aDate;
    })
    .map(([label]) => label);

  const labels = Array.from(
    new Set(
      [homeData?.lastCourse?.label, ...recentLabels].filter(Boolean) as string[],
    ),
  ).slice(0, 3);

  return labels
    .map((label) => {
      if (homeData?.lastCourse?.label === label) {
        return homeData.lastCourse;
      }

      const stat = statsMap.get(label);
      const baseSystem =
        systemsByLabel.get(label) ??
        (stat
          ? ({
              ...stat,
              setSystem: stat.setSystem ?? "",
              coverUrl: stat.coverUrl ?? "",
              videoCount: stat.videoCount,
            } as SystemCardUI)
          : null);

      if (!baseSystem) {
        return null;
      }

      const watchedVideosCount = stat?.watchedVideoIds?.length ?? 0;
      const totalVideos = baseSystem.videoCount ?? 0;
      const progressPercentage = totalVideos
        ? Math.min(100, Math.round((watchedVideosCount / totalVideos) * 100))
        : 0;

      return {
        ...baseSystem,
        lastVideoId: stat?.lastVideoId,
        lastVideoName: stat?.lastVideoName,
        progressPercentage,
        watchedVideosCount,
      };
    })
    .filter(Boolean) as RecentHomeCourse[];
};

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
  const cachedUserStats = user?.email
    ? getCachedUserCourseStatsShared(user.email)
    : null;
  const cachedSystemsData = getCachedSystemsShared(language);
  const cachedSystems = useMemo(
    () => (cachedSystemsData ? buildSystemsUIShared(cachedSystemsData).systems : []),
    [cachedSystemsData],
  );

  const [homeData, setHomeData] = useState<HomePersonalization | null>(
    () => cachedHomeData,
  );
  const [loading, setLoading] = useState(!cachedHomeData);
  const [recentCourses, setRecentCourses] = useState<RecentHomeCourse[]>(() =>
    buildRecentCourses({
      homeData: cachedHomeData,
      statsMap: cachedUserStats ?? new Map(),
      systems: cachedSystems,
    }),
  );
  const [recentActiveIndex, setRecentActiveIndex] = useState(0);
  const recentCarouselRef = useRef<HTMLDivElement | null>(null);

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
          setRecentCourses([]);
          setRecentActiveIndex(0);
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

        const [nextStatsMap, nextSystemsData] = await Promise.all([
          getUserCourseStatsShared({
            email: user.email,
            firestore: {
              collection,
              database,
              getDocs,
            },
          }),
          getSystemshared(getDocs, collection, database, language),
        ]);
        const nextSystems = buildSystemsUIShared(nextSystemsData).systems;

        if (mounted) {
          setHomeData(nextHomeData);
          const nextRecentCourses = buildRecentCourses({
            homeData: nextHomeData,
            statsMap: nextStatsMap,
            systems: nextSystems,
          });
          setRecentCourses(nextRecentCourses);
          setRecentActiveIndex(0);
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

  const openCourse = (
    system: HomeRecommendedSystem | HomePersonalization["lastCourse"],
  ) => {
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

  const systemReason = (system: HomeRecommendedSystem) => {
    switch (system.reasonType) {
      case "set":
        return t(HOME_TEXT + "systemReasonSet", { topic: system.setSystem });
      case "coach":
        return t(HOME_TEXT + "systemReasonCoach", {
          topic: formatCoachName(system.coach),
        });
      case "recent":
        return t(HOME_TEXT + "systemReasonRecent");
      default:
        return t(HOME_TEXT + "systemReasonPopular");
    }
  };

  const greetingName = useMemo(
    () =>
      formatGreetingName(user?.name || user?.firstName) ||
      t(HOME_TEXT + "defaultName"),
    [t, user?.firstName, user?.name],
  );
  const visibleRecentCourses = useMemo(
    () =>
      recentCourses.length > 0
        ? recentCourses
        : homeData?.lastCourse
          ? [homeData.lastCourse]
          : [],
    [homeData?.lastCourse, recentCourses],
  );

  useEffect(() => {
    setRecentActiveIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(visibleRecentCourses.length - 1, 0)),
    );
  }, [visibleRecentCourses.length]);

  useEffect(() => {
    const container = recentCarouselRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      left: container.clientWidth * recentActiveIndex,
      behavior: "smooth",
    });
  }, [recentActiveIndex]);

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
          </Box>

          <Box>

            {visibleRecentCourses.length > 0 ? (
              <Box sx={style.recentSection}>
                <SectionHeader
                  title={t(HOME_TEXT + "continueTitle")}
                  subtitle={t(HOME_TEXT + "continueSubtitle")}
                  withDivider={false}
                />

                <Box
                  ref={recentCarouselRef}
                  sx={style.recentCarousel}
                  onScroll={(event) => {
                    const container = event.currentTarget;
                    const cardWidth = Math.max(container.clientWidth, 1);
                    const nextIndex = Math.round(container.scrollLeft / cardWidth);
                    if (nextIndex !== recentActiveIndex) {
                      setRecentActiveIndex(nextIndex);
                    }
                  }}
                >
                  {visibleRecentCourses.map((course) => (
                    <Card key={course.label} sx={style.recentCard}>
                      <CardActionArea onClick={() => openCourse(course)}>
                        <Box sx={style.recentCardMedia}>
                          <SystemCover
                            eyebrow={t(HOME_TEXT + "lastSeenFromExplorer")}
                            subtitle={t(HOME_TEXT + "continueTitle")}
                            title={capitalizeFirstLetter(course.name)}
                            coach={`${capitalizeFirstLetter(course.setSystem)} · ${formatCoachName(course.coach)}`}
                            coverUrl={course.coverUrl}
                            variant="home"
                          />
                        </Box>

                        <Box sx={style.progressFooter}>
                          <Typography variant="body2" sx={style.cardLabelStyle}>
                            {course.videoCount
                              ? t(HOME_TEXT + "progressLabel", {
                                  current: course.watchedVideosCount,
                                  percent: course.progressPercentage,
                                  total: course.videoCount,
                                })
                              : t(HOME_TEXT + "progressFallback")}
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={course.progressPercentage}
                            sx={style.progressBar}
                          />
                        </Box>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>

                {visibleRecentCourses.length > 1 ? (
                  <Box sx={style.recentIndicators}>
                    <Box sx={style.recentDots}>
                      {visibleRecentCourses.map((course, index) => (
                        <Box
                          key={`${course.label}:dot`}
                          sx={[
                            style.recentDot,
                            index === recentActiveIndex ? style.recentDotActive : null,
                          ]}
                        />
                      ))}
                    </Box>

                    <Typography variant="caption" sx={style.recentIndicatorsLabel}>
                      {recentActiveIndex + 1} / {visibleRecentCourses.length}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
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
                        coach={formatCoachName(system.coach)}
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
