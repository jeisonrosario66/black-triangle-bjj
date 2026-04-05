import type { NodeOptionFirestore, SystemCardUI } from "../context";
import {
  buildSystemsUIShared,
  getSystemshared,
} from "./firebaseServiceShared";

const USERS_COLLECTION = "users";
const USER_COURSE_STATS_COLLECTION = "course_stats";
const COURSE_METRICS_COLLECTION = "course_metrics";
const VIDEO_VIEW_THROTTLE_MS = 45_000;

type FirestoreCollectionReadApi = {
  collection: any;
  database: any;
  getDocs: any;
};

type FirestoreTrackCourseApi = {
  database: any;
  doc: any;
  increment: any;
  setDoc: any;
};

type FirestoreTrackVideoApi = FirestoreTrackCourseApi & {
  arrayUnion: any;
};

type CourseSnapshot = Pick<
  SystemCardUI,
  | "coach"
  | "coverUrl"
  | "description"
  | "label"
  | "name"
  | "setSystem"
  | "valueLinks"
  | "valueNodes"
  | "videoCount"
>;

export type UserCourseStatDoc = CourseSnapshot & {
  courseViews?: number;
  lastCourseAt?: string;
  lastExplorerAt?: string;
  lastVideoAt?: string;
  lastVideoId?: number;
  lastVideoName?: string;
  updatedAt?: string;
  videoViews?: number;
  watchedVideoIds?: number[];
};

export type CourseMetricDoc = CourseSnapshot & {
  courseViews?: number;
  lastActivityAt?: string;
  updatedAt?: string;
  videoViews?: number;
};

export type HomeRecommendedSystemReason = "coach" | "popular" | "recent" | "set";
export type HomeRecommendedRouteReason = "coach" | "popular" | "set";

export type HomeContinueCourse = SystemCardUI & {
  lastVideoId?: number;
  lastVideoName?: string;
  progressPercentage: number;
  watchedVideosCount: number;
};

export type HomeRecommendedSystem = SystemCardUI & {
  popularityScore: number;
  reasonType: HomeRecommendedSystemReason;
  relevanceScore: number;
};

export type HomeRecommendedRoute = {
  courses: HomeRecommendedSystem[];
  courseCount: number;
  focusCourse: HomeRecommendedSystem;
  id: string;
  reasonType: HomeRecommendedRouteReason;
  topic: string;
  totalVideos: number;
};

export type HomePersonalization = {
  hasPersonalization: boolean;
  lastCourse: HomeContinueCourse | null;
  recommendedRoutes: HomeRecommendedRoute[];
  recommendedSystems: HomeRecommendedSystem[];
};

type UserCourseStatsMap = Map<string, UserCourseStatDoc>;
type CourseMetricsMap = Map<string, CourseMetricDoc>;

const homeCache = new Map<string, Promise<HomePersonalization>>();
const homeSnapshotCache = new Map<string, HomePersonalization>();
const userCourseStatsCache = new Map<string, Promise<UserCourseStatsMap>>();
const userCourseStatsSnapshotCache = new Map<string, UserCourseStatsMap>();
const courseMetricsCache = new Map<string, Promise<CourseMetricsMap>>();
const courseMetricsSnapshotCache = new Map<string, CourseMetricsMap>();
const optimisticUserCourseStatsCache = new Map<string, UserCourseStatsMap>();
const optimisticCourseMetricsCache = new Map<string, CourseMetricsMap>();
const videoViewSessionCache = new Map<string, number>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getHomeCacheKey = (email: string, language: string) =>
  `home:${language}:${normalizeEmail(email)}`;

const getUserCourseStatsCacheKey = (email: string) =>
  `user-course-stats:${normalizeEmail(email)}`;

const getCourseMetricsCacheKey = () => "course-metrics";

const buildVideoViewKey = (email: string, courseLabel: string, nodeId: number) =>
  `${normalizeEmail(email)}:${courseLabel}:${nodeId}`;

const toDateString = () => new Date().toISOString();

const toCourseSnapshot = (system: SystemCardUI): CourseSnapshot => ({
  coach: system.coach,
  coverUrl: system.coverUrl,
  description: system.description,
  label: system.label,
  name: system.name,
  setSystem: system.setSystem,
  valueLinks: system.valueLinks,
  valueNodes: system.valueNodes,
  videoCount: system.videoCount,
});

