import { SxProps } from "@mui/system";
import { Theme, alpha } from "@mui/material/styles";
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
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(320px, 0.78fr)" },
  gap: { xs: 2.5, md: 3 },
  alignItems: "stretch",
};

export const introEyebrow: SxProps<Theme> = (theme) => ({
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
});

export const introVisual: SxProps = {
  minHeight: { xs: 220, md: 260 },
};

export const progressCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  overflow: "hidden",
});

export const progressMedia: SxProps = {
  height: { xs: 220, md: 240 },
  borderBottom: "1px solid",
  borderColor: "rgba(148, 163, 184, 0.16)",
};

export const progressContent: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 1.25,
  padding: { xs: 2, md: 2.5 },
};

export const cardTitleStyle: SxProps = {
  fontWeight: 700,
};

export const cardLabelStyle: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
});

export const progressMetaRow: SxProps = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
};

export const progressStat: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  paddingX: 1,
  paddingY: 0.6,
  borderRadius: shape.borderRadius.sm,
  fontSize: "0.75rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.surfaceVariant, 0.92),
});

export const progressBar: SxProps = {
  mt: 0.25,
  mb: 0.25,
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

export const routeCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  padding: { xs: 2, md: 2.25 },
});

export const routeHeader: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
};

export const routeMeta: SxProps<Theme> = (theme) => ({
  fontSize: "0.8rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
});

export const routeReason: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  marginTop: 0.5,
  marginBottom: 1.5,
});

export const cardRouteButtom: SxProps<Theme> = () => ({
  justifyContent: "flex-start",
  fontSize: "0.85rem",
  fontWeight: 700,
  paddingX: 0,
});

export const routeCourseList: SxProps = {
  gap: 1.25,
  marginTop: 1.5,
};

export const routeCourseCard: SxProps<Theme> = (theme) => ({
  borderRadius: shape.borderRadius.sm,
  border: "1px solid",
  borderColor: alpha(theme.palette.outlineVariant, 0.9),
  backgroundColor: alpha(theme.palette.surfaceVariant, 0.28),
  overflow: "hidden",
});

export const routeCourseLayout: SxProps = {
  display: "block",
};

export const routeCourseContent: SxProps = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 0.75,
  padding: { xs: 1.15, sm: 1.35 },
  minWidth: 0,
};

export const routeCourseTitle: SxProps = {
  fontSize: "0.95rem",
  fontWeight: 700,
  lineHeight: 1.2,
};

export const routeCourseMeta: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.25,
  fontSize: "0.82rem",
});

export const routeCourseButton: SxProps<Theme> = () => ({
  justifyContent: "flex-start",
  paddingX: 0,
  minHeight: 32,
  fontWeight: 700,
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
