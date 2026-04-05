import { colors, shape } from "./tokens";

type ThemeLike = {
  palette: {
    background: { default: string; paper: string };
    primary: { main: string };
    outlineVariant: string;
    surfaceVariant: string;
  };
};

type PanelOptions = {
  interactive?: boolean;
  muted?: boolean;
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  const value = Number.parseInt(safeHex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const toAlpha = (hex: string, opacity: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Recetas visuales compartidas para la capa web.
 * Mantienen coherencia entre landing, home, explorer, curso y video.
 */
export const surfaceRecipes = {
  page: (theme: ThemeLike) => ({
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
    backgroundImage: `
      radial-gradient(circle at top left, ${toAlpha(colors.primary, 0.12)} 0%, transparent 28%),
      radial-gradient(circle at top right, ${toAlpha("#FFFFFF", 0.04)} 0%, transparent 24%),
      linear-gradient(180deg, ${theme.palette.background.default} 0%, ${toAlpha(theme.palette.surfaceVariant, 0.42)} 100%)
    `,
  }),

  panel: (theme: ThemeLike, options: PanelOptions = {}) => ({
    borderRadius: shape.borderRadius.md,
    border: `1px solid ${toAlpha(theme.palette.outlineVariant, 0.98)}`,
    backgroundColor: options.muted
      ? toAlpha(theme.palette.background.paper, 0.9)
      : theme.palette.background.paper,
    boxShadow: options.interactive
      ? "0 18px 38px rgba(0, 0, 0, 0.36)"
      : "0 14px 32px rgba(0, 0, 0, 0.28)",
    transition: options.interactive
      ? "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease"
      : undefined,
    ...(options.interactive
      ? {
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: toAlpha(theme.palette.primary.main, 0.8),
            boxShadow: "0 22px 44px rgba(0, 0, 0, 0.42)",
          },
        }
      : {}),
  }),

  hero: (theme: ThemeLike) => ({
    borderRadius: shape.borderRadius.lg,
    border: `1px solid ${toAlpha(theme.palette.outlineVariant, 0.98)}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 22px 56px rgba(0, 0, 0, 0.42)",
    overflow: "hidden",
  }),

  softSection: (theme: ThemeLike) => ({
    borderRadius: shape.borderRadius.md,
    border: `1px solid ${toAlpha(theme.palette.outlineVariant, 0.9)}`,
    backgroundColor: toAlpha(theme.palette.surfaceVariant, 0.78),
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
  }),

  mediaFrame: (theme: ThemeLike) => ({
    overflow: "hidden",
    borderBottom: `1px solid ${toAlpha(theme.palette.outlineVariant, 0.72)}`,
  }),

  inset: (theme: ThemeLike) => ({
    backgroundColor: toAlpha(theme.palette.surfaceVariant, 0.8),
    border: `1px solid ${toAlpha(theme.palette.outlineVariant, 0.95)}`,
    borderRadius: shape.borderRadius.sm,
  }),
};