const mergeCourseStatDoc = (
  current: UserCourseStatDoc | undefined,
  next: UserCourseStatDoc | undefined,
): UserCourseStatDoc | undefined => {
  if (!current && !next) {
    return undefined;
  }

  return {
    ...(current ?? {}),
    ...(next ?? {}),
    watchedVideoIds: next?.watchedVideoIds ?? current?.watchedVideoIds ?? [],
  } as UserCourseStatDoc;
};

const mergeCourseMetricDoc = (
  current: CourseMetricDoc | undefined,
  next: CourseMetricDoc | undefined,
): CourseMetricDoc | undefined => {
  if (!current && !next) {
    return undefined;
  }

  return {
    ...(current ?? {}),
    ...(next ?? {}),
  } as CourseMetricDoc;
};

const mergeStatsMaps = (
  baseMap: UserCourseStatsMap | undefined,
  optimisticMap: UserCourseStatsMap | undefined,
) => {
  if (!optimisticMap?.size) {
    return baseMap ?? new Map<string, UserCourseStatDoc>();
  }

  const nextMap = new Map(baseMap ?? []);

  optimisticMap.forEach((value, key) => {
    const mergedValue = mergeCourseStatDoc(nextMap.get(key), value);

    if (mergedValue) {
      nextMap.set(key, mergedValue);
    }
  });

  return nextMap;
};

const mergeMetricsMaps = (
  baseMap: CourseMetricsMap | undefined,
  optimisticMap: CourseMetricsMap | undefined,
) => {
  if (!optimisticMap?.size) {
    return baseMap ?? new Map<string, CourseMetricDoc>();
  }

  const nextMap = new Map(baseMap ?? []);

  optimisticMap.forEach((value, key) => {
    const mergedValue = mergeCourseMetricDoc(nextMap.get(key), value);

    if (mergedValue) {
      nextMap.set(key, mergedValue);
    }
  });

  return nextMap;
};

const toUniqueVideoIds = (
  watchedVideoIds: number[] | undefined,
  nextVideoId?: number,
) => {
  const values = new Set(watchedVideoIds ?? []);

  if (typeof nextVideoId === "number") {
    values.add(nextVideoId);
  }

  return Array.from(values).sort((a, b) => a - b);
};

const buildSystemRoute = (system: SystemCardUI) =>
  `${system.label}-${system.coach.replace(/ /g, "_")}`;

const getOptimisticUserCourseStats = (email: string) =>
  optimisticUserCourseStatsCache.get(getUserCourseStatsCacheKey(email));

const getOptimisticCourseMetrics = () =>
  optimisticCourseMetricsCache.get(getCourseMetricsCacheKey());

const getCachedCourseMetric = (courseLabel: string) =>
  mergeCourseMetricDoc(
    courseMetricsSnapshotCache
      .get(getCourseMetricsCacheKey())
      ?.get(courseLabel),
    getOptimisticCourseMetrics()?.get(courseLabel),
  );

const hasUserCourseStatsCache = (email: string) =>
  userCourseStatsSnapshotCache.has(getUserCourseStatsCacheKey(email));

const hasCourseMetricsCache = () =>
  courseMetricsSnapshotCache.has(getCourseMetricsCacheKey());

const setCachedUserCourseStat = (
  email: string,
  courseLabel: string,
  updater: (current: UserCourseStatDoc | undefined) => UserCourseStatDoc,
) => {
  const cacheKey = getUserCourseStatsCacheKey(email);
  const nextMap = new Map(userCourseStatsSnapshotCache.get(cacheKey) ?? []);
  nextMap.set(courseLabel, updater(nextMap.get(courseLabel)));
  userCourseStatsCache.delete(cacheKey);
  userCourseStatsSnapshotCache.set(cacheKey, nextMap);
};

const setOptimisticUserCourseStat = (
  email: string,
  courseLabel: string,
  updater: (current: UserCourseStatDoc | undefined) => UserCourseStatDoc,
) => {
  const cacheKey = getUserCourseStatsCacheKey(email);
  const nextMap = new Map(getOptimisticUserCourseStats(email) ?? []);
  nextMap.set(courseLabel, updater(nextMap.get(courseLabel)));
  optimisticUserCourseStatsCache.set(cacheKey, nextMap);
};

