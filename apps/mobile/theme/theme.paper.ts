import { MD3LightTheme } from "react-native-paper";
import { colors } from "../../../shared/packages/design-system/index";

/**
 * Define el tema visual principal para React Native Paper.
 * Centraliza la configuración de colores y propiedades base del diseño,
 * integrando el design system compartido para garantizar consistencia
 * visual y semántica en toda la aplicación.
 *
 * @returns {object} Objeto de tema compatible con React Native Paper basado en MD3.
 */
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    primary: colors.primary,
    secondary: colors.secondary,

    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,

    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,


  },
  shape: {
    borderRadius: 3,
  },
};
