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
    accent: "#B38A4B",
    glow: "#E1C48C",
    base: "#0A0A0A",
    edge: "#1A1A1A",
  },
  submission: {
    accent: "#C79A5B",
    glow: "#E7C58F",
    base: "#0A0A0A",
    edge: "#1C1711",
  },
  pass: {
    accent: "#D0AE73",
    glow: "#F0D6A8",
    base: "#090909",
    edge: "#1A1A1A",
  },
  switch: {
    accent: "#E1C48C",
    glow: "#F6E0B7",
    base: "#0A0A0A",
    edge: "#211A11",
  },
  transition: {
    accent: "#9F7B46",
    glow: "#D9BE92",
    base: "#090909",
    edge: "#181410",
  },
  control: {
    accent: "#B79055",
    glow: "#E4C895",
    base: "#090909",
    edge: "#171717",
  },
  takedown: {
    accent: "#C18C4A",
    glow: "#EABF87",
    base: "#090909",
    edge: "#1D1711",
  },
  defence: {
    accent: "#C7A266",
    glow: "#E7D0A1",
    base: "#0A0A0A",
    edge: "#181613",
  },
  guard: {
    accent: "#A57B44",
    glow: "#DDB883",
    base: "#090909",
    edge: "#1B1712",
  },
  defense_escape: {
    accent: "#D2AF75",
    glow: "#F0D9AD",
    base: "#090909",
    edge: "#1C1712",
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
