import { createTheme, alpha } from "@mui/material/styles";
import { colors, shape } from "@bt/shared/design-system/index";

export const muiTheme = createTheme({
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          "& .MuiTouchRipple-root .MuiTouchRipple-child": {
            backgroundColor: alpha(colors.primary, 1),
          },
        },
      },
    },
  },

  typography: {
    fontFamily: '"Poppins", system-ui, sans-serif',
  },

  palette: {
    mode: "light",

    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },

    background: {
      default: colors.background,
      paper: colors.surface,
    },

    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },

    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    surfaceContainer: colors.surfaceContainer,
    surfaceContainerHigh: colors.surfaceContainerHigh,
    surfaceContainerHighest: colors.surfaceContainerHighest,

    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,

    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    info: { main: colors.info },

    outline: colors.outline,
    outlineVariant: colors.outlineVariant,

    brandPrimary: colors.brandPrimary,
    brandSecondary: colors.brandSecondary,
  },

  shape: {
    borderRadius: shape.borderRadius.sm,
  },
});
