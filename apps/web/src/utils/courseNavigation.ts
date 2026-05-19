import type { SystemCardUI } from "@bt/shared/context";
import type { SystemOptionGroup } from "@src/context";

export const buildCoursePath = (label: string, coach: string) =>
  `${label}-${coach.replace(/ /g, "_")}`;

export const findSystemOptionByNodesPath = (
  systemsOptions: SystemOptionGroup[],
  valueNodes?: string | null,
) =>
  systemsOptions
    .flatMap((group) => group.systems)
    .find((system) => system.valueNodes === valueNodes) ?? null;

export const isCourseGraphComplete = (
  systemsOptions: SystemOptionGroup[],
  valueNodes?: string | null,
) => Boolean(findSystemOptionByNodesPath(systemsOptions, valueNodes)?.coverage?.isComplete);

export const buildGraphCourseContext = (system: SystemCardUI) => ({
  label: system.label,
  coach: system.coach,
  valueNodes: system.valueNodes,
  valueLinks: system.valueLinks,
});
