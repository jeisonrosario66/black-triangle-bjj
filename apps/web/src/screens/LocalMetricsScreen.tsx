import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AppBarNewHeader, BreadcrumbsBar, PageContainer, SimpleGrid } from "@src/components";
import { routeList } from "@src/context";
import { database, useSession } from "@src/hooks";
import { capitalizeFirstLetter, hasGraphEditorAccess } from "@src/utils";
import { buildCoursePath } from "@src/utils/courseNavigation";
import type { UserCourseStatDoc, VideoProgressEntry } from "@bt/shared/services";

const USERS_COLLECTION = "users";
const USER_COURSE_STATS_COLLECTION = "course_stats";

type LocalUserDoc = {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roles?: string[];
};

type LocalNodeMeta = {
  id: number;
  name: string;
  group?: string;
};

type LocalCourseStatsEntry = {
  userEmail: string;
  courseLabel: string;
  data: UserCourseStatDoc;
};

type LocalVideoInsight = {
  key: string;
  courseLabel: string;
  courseName: string;
  coursePath?: string;
  nodeId: number;
  nodeName: string;
  group?: string;
  progressPercent: number;
  completed: boolean;
  lastPositionSeconds?: number;
  updatedAt?: string;
  replayCount: number;
};

type LocalCourseInsight = {
  courseLabel: string;
  courseName: string;
  coach: string;
  setSystem: string;
  watchedVideosCount: number;
  completedVideosCount: number;
  videoViews: number;
  courseViews: number;
  replayCount: number;
  lastActivityAt?: string;
  lastVideoId?: number;
  lastVideoName?: string;
  routePath?: string;
  videos: LocalVideoInsight[];
  raw: UserCourseStatDoc;
};

type LocalUserInsight = {
  email: string;
  name: string;
  role: string;
  roles: string[];
  courses: LocalCourseInsight[];
  totalCourseViews: number;
  totalVideoViews: number;
  totalWatchedVideos: number;
  totalCompletedVideos: number;
  totalReplayCount: number;
  lastActivityAt?: string;
  latestCourse?: LocalCourseInsight;
  latestVideo?: LocalVideoInsight;
  rawUser: LocalUserDoc;
};

type GlobalCourseInsight = {
  courseLabel: string;
  courseName: string;
  coach: string;
  users: Set<string>;
  courseViews: number;
  videoViews: number;
  replayCount: number;
  completedVideosCount: number;
  lastActivityAt?: string;
};

type GlobalVideoInsight = {
  key: string;
  courseLabel: string;
  courseName: string;
  nodeId: number;
  nodeName: string;
  users: Set<string>;
  replayCount: number;
  completions: number;
  progressSum: number;
  progressSamples: number;
  lastActivityAt?: string;
};

