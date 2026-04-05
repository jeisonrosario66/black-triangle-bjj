/**
 * Design tokens – Color system
 *
 * Objetivo:
 * - Jerarquía visual clara
 * - Buen contraste en mobile
 * - Escalable a dark mode
 * - Compatible con React Native Paper / Material 3
 */

export const colors = {
  /* ─────────────────────────────────────────────
   * PRIMARY BRAND COLORS
   * Usar para: CTA principales, iconos activos,
   * highlights importantes, navegación activa
   * ───────────────────────────────────────────── */

  primary: "#B38A4B", // Dorado metalico
  onPrimary: "#0A0A0A",

  primaryContainer: "#2A2114", // Fondos suaves para acentos
  onPrimaryContainer: "#F4E7CF",

  /* ─────────────────────────────────────────────
   * SECONDARY COLORS
   * Usar para: estados secundarios, filtros,
   * acciones menos prioritarias
   * ───────────────────────────────────────────── */

  secondary: "#2B2B2B", // Gris oscuro tecnico
  onSecondary: "#F6F1E8",

  secondaryContainer: "#1A1A1A",
  onSecondaryContainer: "#E5D6BB",

  /* ─────────────────────────────────────────────
   * BACKGROUND & SURFACES
   * Controla profundidad visual (layers)
   * ───────────────────────────────────────────── */

  background: "#050505", // Fondo principal
  onBackground: "#F7F1E8",

  surface: "#131313", // Cards principales
  onSurface: "#F7F1E8",

  surfaceVariant: "#1B1B1B", // Cards secundarias
  onSurfaceVariant: "#C7B79B",

  surfaceContainer: "#161616",
  surfaceContainerHigh: "#1E1E1E",
  surfaceContainerHighest: "#262626",

  /* ─────────────────────────────────────────────
   * TEXT COLORS
   * Separados por intención semántica
   * ───────────────────────────────────────────── */

  textPrimary: "#F7F1E8",
  textSecondary: "#C7B79B",
  textDisabled: "#7B6A4C",

  /* ─────────────────────────────────────────────
   * OUTLINES & BORDERS
   * ───────────────────────────────────────────── */

  outline: "#6A5430",
  outlineVariant: "#342A1C",

  /* ─────────────────────────────────────────────
   * SEMANTIC COLORS
   * Feedback del sistema
   * ───────────────────────────────────────────── */

  success: "#D6B173",
  onSuccess: "#0A0A0A",

  warning: "#C79A5B",
  onWarning: "#0A0A0A",

  error: "#8C6A3D",
  onError: "#F7F1E8",

  info: "#E1C48C",
  onInfo: "#0A0A0A",

  /* ─────────────────────────────────────────────
   * BRAND EXTENSIONS
   * Para futuras expansiones visuales
   * ───────────────────────────────────────────── */

  brandPrimary: "#B38A4B",
  brandSecondary: "#0A0A0A",
};

/**
 * Shape tokens
 * Bordes suaves → enfoque moderno / técnico
 */

export const shape = {
  borderRadius: {
    xs: 1,
    sm: 0.7,
    md: 6,
    lg: 8,
    xl: 10,
  },
};
