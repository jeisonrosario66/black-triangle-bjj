import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { shape, surfaceRecipes } from "@bt/shared/design-system/index";

export const page: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.page(theme),
});

export const intro: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
};

export const introGrid: SxProps = {
  display: "block",
};

export const introEyebrow: SxProps<Theme> = (theme) => ({
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
});

export const progressCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  overflow: "hidden",
});

export const recentSection: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const recentCarousel: SxProps = {
  display: "flex",
  gap: 0,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  scrollBehavior: "smooth",
  overscrollBehaviorX: "contain",
  touchAction: "pan-x",
  paddingBottom: 0.5,
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};

export const recentCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  flex: "0 0 100%",
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
  scrollSnapAlign: "start",
  scrollSnapStop: "always",
});

export const recentIndicators: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  marginTop: 0.5,
};

export const recentDots: SxProps = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
};

export const recentDot = (theme: Theme) => ({
  width: 7,
  height: 7,
  borderRadius: "50%",
  backgroundColor: theme.palette.outlineVariant,
  opacity: 0.45,
  transition: "all 180ms ease",
});

export const recentDotActive = (theme: Theme) => ({
  width: 18,
  borderRadius: 999,
  backgroundColor: theme.palette.primary.main,
  opacity: 0.9,
});

export const recentIndicatorsLabel: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  letterSpacing: "0.04em",
});

export const recentCardMedia: SxProps = {
  height: { xs: 220, md: 240 },
  borderBottom: "1px solid",
  borderColor: "rgba(148, 163, 184, 0.16)",
};

export const progressFooter: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  padding: { xs: 1.5, md: 1.75 },
};

export const cardTitleStyle: SxProps = {
  fontWeight: 700,
};

export const cardLabelStyle: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
});

export const progressBar: SxProps = {
  height: 7,
  borderRadius: 999,
};

export const cardBottomStyle: SxProps = {
  width: "100%",
  borderRadius: shape.borderRadius.xs,
  alignSelf: "flex-start",
};

export const emptyCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  padding: { xs: 2, md: 2.5 },
});

export const sectionAction: SxProps<Theme> = (theme) => ({
  borderColor: theme.palette.outline,
  color: theme.palette.text.primary,
});

export const systemCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme, { interactive: true }),
  overflow: "hidden",
});

export const systemMedia: SxProps = {
  height: { xs: 210, md: 225 },
  borderBottom: "1px solid",
  borderColor: "rgba(148, 163, 184, 0.16)",
};

export const systemContent: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
  padding: { xs: 1.75, md: 2 },
};

export const systemReason: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
});
