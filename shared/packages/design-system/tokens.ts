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

  primary: "#1E3A8A", // Azul profundo (marca principal)
  onPrimary: "#FFFFFF",

  primaryContainer: "#E0E7FF", // Fondos suaves (chips, cards activas)
  onPrimaryContainer: "#1E293B",

  /* ─────────────────────────────────────────────
   * SECONDARY COLORS
   * Usar para: estados secundarios, filtros,
   * acciones menos prioritarias
   * ───────────────────────────────────────────── */

  secondary: "#475569", // Gris azulado técnico
  onSecondary: "#FFFFFF",

  secondaryContainer: "#E2E8F0",
  onSecondaryContainer: "#1F2937",

  /* ─────────────────────────────────────────────
   * BACKGROUND & SURFACES
   * Controla profundidad visual (layers)
   * ───────────────────────────────────────────── */

  background: "#F8FAFC", // Fondo principal app
  onBackground: "#0F172A",

  surface: "#FFFFFF", // Cards principales
  onSurface: "#0F172A",

  surfaceVariant: "#F1F5F9", // Cards secundarias / secciones
  onSurfaceVariant: "#475569",

  surfaceContainer: "#F1F5F9", // Agrupaciones
  surfaceContainerHigh: "#E2E8F0", // Headers / footers
  surfaceContainerHighest: "#CBD5E1", // Separaciones fuertes

  /* ─────────────────────────────────────────────
   * TEXT COLORS
   * Separados por intención semántica
   * ───────────────────────────────────────────── */

  textPrimary: "#0F172A", // Títulos, labels importantes
  textSecondary: "#475569", // Descripciones, metadata
  textDisabled: "#94A3B8", // Estados inactivos

  /* ─────────────────────────────────────────────
   * OUTLINES & BORDERS
   * ───────────────────────────────────────────── */

  outline: "#CBD5E1", // Bordes estándar
  outlineVariant: "#E2E8F0", // Dividers suaves

  /* ─────────────────────────────────────────────
   * SEMANTIC COLORS
   * Feedback del sistema
   * ───────────────────────────────────────────── */

  success: "#16A34A", // Confirmaciones, progreso
  onSuccess: "#FFFFFF",

  warning: "#D97706", // Advertencias
  onWarning: "#FFFFFF",

  error: "#DC2626", // Errores críticos
  onError: "#FFFFFF",

  info: "#0284C7", // Información contextual
  onInfo: "#FFFFFF",

  /* ─────────────────────────────────────────────
   * BRAND EXTENSIONS
   * Para futuras expansiones visuales
   * ───────────────────────────────────────────── */

  brandPrimary: "#1E3A8A",
  brandSecondary: "#0F172A",
};

/**
 * Shape tokens
 * Bordes suaves → enfoque moderno / técnico
 */

export const shape = {
  borderRadius: {
    xs: 2,  // Chips pequeños
    sm: 3,  // Inputs, badges
    md: 6,  // Cards estándar
    lg: 8, // Modales
    xl: 10, // Hero cards / covers
  },
};
