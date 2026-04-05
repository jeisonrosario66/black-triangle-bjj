import { createTheme, alpha } from "@mui/material/styles";
import { colors, shape } from "@bt/shared/design-system/index";

export const muiTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background,
          color: colors.textPrimary,
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          "& .MuiTouchRipple-root .MuiTouchRipple-child": {
            backgroundColor: alpha(colors.primary, 1),
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 700,
          borderRadius: shape.borderRadius.sm,
          letterSpacing: 0.3,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
          ...(theme.palette.mode === "dark"
            ? {
                "&.MuiButton-contained": {
                  color: theme.palette.primary.contrastText,
                },
              }
            : {}),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.outlineVariant}`,
          backgroundColor: colors.surface,
          boxShadow: "0 14px 36px rgba(0, 0, 0, 0.32)",
          borderRadius: shape.borderRadius.md,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius.sm,
          fontWeight: 500,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.outlineVariant,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          [theme.breakpoints.up("md")]: {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius.md,
          border: `1px solid ${colors.outlineVariant}`,
          backgroundColor: colors.surface,
          boxShadow: "none",
          "&:before": {
            display: "none",
          },
        },
      },
    },
  },

  typography: {
    fontFamily: '"Poppins", system-ui, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: -0.2,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
  },

  palette: {
    mode: "dark",

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