const clearOptimisticUserCourseStat = (email: string, courseLabel: string) => {
  const cacheKey = getUserCourseStatsCacheKey(email);
  const nextMap = new Map(getOptimisticUserCourseStats(email) ?? []);

  nextMap.delete(courseLabel);

  if (nextMap.size === 0) {
    optimisticUserCourseStatsCache.delete(cacheKey);
    return;
  }

  optimisticUserCourseStatsCache.set(cacheKey, nextMap);
};

const setCachedCourseMetric = (
  courseLabel: string,
  updater: (current: CourseMetricDoc | undefined) => CourseMetricDoc,
) => {
  const cacheKey = getCourseMetricsCacheKey();
  const nextMap = new Map(courseMetricsSnapshotCache.get(cacheKey) ?? []);
  nextMap.set(courseLabel, updater(nextMap.get(courseLabel)));
  courseMetricsCache.delete(cacheKey);
  courseMetricsSnapshotCache.set(cacheKey, nextMap);
};

const setOptimisticCourseMetric = (
  courseLabel: string,
  updater: (current: CourseMetricDoc | undefined) => CourseMetricDoc,
) => {
  const cacheKey = getCourseMetricsCacheKey();
  const nextMap = new Map(getOptimisticCourseMetrics() ?? []);
  nextMap.set(courseLabel, updater(nextMap.get(courseLabel)));
  optimisticCourseMetricsCache.set(cacheKey, nextMap);
};

const clearOptimisticCourseMetric = (courseLabel: string) => {
  const cacheKey = getCourseMetricsCacheKey();
  const nextMap = new Map(getOptimisticCourseMetrics() ?? []);

  nextMap.delete(courseLabel);

  if (nextMap.size === 0) {
    optimisticCourseMetricsCache.delete(cacheKey);
    return;
  }

  optimisticCourseMetricsCache.set(cacheKey, nextMap);
};

const shouldTrackVideoView = (
  email: string,
  courseLabel: string,
  nodeId: number,
) => {
  const key = buildVideoViewKey(email, courseLabel, nodeId);
  const now = Date.now();
  const lastTrackedAt = videoViewSessionCache.get(key) ?? 0;

  if (now - lastTrackedAt < VIDEO_VIEW_THROTTLE_MS) {
    return false;
  }

  videoViewSessionCache.set(key, now);
  return true;
};

const clearTrackedVideoViewLock = (
  email: string,
  courseLabel: string,
  nodeId: number,
) => {
  videoViewSessionCache.delete(buildVideoViewKey(email, courseLabel, nodeId));
};

const buildRouteFromSet = (
  systems: HomeRecommendedSystem[],
  setName: string,
) => {
  const matchingCourses = systems
    .filter((system) => system.setSystem === setName)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);

  if (matchingCourses.length === 0) {
    return null;
  }

  return {
    courses: matchingCourses,
    courseCount: matchingCourses.length,
    focusCourse: matchingCourses[0],
    id: `set:${setName}`,
    reasonType: "set" as const,
    topic: setName,
    totalVideos: matchingCourses.reduce(
      (acc, course) => acc + (course.videoCount ?? 0),
      0,
    ),
  };
};

const buildRouteFromCoach = (
  systems: HomeRecommendedSystem[],
  coachName: string,
) => {
  const matchingCourses = systems
    .filter((system) => system.coach === coachName)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);

  if (matchingCourses.length === 0) {
    return null;
  }

  return {
    courses: matchingCourses,
    courseCount: matchingCourses.length,
    focusCourse: matchingCourses[0],
    id: `coach:${coachName}`,
    reasonType: "coach" as const,
    topic: coachName,
    totalVideos: matchingCourses.reduce(
      (acc, course) => acc + (course.videoCount ?? 0),
      0,
    ),
  };
};

const buildPopularRoute = (systems: HomeRecommendedSystem[]) => {
  const matchingCourses = [...systems]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 3);

  if (matchingCourses.length === 0) {
    return null;
  }

  return {
    courses: matchingCourses,
    courseCount: matchingCourses.length,
    focusCourse: matchingCourses[0],
    id: "popular",
    reasonType: "popular" as const,
    topic: matchingCourses[0].setSystem,
    totalVideos: matchingCourses.reduce(
      (acc, course) => acc + (course.videoCount ?? 0),
      0,
    ),
  };
};

