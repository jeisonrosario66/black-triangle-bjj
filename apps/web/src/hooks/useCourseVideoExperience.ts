import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { arrayUnion, collection, doc, getDocs, increment, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

import type { SystemCardUI } from "@bt/shared/context";
import {
  getCachedCourseStatShared,
  getCourseStatShared,
  trackVideoOpenedShared,
  trackVideoProgressShared,
  updateCachedNodeViewsShared,
  type VideoProgressEntry,
} from "@bt/shared/services";
import type { TagItem } from "@src/components/ui/TagList";
import type { NodeTaxonomy } from "@bt/shared/context";
import type { Tab } from "@src/hooks/useNodeTaxonomy";
import { database, useNodeTaxonomy, useResolvedSystemCard, useSession, useTabsByIds } from "@src/hooks";
import type { NodeViewData } from "@src/context";
import { capitalizeFirstLetter } from "@src/utils";
import { useUIStore } from "@src/store";

export type CourseVideoNode = NodeViewData;

interface UseCourseVideoExperienceParams {
  currentNode?: CourseVideoNode | null;
  courseModules?: CourseVideoNode[];
  firestoreRoute?: string | null;
  system?: SystemCardUI | null;
  fallbackSystemLabel?: string | null;
}

export interface CourseVideoExperienceState {
  currentNode: CourseVideoNode | null;
  orderedModules: CourseVideoNode[];
  currentIndex: number;
  previousModule?: CourseVideoNode;
  nextModule?: CourseVideoNode;
  visitedModuleIds: number[];
  viewsCount: number;
  resolvedSystem: SystemCardUI | null;
  isResolvingSystem: boolean;
  taxonomy: NodeTaxonomy | null;
  tabs: Tab[];
  tagItems: TagItem[];
  videoProgressById: Record<string, VideoProgressEntry>;
  onQualifiedVideoView: () => void;
  onVideoProgress: (currentTimeSeconds: number, durationSeconds: number) => void;
  onVideoCompleted: (currentTimeSeconds: number, durationSeconds: number) => void;
}

export const useCourseVideoExperience = ({
  currentNode,
  courseModules = [],
  firestoreRoute,
  system,
  fallbackSystemLabel,
}: UseCourseVideoExperienceParams): CourseVideoExperienceState => {
  const { user } = useSession();
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith("en") ? "en" : "es";
  const { system: resolvedSystemCard, isLoading: isResolvingSystem } =
    useResolvedSystemCard(
      system?.label ?? fallbackSystemLabel ?? currentNode?.systemLabel,
      language,
    );
  const fallbackSystem = useMemo<SystemCardUI | null>(() => {
    const courseLabel = system?.label ?? fallbackSystemLabel ?? currentNode?.systemLabel;

    if (!courseLabel) {
      return null;
    }

    const readableName = capitalizeFirstLetter(courseLabel.replace(/_/g, " "));

    return {
      coach: "",
      coverUrl: "",
      description: "",
      label: courseLabel,
      name: readableName,
      set: "",
      setSystem: "",
      valueLinks:
        system?.valueLinks ?? currentNode?.valueLinks ?? (firestoreRoute ? firestoreRoute.replace("/nodes", "/links") : ""),
      valueNodes: system?.valueNodes ?? currentNode?.valueNodes ?? firestoreRoute ?? "",
      videoCount: courseModules.length || undefined,
    };
  }, [courseModules.length, currentNode?.systemLabel, currentNode?.valueLinks, currentNode?.valueNodes, fallbackSystemLabel, firestoreRoute, system?.label, system?.valueLinks, system?.valueNodes]);
  const resolvedSystem = system ?? resolvedSystemCard ?? fallbackSystem;
  const cachedCourseStat =
    user?.email && resolvedSystem?.label
      ? getCachedCourseStatShared(user.email, resolvedSystem.label)
      : null;
  const [visitedModuleIds, setVisitedModuleIds] = useState<number[]>(
    () => cachedCourseStat?.watchedVideoIds ?? [],
  );
  const [videoProgressById, setVideoProgressById] = useState<
    Record<string, VideoProgressEntry>
  >(() => cachedCourseStat?.videoProgressById ?? {});
  const [viewsCount, setViewsCount] = useState<number>(currentNode?.viewsCount ?? 0);
  const trackedVideoRef = useRef("");

  const orderedModules = useMemo(
    () => [...courseModules].sort((moduleA, moduleB) => Number(moduleA.id) - Number(moduleB.id)),
    [courseModules],
  );
  const currentIndex = orderedModules.findIndex(
    (module) => module.id === currentNode?.id,
  );
  const previousModule =
    currentIndex > 0 ? orderedModules[currentIndex - 1] : undefined;
  const nextModule =
    currentIndex >= 0 && currentIndex < orderedModules.length - 1
      ? orderedModules[currentIndex + 1]
      : undefined;
  const taxonomyRoutes = useMemo(
    () => (firestoreRoute ? [firestoreRoute] : []),
    [firestoreRoute],
  );

  const taxonomy = useNodeTaxonomy(
    currentNode?.id ?? 0,
    taxonomyRoutes,
  );
  const tabs = useTabsByIds(taxonomy?.tab_ids);
  const tagItems = useMemo(
    () =>
      tabs.map((tab) => ({
        id: tab.id,
        label: capitalizeFirstLetter(
          language === "es"
            ? tab.title_es || tab.label
            : tab.title_en || tab.label,
        ),
        color: "success" as const,
      })),
    [language, tabs],
  );

  useLayoutEffect(() => {
    useUIStore.setState({ connectionViewerActiveStep: null });
  }, [currentNode?.id]);

  useEffect(() => {
    setViewsCount(currentNode?.viewsCount ?? 0);
  }, [currentNode?.id, currentNode?.viewsCount]);

  useEffect(() => {
    trackedVideoRef.current = "";
  }, [currentNode?.id]);

  useEffect(() => {
    let mounted = true;

    const loadCourseStat = async () => {
      if (!user?.email || !resolvedSystem?.label) {
        if (mounted) {
          setVisitedModuleIds([]);
          setVideoProgressById({});
        }
        return;
      }

      try {
        const courseStat = await getCourseStatShared({
          email: user.email,
          courseLabel: resolvedSystem.label,
          firestore: {
            collection,
            database,
            getDocs,
          },
        });

        if (!mounted) {
          return;
        }

        setVisitedModuleIds(courseStat?.watchedVideoIds ?? []);
        setVideoProgressById(courseStat?.videoProgressById ?? {});
      } catch (error) {
        console.error("No se pudo cargar el historial del curso:", error);
      }
    };

    void loadCourseStat();

    return () => {
      mounted = false;
    };
  }, [resolvedSystem?.label, user?.email]);

  const onQualifiedVideoView = () => {
    if (!currentNode || !user?.email || !resolvedSystem) {
      return;
    }

    const trackKey = `${user.email}:${resolvedSystem.label}:${currentNode.id}`;

    if (trackedVideoRef.current === trackKey) {
      return;
    }

    trackedVideoRef.current = trackKey;

    void (async () => {
      const wasTracked = await trackVideoOpenedShared({
        email: user.email,
        firestore: {
          arrayUnion,
          database,
          doc,
          increment,
          setDoc,
        },
        module: currentNode,
        system: resolvedSystem,
      });

      if (!wasTracked) {
        trackedVideoRef.current = "";
        return;
      }

      setVisitedModuleIds((currentVisitedIds) => {
        if (currentVisitedIds.includes(currentNode.id)) {
          return currentVisitedIds;
        }

        return [...currentVisitedIds, currentNode.id].sort((idA, idB) => idA - idB);
      });
      setViewsCount((currentViews) => {
        const nextViewsCount = currentViews + 1;

        updateCachedNodeViewsShared({
          docId: currentNode.docId,
          id: currentNode.id,
          nextViewsCount,
        });

        return nextViewsCount;
      });
    })();
  };

  const persistVideoProgress = (
    currentTimeSeconds: number,
    durationSeconds: number,
    completed = false,
  ) => {
    if (!currentNode || !user?.email || !resolvedSystem) {
      return;
    }

    void (async () => {
      const wasTracked = await trackVideoProgressShared({
        email: user.email,
        firestore: {
          database,
          doc,
          setDoc,
        },
        module: currentNode,
        system: resolvedSystem,
        completed,
        currentTimeSeconds,
        durationSeconds,
      });

      if (!wasTracked) {
        return;
      }

      setVideoProgressById((current) => {
        const currentProgressEntry = current[String(currentNode.id)] ?? {};
        const nextProgressPercent = Math.min(
          100,
          Math.max(
            currentProgressEntry.progressPercent ?? 0,
            durationSeconds > 0 ? (currentTimeSeconds / durationSeconds) * 100 : 0,
            completed ? 100 : 0,
          ),
        );
        const nextProgressEntry: VideoProgressEntry = {
          completed:
            currentProgressEntry.completed ||
            completed ||
            nextProgressPercent >= 90,
          durationSeconds,
          lastPositionSeconds: currentTimeSeconds,
          progressPercent: nextProgressPercent,
          updatedAt: new Date().toISOString(),
        };

        return {
          ...current,
          [String(currentNode.id)]: nextProgressEntry,
        };
      });
    })();
  };

  const onVideoProgress = (currentTimeSeconds: number, durationSeconds: number) => {
    persistVideoProgress(currentTimeSeconds, durationSeconds, false);
  };

  const onVideoCompleted = (currentTimeSeconds: number, durationSeconds: number) => {
    persistVideoProgress(currentTimeSeconds, durationSeconds, true);
  };

  return {
    currentNode: currentNode ?? null,
    orderedModules,
    currentIndex,
    previousModule,
    nextModule,
    visitedModuleIds,
    viewsCount,
    resolvedSystem,
    isResolvingSystem,
    taxonomy,
    tabs,
    tagItems,
    videoProgressById,
    onQualifiedVideoView,
    onVideoProgress,
    onVideoCompleted,
  };
};
