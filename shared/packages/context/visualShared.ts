export type VisualThemeKey =
  | "system"
  | "submission"
  | "guard_pass"
  | "switch"
  | "transition"
  | "control"
  | "takedown"
  | "judo_throw"
  | "guard"
  | "defense_escape";

type VisualThemeAliasKey = "pass" | "defence";

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
    accent: "#F6C445",
    glow: "#FFE39A",
    base: "#0B0A08",
    edge: "#2C1906",
  },
  submission: {
    accent: "#FF6B57",
    glow: "#FFB29E",
    base: "#120909",
    edge: "#34110D",
  },
  guard_pass: {
    accent: "#FFD447",
    glow: "#FFF0A1",
    base: "#111008",
    edge: "#332A08",
  },
  switch: {
    accent: "#55E7B7",
    glow: "#A7F8DD",
    base: "#07110E",
    edge: "#0C2F25",
  },
  transition: {
    accent: "#53A7FF",
    glow: "#A9D3FF",
    base: "#07101A",
    edge: "#102A47",
  },
  control: {
    accent: "#FF5D8F",
    glow: "#FFABC6",
    base: "#15080F",
    edge: "#3A0E21",
  },
  takedown: {
    accent: "#FF8A2A",
    glow: "#FFC08C",
    base: "#140B07",
    edge: "#3E1C07",
  },
  judo_throw: {
    accent: "#9A7CFF",
    glow: "#CFC1FF",
    base: "#0D0A16",
    edge: "#24154B",
  },
  guard: {
    accent: "#7ED957",
    glow: "#BEF5A4",
    base: "#081108",
    edge: "#163315",
  },
  defense_escape: {
    accent: "#38D6C5",
    glow: "#99F2E9",
    base: "#071110",
    edge: "#0F2E2A",
  },
};

const visualThemeAliases: Record<VisualThemeAliasKey, VisualThemeKey> = {
  pass: "guard_pass",
  defence: "defense_escape",
};

export const groupColor: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(visualThemes).map(([key, value]) => [key, value.accent]),
  ),
  ...Object.fromEntries(
    Object.entries(visualThemeAliases).map(([alias, targetKey]) => [
      alias,
      visualThemes[targetKey].accent,
    ]),
  ),
};

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