export const getCachedHomePersonalizationShared = (
  email: string,
  language = "es",
) => homeSnapshotCache.get(getHomeCacheKey(email, language)) ?? null;

export const invalidateHomePersonalizationShared = (email: string) => {
  const normalizedEmail = normalizeEmail(email);

  Array.from(homeCache.keys()).forEach((key) => {
    if (key.endsWith(`:${normalizedEmail}`)) {
      homeCache.delete(key);
    }
  });

  Array.from(homeSnapshotCache.keys()).forEach((key) => {
    if (key.endsWith(`:${normalizedEmail}`)) {
      homeSnapshotCache.delete(key);
    }
  });
};

export const getCachedUserCourseStatsShared = (email: string) =>
  {
    const mergedStats = mergeStatsMaps(
      userCourseStatsSnapshotCache.get(getUserCourseStatsCacheKey(email)),
      getOptimisticUserCourseStats(email),
    );

    return mergedStats.size > 0 ||
      hasUserCourseStatsCache(email) ||
      Boolean(getOptimisticUserCourseStats(email)?.size)
      ? mergedStats
      : null;
  };

export const getUserCourseStatsShared = async ({
  email,
  firestore,
}: {
  email: string;
  firestore: FirestoreCollectionReadApi;
}) => {
  const normalizedEmail = normalizeEmail(email);
  const cacheKey = getUserCourseStatsCacheKey(normalizedEmail);
  const cachedSnapshot = mergeStatsMaps(
    userCourseStatsSnapshotCache.get(cacheKey),
    getOptimisticUserCourseStats(normalizedEmail),
  );

  if (
    cachedSnapshot.size > 0 ||
    hasUserCourseStatsCache(normalizedEmail) ||
    Boolean(getOptimisticUserCourseStats(normalizedEmail)?.size)
  ) {
    return cachedSnapshot;
  }

  const cachedRequest = userCourseStatsCache.get(cacheKey);

  if (cachedRequest) {
    return cachedRequest.then((data) =>
      mergeStatsMaps(data, getOptimisticUserCourseStats(normalizedEmail)),
    );
  }

  const request = (async () => {
    const { collection, database, getDocs } = firestore;

    try {
      const courseStatsSnapshot = await getDocs(
        collection(
          database,
          USERS_COLLECTION,
          normalizedEmail,
          USER_COURSE_STATS_COLLECTION,
        ),
      );

      return new Map<string, UserCourseStatDoc>(
        courseStatsSnapshot.docs.map((courseDoc: any) => [
          courseDoc.id,
          courseDoc.data() as UserCourseStatDoc,
        ]),
      );
    } catch (error) {
      userCourseStatsCache.delete(cacheKey);
      console.error("No se pudieron cargar las métricas del usuario:", error);
      return new Map<string, UserCourseStatDoc>();
    }
  })();

  request.then((data) => {
    userCourseStatsSnapshotCache.set(
      cacheKey,
      mergeStatsMaps(data, getOptimisticUserCourseStats(normalizedEmail)),
    );
  });
  userCourseStatsCache.set(cacheKey, request);

  return request.then((data) =>
    mergeStatsMaps(data, getOptimisticUserCourseStats(normalizedEmail)),
  );
};

export const getCachedCourseStatShared = (
  email: string,
  courseLabel: string,
) => getCachedUserCourseStatsShared(email)?.get(courseLabel) ?? null;

export const getCourseStatShared = async ({
  email,
  courseLabel,
  firestore,
}: {
  email: string;
  courseLabel: string;
  firestore: FirestoreCollectionReadApi;
}) => {
  const statsMap = await getUserCourseStatsShared({ email, firestore });
  return statsMap.get(courseLabel) ?? null;
};