type LocalMetricsSnapshot = {
  users: LocalUserInsight[];
  totalUsers: number;
  activeUsers: number;
  totalCourseViews: number;
  totalVideoViews: number;
  totalReplayCount: number;
  totalCompletedVideos: number;
  courses: Array<GlobalCourseInsight & { usersCount: number }>;
  videos: Array<
    Omit<GlobalVideoInsight, "users"> & { usersCount: number; averageProgress: number }
  >;
};

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const formatDateTime = (value?: string, locale = "es") => {
  if (!value) {
    return "Sin actividad";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

const getLatestTimestamp = (values: Array<string | undefined>) =>
  values
    .filter(Boolean)
    .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

const sumReplayCounts = (value?: Record<string, number>) =>
  Object.values(value ?? {}).reduce((accumulator, current) => accumulator + current, 0);

const sumCourseIds = (value?: number[]) => (value ?? []).length;

const resolveNodeId = (raw: unknown, fallback: string) => {
  const normalizedValue = Number(raw ?? fallback);
  return Number.isFinite(normalizedValue) ? normalizedValue : null;
};

const buildNodeMapsByPath = async ({
  language,
  valueNodes,
}: {
  language: "es" | "en";
  valueNodes: string[];
}) => {
  const entries = await Promise.all(
    valueNodes.map(async (path) => {
      try {
        const snapshot = await getDocs(collection(database, path));
        const nodeMap = new Map<number, LocalNodeMeta>();

        snapshot.docs.forEach((nodeDoc) => {
          const docData = nodeDoc.data();
          const nodeId = resolveNodeId(docData.index ?? docData.id, nodeDoc.id);

          if (nodeId === null) {
            return;
          }

          nodeMap.set(nodeId, {
            id: nodeId,
            name:
              (language === "en" ? docData.name_en : docData.name_es) ??
              docData.name_es ??
              docData.name_en ??
              `Video ${nodeId}`,
            group: docData.group ?? "",
          });
        });

        return [path, nodeMap] as const;
      } catch (error) {
        console.error(`No se pudieron cargar los nodos de ${path}:`, error);
        return [path, new Map<number, LocalNodeMeta>()] as const;
      }
    }),
  );

  return new Map(entries);
};

const buildCourseInsight = ({
  courseLabel,
  raw,
  valueNodes,
}: {
  courseLabel: string;
  raw: UserCourseStatDoc;
  valueNodes: Map<string, Map<number, LocalNodeMeta>>;
}) => {
  const nodesMap = raw.valueNodes ? valueNodes.get(raw.valueNodes) : undefined;
  const watchedIds = new Set<number>(raw.watchedVideoIds ?? []);
  const completedIds = new Set<number>(raw.completedVideoIds ?? []);
  const replayCounts = raw.videoReplayCounts ?? {};
  const progressById = raw.videoProgressById ?? {};

  Object.keys(progressById).forEach((videoId) => watchedIds.add(Number(videoId)));
  Object.keys(replayCounts).forEach((videoId) => watchedIds.add(Number(videoId)));
  completedIds.forEach((videoId) => watchedIds.add(videoId));

  if (typeof raw.lastVideoId === "number") {
    watchedIds.add(raw.lastVideoId);
  }

  const coursePath =
    raw.label && raw.coach
      ? buildCoursePath(raw.label, raw.coach)
      : undefined;

  const videos = [...watchedIds]
    .filter((videoId) => Number.isFinite(videoId))
    .map((videoId) => {
      const progressEntry: VideoProgressEntry = progressById[String(videoId)] ?? {};
      const nodeMeta = nodesMap?.get(videoId);
      const resolvedName =
        nodeMeta?.name ??
        (videoId === raw.lastVideoId ? raw.lastVideoName : undefined) ??
        `Video ${videoId}`;

      return {
        key: `${courseLabel}:${videoId}`,
        courseLabel,
        courseName: raw.name || courseLabel,
        coursePath,
        nodeId: videoId,
        nodeName: resolvedName,
        group: nodeMeta?.group,
        progressPercent: Math.round(progressEntry.progressPercent ?? (completedIds.has(videoId) ? 100 : 0)),
        completed: Boolean(progressEntry.completed || completedIds.has(videoId)),
        lastPositionSeconds: progressEntry.lastPositionSeconds,
        updatedAt:
          progressEntry.updatedAt ??
          (videoId === raw.lastVideoId ? raw.lastVideoAt : undefined),
        replayCount: replayCounts[String(videoId)] ?? 0,
      } satisfies LocalVideoInsight;
    })
    .sort((a, b) => {
      const timeDelta =
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();

      if (timeDelta !== 0) {
        return timeDelta;
      }

      return b.progressPercent - a.progressPercent;
    });

  return {
    courseLabel,
    courseName: raw.name || courseLabel,
    coach: raw.coach ?? "",
    setSystem: raw.setSystem ?? "",
    watchedVideosCount: watchedIds.size,
    completedVideosCount: sumCourseIds(raw.completedVideoIds),
    videoViews: raw.videoViews ?? 0,
    courseViews: raw.courseViews ?? 0,
    replayCount: sumReplayCounts(replayCounts),
    lastActivityAt: getLatestTimestamp([
      raw.lastVideoAt,
      raw.lastExplorerAt,
      raw.lastCourseAt,
      raw.updatedAt,
    ]),
    lastVideoId: raw.lastVideoId,
    lastVideoName: raw.lastVideoName,
    routePath: coursePath,
    videos,
    raw,
  } satisfies LocalCourseInsight;
};

const buildLocalMetricsSnapshot = ({
  users,
  courseStatsEntries,
  valueNodes,
}: {
  users: LocalUserDoc[];
  courseStatsEntries: LocalCourseStatsEntry[];
  valueNodes: Map<string, Map<number, LocalNodeMeta>>;
}): LocalMetricsSnapshot => {
  const userSummaries = users.map((userDoc) => {
    const email = normalizeEmail(userDoc.email);
    const courseStats = courseStatsEntries
      .filter((entry) => entry.userEmail === email)
      .map((entry) =>
        buildCourseInsight({
          courseLabel: entry.courseLabel,
          raw: entry.data,
          valueNodes,
        }),
      )
      .sort(
        (a, b) =>
          new Date(b.lastActivityAt ?? 0).getTime() -
          new Date(a.lastActivityAt ?? 0).getTime(),
      );

    const latestCourse = courseStats[0];
    const latestVideo = latestCourse?.videos[0];
    const roles = Array.isArray(userDoc.roles) ? userDoc.roles : userDoc.role ? [userDoc.role] : [];
    const fullName = [userDoc.firstName, userDoc.lastName].filter(Boolean).join(" ").trim();

    return {
      email,
      name: fullName || email,
      role: userDoc.role ?? roles[0] ?? "viewer",
      roles,
      courses: courseStats,
      totalCourseViews: courseStats.reduce((acc, course) => acc + course.courseViews, 0),
      totalVideoViews: courseStats.reduce((acc, course) => acc + course.videoViews, 0),
      totalWatchedVideos: courseStats.reduce((acc, course) => acc + course.watchedVideosCount, 0),
      totalCompletedVideos: courseStats.reduce(
        (acc, course) => acc + course.completedVideosCount,
        0,
      ),
      totalReplayCount: courseStats.reduce((acc, course) => acc + course.replayCount, 0),
      lastActivityAt: latestCourse?.lastActivityAt,
      latestCourse,
      latestVideo,
      rawUser: userDoc,
    } satisfies LocalUserInsight;
  });

  const courseAggregateMap = new Map<string, GlobalCourseInsight>();
  const videoAggregateMap = new Map<string, GlobalVideoInsight>();

  userSummaries.forEach((userSummary) => {
    userSummary.courses.forEach((course) => {
      const currentCourse = courseAggregateMap.get(course.courseLabel) ?? {
        courseLabel: course.courseLabel,
        courseName: course.courseName,
        coach: course.coach,
        users: new Set<string>(),
        courseViews: 0,
        videoViews: 0,
        replayCount: 0,
        completedVideosCount: 0,
        lastActivityAt: course.lastActivityAt,
      };

      currentCourse.users.add(userSummary.email);
      currentCourse.courseViews += course.courseViews;
      currentCourse.videoViews += course.videoViews;
      currentCourse.replayCount += course.replayCount;
      currentCourse.completedVideosCount += course.completedVideosCount;
      currentCourse.lastActivityAt = getLatestTimestamp([
        currentCourse.lastActivityAt,
        course.lastActivityAt,
      ]);
      courseAggregateMap.set(course.courseLabel, currentCourse);

      course.videos.forEach((video) => {
        const currentVideo = videoAggregateMap.get(video.key) ?? {
          key: video.key,
          courseLabel: video.courseLabel,
          courseName: video.courseName,
          nodeId: video.nodeId,
          nodeName: video.nodeName,
          users: new Set<string>(),
          replayCount: 0,
          completions: 0,
          progressSum: 0,
          progressSamples: 0,
          lastActivityAt: video.updatedAt,
        };

        currentVideo.users.add(userSummary.email);
        currentVideo.replayCount += video.replayCount;
        currentVideo.completions += video.completed ? 1 : 0;
        currentVideo.progressSum += video.progressPercent;
        currentVideo.progressSamples += 1;
        currentVideo.lastActivityAt = getLatestTimestamp([
          currentVideo.lastActivityAt,
          video.updatedAt,
        ]);
        videoAggregateMap.set(video.key, currentVideo);
      });
    });
  });

  const activeUsers = userSummaries.filter((user) => user.courses.length > 0);

  return {
    users: userSummaries.sort(
      (a, b) =>
        new Date(b.lastActivityAt ?? 0).getTime() -
        new Date(a.lastActivityAt ?? 0).getTime(),
    ),
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    totalCourseViews: userSummaries.reduce((acc, user) => acc + user.totalCourseViews, 0),
    totalVideoViews: userSummaries.reduce((acc, user) => acc + user.totalVideoViews, 0),
    totalReplayCount: userSummaries.reduce((acc, user) => acc + user.totalReplayCount, 0),
    totalCompletedVideos: userSummaries.reduce(
      (acc, user) => acc + user.totalCompletedVideos,
      0,
    ),
    courses: [...courseAggregateMap.values()]
      .map((course) => ({
        ...course,
        usersCount: course.users.size,
      }))
      .sort((a, b) => b.videoViews - a.videoViews || b.usersCount - a.usersCount)
      .slice(0, 12),
    videos: [...videoAggregateMap.values()]
      .map((video) => ({
        ...video,
        usersCount: video.users.size,
        averageProgress:
          video.progressSamples > 0
            ? Math.round(video.progressSum / video.progressSamples)
            : 0,
      }))
      .sort((a, b) => b.usersCount - a.usersCount || b.replayCount - a.replayCount)
      .slice(0, 20),
  };
};

const MetricCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 3,
      border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
      background: (theme) =>
        `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(
          theme.palette.surfaceContainerHigh,
          0.94,
        )} 100%)`,
    }}
  >
    <Stack spacing={1}>
      <Box sx={{ color: "primary.main" }}>{icon}</Box>
      <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, fontSize: "1.85rem", lineHeight: 1.05 }}>
        {value}
      </Typography>
    </Stack>
  </Card>
);

