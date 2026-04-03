export type VisualThemeKey =
  | "system"
  | "submission"
  | "pass"
  | "switch"
  | "transition"
  | "control"
  | "takedown"
  | "defence"
  | "guard"
  | "defense_escape";

type VisualTheme = {
  accent: string;
  glow: string;
  base: string;
  edge: string;
};

/**
 * Fuente única de verdad para la identidad visual de grupos y covers.
 * Define tanto el color acento usado por nodos como la atmósfera visual
 * que consumen las portadas generadas en la UI.
 */
export const visualThemes: Record<VisualThemeKey, VisualTheme> = {
  system: {
    accent: "rgb(159, 159, 159)",
    glow: "#E5E7EB",
    base: "#111315",
    edge: "#252A31",
  },
  submission: {
    accent: "rgb(200, 0, 0)",
    glow: "#FCA5A5",
    base: "#180B0C",
    edge: "#3C1117",
  },
  pass: {
    accent: "rgb(0, 128, 128)",
    glow: "#7DD3D8",
    base: "#091516",
    edge: "#153235",
  },
  switch: {
    accent: "rgb(255, 215, 0)",
    glow: "#FDE68A",
    base: "#17130A",
    edge: "#382C10",
  },
  transition: {
    accent: "rgb(128, 0, 128)",
    glow: "#D8B4FE",
    base: "#151019",
    edge: "#2E1A39",
  },
  control: {
    accent: "rgb(0, 102, 204)",
    glow: "#93C5FD",
    base: "#0B1320",
    edge: "#183255",
  },
  takedown: {
    accent: "rgb(255, 140, 0)",
    glow: "#FDBA74",
    base: "#1A110B",
    edge: "#3B2612",
  },
  defence: {
    accent: "rgb(34, 139, 34)",
    glow: "#86EFAC",
    base: "#0D160E",
    edge: "#1C3920",
  },
  guard: {
    accent: "rgb(139, 69, 19)",
    glow: "#E7B98A",
    base: "#17100C",
    edge: "#372113",
  },
  defense_escape: {
    accent: "rgba(255, 185, 135, 1)",
    glow: "#FCD5B5",
    base: "#1A120F",
    edge: "#3A261F",
  },
};

export const groupColor: Record<string, string> = Object.fromEntries(
  Object.entries(visualThemes).map(([key, value]) => [key, value.accent]),
);

const coverThemeKeys = Object.keys(visualThemes) as VisualThemeKey[];

const getHash = (value: string) =>
  Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);

/**
 * Resuelve una paleta de cover determinística a partir de un seed.
 * Reutiliza la fuente visual compartida para que nodos, covers y acentos
 * mantengan coherencia cromática en toda la plataforma.
 */
export const getCoverPalette = (seed: string) => {
  const key = coverThemeKeys[getHash(seed) % coverThemeKeys.length];
  return {
    ...visualThemes[key],
    key,
  };
};
