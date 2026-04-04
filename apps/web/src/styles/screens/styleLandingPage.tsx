import type { SxProps } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

import { shape, surfaceRecipes } from "@bt/shared/design-system";

export const page: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.page(theme),
});

export const heroSection: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: { xs: 2.5, md: 3 },
};

export const heroGrid: SxProps = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.2fr) minmax(320px, 0.8fr)" },
  gap: { xs: 2, md: 3 },
  alignItems: "stretch",
};

export const heroCopy: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  padding: { xs: 2.5, md: 4 },
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 2,
});

export const eyebrow: SxProps<Theme> = (theme) => ({
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: theme.palette.primary.main,
});

export const heroTitle: SxProps = {
  marginTop: 0.5,
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: "-0.04em",
  textWrap: "balance",
};

export const heroDescription: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  maxWidth: 640,
  fontSize: { xs: "0.98rem", md: "1.05rem" },
  lineHeight: 1.7,
});

export const actionRow: SxProps = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.25,
  alignItems: { sm: "center" },
};

export const helperText: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.84rem",
});

export const metricsRow: SxProps = {
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
  gap: 1,
};

export const metricCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.inset(theme),
  padding: 1.25,
});

export const metricValue: SxProps = {
  fontWeight: 800,
  fontSize: { xs: "1rem", md: "1.12rem" },
  lineHeight: 1,
};

export const metricLabel: SxProps<Theme> = (theme) => ({
  marginTop: 0.5,
  color: theme.palette.text.secondary,
  fontSize: "0.78rem",
});

export const heroVisual: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.hero(theme),
  minHeight: { xs: 320, md: 420 },
  position: "relative",
  padding: { xs: 2, md: 3 },
  background: `
    radial-gradient(circle at 14% 18%, ${alpha(theme.palette.primary.main, 0.24)} 0%, transparent 26%),
    radial-gradient(circle at 86% 18%, ${alpha("#FFFFFF", 0.08)} 0%, transparent 24%),
    linear-gradient(140deg, #080808 0%, #101010 54%, #191919 100%)
  `,
  color: theme.palette.text.primary,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(${alpha("#FFFFFF", 0.06)} 1px, transparent 1px),
      linear-gradient(90deg, ${alpha("#FFFFFF", 0.06)} 1px, transparent 1px)
    `,
    backgroundSize: "34px 34px",
    opacity: 0.2,
  },
});

export const heroVisualContent: SxProps = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};
export const heroBrand: SxProps = {
  display: "block",
  width: { xs: 148, md: 196 },
  height: "auto",
  alignSelf: "center",
};

export const heroVisualTitle: SxProps = {
  fontWeight: 800,
  fontSize: { xs: "1.35rem", md: "1.9rem" },
  lineHeight: 1.05,
  maxWidth: 320,
};

export const heroVisualBody: SxProps = {
  color: "rgba(231, 214, 187, 0.9)",
  maxWidth: 360,
};

export const heroFeatureStack: SxProps = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gap: 1,
};

export const heroFeatureCard: SxProps = {
  borderRadius: shape.borderRadius.sm,
  padding: 1.2,
  backgroundColor: "rgba(5, 5, 5, 0.56)",
  border: "1px solid rgba(179,138,75,0.18)",
  backdropFilter: "blur(8px)",
};

export const heroFeatureTitle: SxProps = {
  fontWeight: 700,
  fontSize: "0.84rem",
};

export const heroFeatureBody: SxProps = {
  marginTop: 0.35,
  color: "rgba(231, 214, 187, 0.82)",
  fontSize: "0.78rem",
};

export const featureCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  padding: { xs: 2, md: 2.25 },
  display: "flex",
  flexDirection: "column",
  gap: 1,
});

export const featureTitle: SxProps = {
  fontWeight: 700,
};

export const featureDescription: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
});