export default function LocalMetricsScreen() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user } = useSession();
  const language = i18n.language.startsWith("en") ? "en" : "es";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<LocalMetricsSnapshot | null>(null);

  const canAccess = hasGraphEditorAccess(user);

  const loadMetrics = async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const usersSnapshot = await getDocs(collection(database, USERS_COLLECTION));
      const users = usersSnapshot.docs.map((userDoc) => ({
        email: normalizeEmail(userDoc.id),
        ...(userDoc.data() as Omit<LocalUserDoc, "email">),
      }));

      const courseStatsGroups = await Promise.all(
        users.map(async (userDoc) => {
          try {
            const statsSnapshot = await getDocs(
              collection(
                database,
                USERS_COLLECTION,
                normalizeEmail(userDoc.email),
                USER_COURSE_STATS_COLLECTION,
              ),
            );

            return statsSnapshot.docs.map((courseDoc) => ({
              userEmail: normalizeEmail(userDoc.email),
              courseLabel: courseDoc.id,
              data: courseDoc.data() as UserCourseStatDoc,
            }));
          } catch (courseError) {
            console.error(`No se pudieron cargar los cursos de ${userDoc.email}:`, courseError);
            return [] as LocalCourseStatsEntry[];
          }
        }),
      );

      const courseStatsEntries = courseStatsGroups.flat();
      const uniqueValueNodes = Array.from(
        new Set(
          courseStatsEntries
            .map((entry) => entry.data.valueNodes)
            .filter((value): value is string => typeof value === "string" && value.length > 0),
        ),
      );

      const valueNodes = await buildNodeMapsByPath({
        language,
        valueNodes: uniqueValueNodes,
      });

      const nextSnapshot = buildLocalMetricsSnapshot({
        users,
        courseStatsEntries,
        valueNodes,
      });

      setSnapshot(nextSnapshot);
      setSelectedEmail((currentEmail) =>
        currentEmail && nextSnapshot.users.some((item) => item.email === currentEmail)
          ? currentEmail
          : nextSnapshot.users[0]?.email ?? null,
      );
    } catch (loadError) {
      console.error("No se pudieron cargar las métricas locales:", loadError);
      setError("No se pudieron cargar las métricas desde Firestore.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMetrics();
  }, [canAccess, language]);

  const filteredUsers = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return snapshot.users;
    }

    return snapshot.users.filter((item) =>
      [item.name, item.email, item.role, item.latestCourse?.courseName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, snapshot]);

  useEffect(() => {
    if (!filteredUsers.length) {
      setSelectedEmail(null);
      return;
    }

    if (!selectedEmail || !filteredUsers.some((item) => item.email === selectedEmail)) {
      setSelectedEmail(filteredUsers[0].email);
    }
  }, [filteredUsers, selectedEmail]);

  const selectedUser = filteredUsers.find((item) => item.email === selectedEmail) ?? null;

  if (!canAccess) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
        <AppBarNewHeader />
        <PageContainer maxWidth="md">
          <Card sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Acceso restringido
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 2 }}>
              Esta subapp interna requiere permisos de editor u owner.
            </Typography>
            <Button variant="contained" onClick={() => navigate(routeList.home)}>
              Volver al inicio
            </Button>
          </Card>
        </PageContainer>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
        <AppBarNewHeader />
        <PageContainer maxWidth="md">
          <Card sx={{ p: 4, borderRadius: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Card>
        </PageContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBarNewHeader />
      <PageContainer maxWidth="xl">
        <BreadcrumbsBar
          items={[
            { label: "Inicio", onClick: () => navigate(routeList.home) },
            { label: "Métricas locales" },
          ]}
        />

        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <Card
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 4,
              background:
                "linear-gradient(145deg, rgba(179,138,75,0.14) 0%, rgba(25,31,38,1) 42%, rgba(21,26,32,1) 100%)",
              color: "#F8FAFC",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    size="small"
                    label="Solo editor"
                    sx={{ bgcolor: alpha("#FFFFFF", 0.12), color: "#F8FAFC" }}
                  />
                  <Chip
                    size="small"
                    label={user?.role ?? "editor"}
                    sx={{ bgcolor: alpha("#B38A4B", 0.18), color: "#F8FAFC" }}
                  />
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
                  Panel interno de métricas
                </Typography>
                <Typography sx={{ mt: 1, maxWidth: 760, color: alpha("#E2E8F0", 0.82) }}>
                  Aquí puedes revisar qué usuarios usan la plataforma, cuántos cursos y videos
                  consumen, su última actividad, progresos, completados, repeticiones y los
                  contenidos más vistos.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => void loadMetrics()}
              >
                Refrescar
              </Button>
            </Stack>
          </Card>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <SimpleGrid columns={{ xs: 1, sm: 2, lg: 3, xl: 6 }} gap={1.5}>
            <MetricCard
              label="Usuarios totales"
              value={snapshot?.totalUsers ?? 0}
              icon={<GroupsRoundedIcon />}
            />
            <MetricCard
              label="Usuarios activos"
              value={snapshot?.activeUsers ?? 0}
              icon={<VerifiedRoundedIcon />}
            />
            <MetricCard
              label="Vistas de curso"
              value={snapshot?.totalCourseViews ?? 0}
              icon={<SchoolRoundedIcon />}
            />
            <MetricCard
              label="Vistas de video"
              value={snapshot?.totalVideoViews ?? 0}
              icon={<PlayCircleOutlineRoundedIcon />}
            />
            <MetricCard
              label="Repeticiones"
              value={snapshot?.totalReplayCount ?? 0}
              icon={<ReplayRoundedIcon />}
            />
            <MetricCard
              label="Videos completados"
              value={snapshot?.totalCompletedVideos ?? 0}
              icon={<InsightsRoundedIcon />}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ xs: 1, xl: 2 }} gap={2}>
            <Card sx={{ p: 2, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                Cursos con más actividad
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Curso</TableCell>
                      <TableCell align="right">Usuarios</TableCell>
                      <TableCell align="right">Videos</TableCell>
                      <TableCell align="right">Última actividad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(snapshot?.courses ?? []).map((course) => (
                      <TableRow key={course.courseLabel}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{course.courseName}</Typography>
                          <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                            {course.coach || course.courseLabel}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{course.usersCount}</TableCell>
                        <TableCell align="right">{course.videoViews}</TableCell>
                        <TableCell align="right">
                          {formatDateTime(course.lastActivityAt, language)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            <Card sx={{ p: 2, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                Videos más vistos por usuarios
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Video</TableCell>
                      <TableCell align="right">Usuarios</TableCell>
                      <TableCell align="right">Progreso</TableCell>
                      <TableCell align="right">Repeticiones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(snapshot?.videos ?? []).map((video) => (
                      <TableRow key={video.key}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{video.nodeName}</Typography>
                          <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                            {video.courseName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{video.usersCount}</TableCell>
                        <TableCell align="right">{video.averageProgress}%</TableCell>
                        <TableCell align="right">{video.replayCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={{ xs: 1, xl: 2 }} gap={2}>
            <Card sx={{ p: 2, borderRadius: 4, minHeight: 720 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Usuarios
                </Typography>
                <TextField
                  size="small"
                  label="Buscar usuario o curso"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Stack spacing={1.1} sx={{ maxHeight: 620, overflowY: "auto", pr: 0.3 }}>
                  {filteredUsers.map((item) => {
                    const isSelected = item.email === selectedEmail;

                    return (
                      <Card
                        key={item.email}
                        sx={{
                          borderRadius: 3,
                          border: (theme) =>
                            `1px solid ${alpha(
                              isSelected
                                ? theme.palette.primary.main
                                : theme.palette.outlineVariant,
                              isSelected ? 0.44 : 0.72,
                            )}`,
                          boxShadow: "none",
                        }}
                      >
                        <CardActionArea onClick={() => setSelectedEmail(item.email)}>
                          <Stack spacing={0.9} sx={{ p: 1.5 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 800 }}>
                                  {item.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.8rem",
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  {item.email}
                                </Typography>
                              </Box>
                              <Chip size="small" label={item.role} />
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Chip size="small" variant="outlined" label={`${item.courses.length} cursos`} />
                              <Chip size="small" variant="outlined" label={`${item.totalVideoViews} vistas`} />
                              <Chip size="small" variant="outlined" label={`${item.totalCompletedVideos} completados`} />
                            </Stack>

                            <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                              Última actividad: {formatDateTime(item.lastActivityAt, language)}
                            </Typography>
                          </Stack>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>

            <Card sx={{ p: 2, borderRadius: 4, minHeight: 720 }}>
              {!selectedUser ? (
                <Stack sx={{ height: "100%" }} justifyContent="center" alignItems="center">
                  <Typography sx={{ color: "text.secondary" }}>
                    Selecciona un usuario para ver el detalle.
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Box>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.4}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                          {selectedUser.name}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
                          {selectedUser.email}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedUser.roles.map((role) => (
                          <Chip key={role} label={role} size="small" />
                        ))}
                      </Stack>
                    </Stack>
                  </Box>

                  <SimpleGrid columns={{ xs: 1, sm: 2 }} gap={1.2}>
                    <MetricCard label="Cursos tocados" value={selectedUser.courses.length} icon={<SchoolRoundedIcon />} />
                    <MetricCard label="Videos vistos" value={selectedUser.totalWatchedVideos} icon={<PlayCircleOutlineRoundedIcon />} />
                    <MetricCard label="Videos completados" value={selectedUser.totalCompletedVideos} icon={<VerifiedRoundedIcon />} />
                    <MetricCard label="Repeticiones" value={selectedUser.totalReplayCount} icon={<ReplayRoundedIcon />} />
                  </SimpleGrid>

                  <Card sx={{ p: 1.5, borderRadius: 3, boxShadow: "none", border: (theme) => `1px solid ${alpha(theme.palette.outlineVariant, 0.7)}` }}>
                    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Última actividad</Typography>
                    <Typography sx={{ color: "text.secondary", mb: 0.6 }}>
                      {formatDateTime(selectedUser.lastActivityAt, language)}
                    </Typography>
                    {selectedUser.latestCourse ? (
                      <Stack spacing={0.3}>
                        <Typography sx={{ fontWeight: 700 }}>
                          Curso: {selectedUser.latestCourse.courseName}
                        </Typography>
                        {selectedUser.latestVideo ? (
                          <Typography sx={{ color: "text.secondary" }}>
                            Video: {selectedUser.latestVideo.nodeName}
                          </Typography>
                        ) : null}
                        {selectedUser.latestCourse.routePath ? (
                          <Button
                            sx={{ alignSelf: "flex-start", mt: 0.8 }}
                            size="small"
                            startIcon={<OpenInNewRoundedIcon />}
                            onClick={() =>
                              navigate(
                                routeList.courseDetailScreen.replace(
                                  ":systemName",
                                  selectedUser.latestCourse!.routePath!,
                                ),
                              )
                            }
                          >
                            Abrir curso
                          </Button>
                        ) : null}
                      </Stack>
                    ) : null}
                  </Card>

                  <Card sx={{ p: 1.5, borderRadius: 3, boxShadow: "none", border: (theme) => `1px solid ${alpha(theme.palette.outlineVariant, 0.7)}` }}>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>Cursos del usuario</Typography>
                    <TableContainer sx={{ maxHeight: 260 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Curso</TableCell>
                            <TableCell align="right">Vistos</TableCell>
                            <TableCell align="right">Completados</TableCell>
                            <TableCell align="right">Último video</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedUser.courses.map((course) => (
                            <TableRow key={`${selectedUser.email}:${course.courseLabel}`}>
                              <TableCell>
                                <Typography sx={{ fontWeight: 700 }}>{course.courseName}</Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                                  {course.coach || course.courseLabel}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{course.watchedVideosCount}</TableCell>
                              <TableCell align="right">{course.completedVideosCount}</TableCell>
                              <TableCell align="right">
                                <Typography sx={{ fontSize: "0.8rem" }}>
                                  {course.lastVideoName ?? "Sin dato"}
                                </Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                                  {formatDateTime(course.lastActivityAt, language)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>

                  <Card sx={{ p: 1.5, borderRadius: 3, boxShadow: "none", border: (theme) => `1px solid ${alpha(theme.palette.outlineVariant, 0.7)}` }}>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>Videos del usuario</Typography>
                    <Stack spacing={1} sx={{ maxHeight: 320, overflowY: "auto", pr: 0.25 }}>
                      {selectedUser.courses.flatMap((course) => course.videos).slice(0, 40).map((video) => (
                        <Box
                          key={`${selectedUser.email}:${video.key}`}
                          sx={{
                            p: 1.15,
                            borderRadius: 2.5,
                            border: (theme) => `1px solid ${alpha(theme.palette.outlineVariant, 0.72)}`,
                            backgroundColor: "background.paper",
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700 }}>
                                {video.nodeName}
                              </Typography>
                              <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                                {video.courseName}
                                {video.group ? ` · ${capitalizeFirstLetter(video.group)}` : ""}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.75} flexWrap="wrap">
                              <Chip size="small" variant="outlined" label={`${video.progressPercent}%`} />
                              <Chip size="small" variant="outlined" label={video.completed ? "Completado" : "En progreso"} />
                              {video.replayCount > 0 ? (
                                <Chip size="small" variant="outlined" label={`${video.replayCount} reps`} />
                              ) : null}
                            </Stack>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0, video.progressPercent))}
                            sx={{ mt: 1, height: 7, borderRadius: 999 }}
                          />

                          <Typography sx={{ mt: 0.8, color: "text.secondary", fontSize: "0.75rem" }}>
                            Última actualización: {formatDateTime(video.updatedAt, language)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Card>

                  <Card sx={{ p: 1.5, borderRadius: 3, boxShadow: "none", border: (theme) => `1px solid ${alpha(theme.palette.outlineVariant, 0.7)}` }}>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>Datos brutos</Typography>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 1.2,
                        borderRadius: 2,
                        overflowX: "auto",
                        bgcolor: alpha("#020617", 0.84),
                        color: "#E2E8F0",
                        fontSize: "0.74rem",
                        lineHeight: 1.45,
                      }}
                    >
                      {JSON.stringify(
                        {
                          user: selectedUser.rawUser,
                          courses: selectedUser.courses.map((course) => course.raw),
                        },
                        null,
                        2,
                      )}
                    </Box>
                  </Card>
                </Stack>
              )}
            </Card>
          </SimpleGrid>
        </Stack>
      </PageContainer>
    </Box>
  );
}
