import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import type { SystemCardUI } from "@bt/shared/context";
import {
  buildSystemsUIShared,
  getCachedSystemsShared,
  getSystemshared,
} from "@bt/shared/services";
import { database } from "@src/hooks/fireBase";

export const useResolvedSystemCard = (
  courseLabel?: string | null,
  language: "es" | "en" = "es",
) => {
  const [system, setSystem] = useState<SystemCardUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!courseLabel) {
      setSystem(null);
      setIsLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadSystem = async () => {
      setIsLoading(true);

      try {
        const cachedSystemGroups = getCachedSystemsShared(language);
        const systemGroups =
          cachedSystemGroups ??
          (await getSystemshared(getDocs, collection, database, language));
        const { systems } = buildSystemsUIShared(systemGroups);
        const matchedSystem =
          systems.find((candidate) => candidate.label === courseLabel) ?? null;

        if (mounted) {
          setSystem(matchedSystem);
        }
      } catch (error) {
        console.error("No se pudo resolver el sistema del nodo:", error);
        if (mounted) {
          setSystem(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSystem();

    return () => {
      mounted = false;
    };
  }, [courseLabel, language]);

  return {
    system,
    isLoading,
  };
};