const getCourseMetricsShared = async ({
  firestore,
}: {
  firestore: FirestoreCollectionReadApi;
}) => {
  const cacheKey = getCourseMetricsCacheKey();
  const cachedSnapshot = mergeMetricsMaps(
    courseMetricsSnapshotCache.get(cacheKey),
    getOptimisticCourseMetrics(),
  );

  if (
    cachedSnapshot.size > 0 ||
    hasCourseMetricsCache() ||
    Boolean(getOptimisticCourseMetrics()?.size)
  ) {
    return cachedSnapshot;
  }

  const cachedRequest = courseMetricsCache.get(cacheKey);

  if (cachedRequest) {
    return cachedRequest.then((data) =>
      mergeMetricsMaps(data, getOptimisticCourseMetrics()),
    );
  }

  const request = (async () => {
    const { collection, database, getDocs } = firestore;

    try {
      const metricsSnapshot = await getDocs(collection(database, COURSE_METRICS_COLLECTION));
      return new Map<string, CourseMetricDoc>(
        metricsSnapshot.docs.map((metricDoc: any) => [
          metricDoc.id,
          metricDoc.data() as CourseMetricDoc,
        ]),
      );
    } catch (error) {
      courseMetricsCache.delete(cacheKey);
      console.error("No se pudieron cargar las métricas globales:", error);
      return new Map<string, CourseMetricDoc>();
    }
  })();

  request.then((data) => {
    courseMetricsSnapshotCache.set(
      cacheKey,
      mergeMetricsMaps(data, getOptimisticCourseMetrics()),
    );
  });
  courseMetricsCache.set(cacheKey, request);

  return request.then((data) =>
    mergeMetricsMaps(data, getOptimisticCourseMetrics()),
  );
};

export const trackCourseSelectionShared = async ({
  email,
  firestore,
  source,
  system,
}: {
  email: string;
  firestore: FirestoreTrackCourseApi;
  source: "explorer" | "home";
  system: SystemCardUI;
}) => {
  if (!email || !system?.label) {
    return false;
  }

  const normalizedEmail = normalizeEmail(email);
  const { database, doc, increment, setDoc } = firestore;
  const timestamp = toDateString();
  const snapshot = toCourseSnapshot(system);
  const cachedStat =
    getCachedCourseStatShared(normalizedEmail, system.label) ?? undefined;
  const userStatRef = doc(
    database,
    USERS_COLLECTION,
    normalizedEmail,
    USER_COURSE_STATS_COLLECTION,
    system.label,
  );

  setOptimisticUserCourseStat(normalizedEmail, system.label, (current) => {
    const mergedStat = mergeCourseStatDoc(cachedStat, current);

    return {
      ...(mergedStat ?? {}),
      ...snapshot,
      courseViews: (mergedStat?.courseViews ?? 0) + 1,
      lastCourseAt: timestamp,
      ...(source === "explorer" ? { lastExplorerAt: timestamp } : {}),
      updatedAt: timestamp,
      watchedVideoIds: mergedStat?.watchedVideoIds ?? [],
    };
  });

  invalidateHomePersonalizationShared(normalizedEmail);

  try {
    await setDoc(
      userStatRef,
      {
        ...snapshot,
        courseViews: increment(1),
        lastCourseAt: timestamp,
        ...(source === "explorer" ? { lastExplorerAt: timestamp } : {}),
        updatedAt: timestamp,
      },
      { merge: true },
    );

    setCachedUserCourseStat(normalizedEmail, system.label, (current) => ({
      ...mergeCourseStatDoc(
        current,
        getOptimisticUserCourseStats(normalizedEmail)?.get(system.label),
      ),
      ...snapshot,
    }));

    clearOptimisticUserCourseStat(normalizedEmail, system.label);
    return true;
  } catch (error) {
    clearOptimisticUserCourseStat(normalizedEmail, system.label);
    invalidateHomePersonalizationShared(normalizedEmail);
    console.error("No se pudo registrar la selección del curso:", error);
    return false;
  }
};

