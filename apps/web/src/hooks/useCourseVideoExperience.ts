import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { arrayUnion, collection, doc, getDocs, increment, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

import type { NodeOptionFirestore as SharedNodeOptionFirestore, SystemCardUI } from "@bt/shared/context";
import {
  getCachedCourseStatShared,
  getCourseStatShared,
  trackVideoOpenedShared,
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
  isVideoPlayerActive: boolean;
  resolvedSystem: SystemCardUI | null;
  isResolvingSystem: boolean;
  taxonomy: NodeTaxonomy | null;
  tabs: Tab[];
  tagItems: TagItem[];
  startPlayback: () => void;
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
  const trackedVideoRef = useRef("");
  const cachedCourseStat =
    user?.email && resolvedSystem?.label
      ? getCachedCourseStatShared(user.email, resolvedSystem.label)
      : null;
  const [visitedModuleIds, setVisitedModuleIds] = useState<number[]>(
    () => cachedCourseStat?.watchedVideoIds ?? [],
  );
  const [viewsCount, setViewsCount] = useState<number>(currentNode?.viewsCount ?? 0);
  const [isVideoPlayerActive, setIsVideoPlayerActive] = useState(false);

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
    setIsVideoPlayerActive(false);
    trackedVideoRef.current = "";
  }, [currentNode?.id]);

  useEffect(() => {
    let mounted = true;

    const loadCourseStat = async () => {
      if (!user?.email || !resolvedSystem?.label) {
        if (mounted) {
          setVisitedModuleIds([]);
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
      } catch (error) {
        console.error("No se pudo cargar el historial del curso:", error);
      }
    };

    void loadCourseStat();

    return () => {
      mounted = false;
    };
  }, [resolvedSystem?.label, user?.email]);

  const startPlayback = () => {
    if (true) {
      setIsVideoPlayerActive(true);
      return;
    }

    setIsVideoPlayerActive(true);

    if (!user?.email || !resolvedSystem) {
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
        module: currentNode as SharedNodeOptionFirestore,
        system: resolvedSystem,
      });

      if (!wasTracked) {
        return;
      }

      setVisitedModuleIds((currentVisitedIds) => {
        if (currentVisitedIds.includes(currentNode.id)) {
          return currentVisitedIds;
        }

        return [...currentVisitedIds, currentNode.id].sort((idA, idB) => idA - idB);
      });
      setViewsCount((currentViews) => currentViews + 1);
    })();
  };

  return {
    currentNode: currentNode ?? null,
    orderedModules,
    currentIndex,
    previousModule,
    nextModule,
    visitedModuleIds,
    viewsCount,
    isVideoPlayerActive,
    resolvedSystem,
    isResolvingSystem,
    taxonomy,
    tabs,
    tagItems,
    startPlayback,
  };
};
