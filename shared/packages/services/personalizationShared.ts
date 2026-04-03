import type { NodeOptionFirestore, SystemCardUI } from "../context";
import {
  buildSystemsUIShared,
  getSystemshared,
} from "./firebaseServiceShared";

const USERS_COLLECTION = "users";
const USER_COURSE_STATS_COLLECTION = "course_stats";
const COURSE_METRICS_COLLECTION = "course_metrics";

type FirestoreReadApi = {
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

type UserCourseStatDoc = CourseSnapshot & {
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

type CourseMetricDoc = CourseSnapshot & {
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
  courseCount: number;
  focusCourse: SystemCardUI;
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

const homeCache = new Map<string, Promise<HomePersonalization>>();
const homeSnapshotCache = new Map<string, HomePersonalization>();

const getHomeCacheKey = (email: string, language: string) =>
  `home:${language}:${email.trim().toLowerCase()}`;

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

const buildSystemRoute = (system: SystemCardUI) =>
  `${system.label}-${system.coach.replace(/ /g, "_")}`;

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
  const normalizedEmail = email.trim().toLowerCase();

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
    return;
  }

  const { database, doc, increment, setDoc } = firestore;
  const timestamp = toDateString();
  const snapshot = toCourseSnapshot(system);
  const userStatRef = doc(
    database,
    USERS_COLLECTION,
    email,
    USER_COURSE_STATS_COLLECTION,
    system.label,
  );
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

    invalidateHomePersonalizationShared(email);
  } catch (error) {
    console.error("No se pudo registrar la selección del curso:", error);
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
    return;
  }

  const { arrayUnion, database, doc, increment, setDoc } = firestore;
  const timestamp = toDateString();
  const snapshot = toCourseSnapshot(system);
  const userStatRef = doc(
    database,
    USERS_COLLECTION,
    email,
    USER_COURSE_STATS_COLLECTION,
    system.label,
  );
  const metricRef = doc(database, COURSE_METRICS_COLLECTION, system.label);

  try {
    await Promise.all([
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
        metricRef,
        {
          ...snapshot,
          lastActivityAt: timestamp,
          updatedAt: timestamp,
          courseViews: increment(1),
          videoViews: increment(1),
        },
        { merge: true },
      ),
    ]);

    invalidateHomePersonalizationShared(email);
  } catch (error) {
    console.error("No se pudo registrar la reproducción del video:", error);
  }
};

export const getPersonalizedHomeShared = async ({
  email,
  firestore,
  language = "es",
}: {
  email: string;
  firestore: FirestoreReadApi;
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
      const [systemsData, courseStatsSnapshot, metricsSnapshot] =
        await Promise.all([
          getSystemshared(getDocs, collection, database, language),
          getDocs(
            collection(
              database,
              USERS_COLLECTION,
              email,
              USER_COURSE_STATS_COLLECTION,
            ),
          ),
          getDocs(collection(database, COURSE_METRICS_COLLECTION)),
        ]);

      const { systems } = buildSystemsUIShared(systemsData);
      const systemsByLabel = new Map(systems.map((system) => [system.label, system]));
      const statsMap = new Map<string, UserCourseStatDoc>(
        courseStatsSnapshot.docs.map((courseDoc: any) => [
          courseDoc.id,
          courseDoc.data() as UserCourseStatDoc,
        ]),
      );
      const metricsMap = new Map<string, CourseMetricDoc>(
        metricsSnapshot.docs.map((metricDoc: any) => [
          metricDoc.id,
          metricDoc.data() as CourseMetricDoc,
        ]),
      );

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