export const trackVideoOpenedShared = async ({
  email,
  firestore,
  module,
  system,
}: {
  email: string;
  firestore: FirestoreTrackVideoApi;
  module: NodeOptionFirestore;
  system: SystemCardUI;
}) => {
  if (!email || !module?.id || !system?.label) {
    return false;
  }

  const normalizedEmail = normalizeEmail(email);

  if (!shouldTrackVideoView(normalizedEmail, system.label, module.id)) {
    return false;
  }

  const { arrayUnion, database, doc, increment, setDoc } = firestore;
  const timestamp = toDateString();
  const snapshot = toCourseSnapshot(system);
  const userStatRef = doc(
    database,
    USERS_COLLECTION,
    normalizedEmail,
    USER_COURSE_STATS_COLLECTION,
    system.label,
  );
  const courseMetricRef = doc(database, COURSE_METRICS_COLLECTION, system.label);
  const cachedStat =
    getCachedCourseStatShared(normalizedEmail, system.label) ?? undefined;
  const cachedMetric = getCachedCourseMetric(system.label);

  setOptimisticUserCourseStat(normalizedEmail, system.label, (current) => {
    const mergedStat = mergeCourseStatDoc(cachedStat, current);

    return {
      ...(mergedStat ?? {}),
      ...snapshot,
      lastVideoAt: timestamp,
      lastVideoId: module.id,
      lastVideoName: module.name,
      updatedAt: timestamp,
      videoViews: (mergedStat?.videoViews ?? 0) + 1,
      watchedVideoIds: toUniqueVideoIds(mergedStat?.watchedVideoIds, module.id),
    };
  });

  setOptimisticCourseMetric(system.label, (current) => {
    const mergedMetric = mergeCourseMetricDoc(cachedMetric, current);

    return {
      ...(mergedMetric ?? {}),
      ...snapshot,
      lastActivityAt: timestamp,
      updatedAt: timestamp,
      courseViews: (mergedMetric?.courseViews ?? 0) + 1,
      videoViews: (mergedMetric?.videoViews ?? 0) + 1,
    };
  });

  invalidateHomePersonalizationShared(normalizedEmail);
  const trackingWrites = [
    setDoc(
      userStatRef,
      {
        ...snapshot,
        lastVideoAt: timestamp,
        lastVideoId: module.id,
        lastVideoName: module.name,
        updatedAt: timestamp,
        videoViews: increment(1),
        watchedVideoIds: arrayUnion(module.id),
      },
      { merge: true },
    ),
    setDoc(
      courseMetricRef,
      {
        ...snapshot,
        lastActivityAt: timestamp,
        updatedAt: timestamp,
        courseViews: increment(1),
        videoViews: increment(1),
      },
      { merge: true },
    ),
  ];

  if (module.docId) {
    const nodeMetricRef = doc(database, system.valueNodes, module.docId);
    trackingWrites.push(
      setDoc(
        nodeMetricRef,
        {
          viewsCount: increment(1),
        },
        { merge: true },
      ),
    );
  }

  try {
    await Promise.all(trackingWrites);

    setCachedUserCourseStat(normalizedEmail, system.label, (current) => ({
      ...mergeCourseStatDoc(
        current,
        getOptimisticUserCourseStats(normalizedEmail)?.get(system.label),
      ),
      ...snapshot,
    }));

    setCachedCourseMetric(system.label, (current) => ({
      ...mergeCourseMetricDoc(current, getOptimisticCourseMetrics()?.get(system.label)),
      ...snapshot,
    }));

    clearOptimisticUserCourseStat(normalizedEmail, system.label);
    clearOptimisticCourseMetric(system.label);
    return Boolean(module.docId);
  } catch (error) {
    clearOptimisticUserCourseStat(normalizedEmail, system.label);
    clearOptimisticCourseMetric(system.label);
    clearTrackedVideoViewLock(normalizedEmail, system.label, module.id);
    invalidateHomePersonalizationShared(normalizedEmail);
    console.error("No se pudo registrar la reproducción del video:", error);
    return false;
  }
};

export const getPersonalizedHomeShared = async ({
  email,
  firestore,
  language = "es",
}: {
  email: string;
  firestore: FirestoreCollectionReadApi;
  language?: string;
}) => {
  const cacheKey = getHomeCacheKey(email, language);
  const cachedRequest = homeCache.get(cacheKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = (async () => {
    const { collection, database, getDocs } = firestore;

    try {
      const [systemsData, statsMap, metricsMap] = await Promise.all([
        getSystemshared(getDocs, collection, database, language),
        getUserCourseStatsShared({ email, firestore }),
        getCourseMetricsShared({ firestore }),
      ]);

      const { systems } = buildSystemsUIShared(systemsData);
      const systemsByLabel = new Map(systems.map((system) => [system.label, system]));
      const setScores = new Map<string, number>();
      const coachScores = new Map<string, number>();

      statsMap.forEach((stat) => {
        const weight =
          (stat.courseViews ?? 0) * 4 +
          (stat.videoViews ?? 0) * 6 +
          (stat.watchedVideoIds?.length ?? 0) * 8;

        if (stat.setSystem) {
          setScores.set(stat.setSystem, (setScores.get(stat.setSystem) ?? 0) + weight);
        }

        if (stat.coach) {
          coachScores.set(stat.coach, (coachScores.get(stat.coach) ?? 0) + weight);
        }
      });

      const lastExplorerStatEntry = [...statsMap.entries()]
        .sort(
          (a, b) =>
            new Date(b[1].lastExplorerAt ?? 0).getTime() -
            new Date(a[1].lastExplorerAt ?? 0).getTime(),
        )
        .find(([, stat]) => Boolean(stat.lastExplorerAt));

      const lastCourseLabel = lastExplorerStatEntry?.[0];
      const lastCourseBase = lastCourseLabel
        ? systemsByLabel.get(lastCourseLabel) ??
          ({
            ...lastExplorerStatEntry?.[1],
            setSystem: lastExplorerStatEntry?.[1].setSystem ?? "",
          } as SystemCardUI | undefined)
        : null;

      const lastCourseStat = lastCourseLabel
        ? statsMap.get(lastCourseLabel)
        : null;
      const watchedVideosCount = lastCourseStat?.watchedVideoIds?.length ?? 0;
      const totalVideos = lastCourseBase?.videoCount ?? 0;
      const progressPercentage = totalVideos
        ? Math.min(100, Math.round((watchedVideosCount / totalVideos) * 100))
        : 0;

      const lastCourse = lastCourseBase
        ? {
            ...lastCourseBase,
            lastVideoId: lastCourseStat?.lastVideoId,
            lastVideoName: lastCourseStat?.lastVideoName,
            progressPercentage,
            watchedVideosCount,
          }
        : null;

      const recommendedSystems = systems
        .map((system) => {
          const stat = statsMap.get(system.label);
          const metric = metricsMap.get(system.label);
          const setAffinity = setScores.get(system.setSystem) ?? 0;
          const coachAffinity = coachScores.get(system.coach) ?? 0;
          const popularityScore =
            (metric?.courseViews ?? 0) * 2 +
            (metric?.videoViews ?? 0) * 3 +
            (system.videoCount ?? 0) * 0.25;
          const recentBoost = lastCourse?.label === system.label ? 14 : 0;
          const relevanceScore =
            setAffinity * 1.2 +
            coachAffinity +
            popularityScore +
            recentBoost +
            (stat?.videoViews ?? 0);

          let reasonType: HomeRecommendedSystemReason = "popular";

          if (recentBoost > 0) {
            reasonType = "recent";
          } else if (setAffinity >= coachAffinity && setAffinity > 0) {
            reasonType = "set";
          } else if (coachAffinity > 0) {
            reasonType = "coach";
          }

          return {
            ...system,
            popularityScore,
            reasonType,
            relevanceScore,
          };
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore || a.name.localeCompare(b.name));

      const filteredSystemRecommendations = recommendedSystems
        .filter((system) => system.label !== lastCourse?.label)
        .slice(0, 3);

      const topSets = [...setScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([setName]) => setName);
      const topCoaches = [...coachScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([coachName]) => coachName);

      const candidateRoutes = [
        ...(topSets.slice(0, 2).map((setName) => buildRouteFromSet(recommendedSystems, setName))),
        ...(topCoaches.slice(0, 2).map((coachName) =>
          buildRouteFromCoach(recommendedSystems, coachName),
        )),
        buildPopularRoute(recommendedSystems),
      ].filter(Boolean) as HomeRecommendedRoute[];

      const seenRoutes = new Set<string>();
      const recommendedRoutes = candidateRoutes
        .filter((route) => {
          if (seenRoutes.has(route.id)) {
            return false;
          }

          seenRoutes.add(route.id);
          return true;
        })
        .slice(0, 2);

      return {
        hasPersonalization: Boolean(lastCourse || statsMap.size > 0),
        lastCourse,
        recommendedRoutes,
        recommendedSystems: filteredSystemRecommendations,
      };
    } catch (error) {
      homeCache.delete(cacheKey);
      console.error("Error construyendo el home personalizado:", error);
      return {
        hasPersonalization: false,
        lastCourse: null,
        recommendedRoutes: [],
        recommendedSystems: [],
      };
    }
  })();

  request.then((data) => {
    homeSnapshotCache.set(cacheKey, data);
  });
  homeCache.set(cacheKey, request);

  return request;
};

export const buildCourseLocationStateShared = (
  system: SystemCardUI,
  entryPoint: "explorer" | "home" = "explorer",
) => ({
  entryPoint,
  system,
  urlLocal: buildSystemRoute(system),
});
