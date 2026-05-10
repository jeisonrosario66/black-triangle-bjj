import { SxProps } from "@mui/system";
import { alpha, Theme } from "@mui/material/styles";
import { shape, surfaceRecipes } from "@bt/shared/design-system";

export const screen: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.page(theme),
});

export const filtersRow: SxProps = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { md: "center" },
  gap: 2,
  marginBottom: 2,
};

export const searchField: SxProps = {
  flex: 1,
  minWidth: { xs: "100%", md: 320 },
};

export const selectField: SxProps = {
  minWidth: { xs: "100%", md: 220 },
};

export const sortField: SxProps = {
  minWidth: { xs: "100%", md: 220 },
};

export const resultsMeta: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  marginBottom: 2,
});

export const heroCard: SxProps<Theme> = (theme) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: 2.5,
  borderRadius: { xs: shape.borderRadius.lg, md: shape.borderRadius.xl },
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  background: `
    radial-gradient(circle at 14% 18%, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 24%),
    radial-gradient(circle at 82% 20%, ${alpha("#FFFFFF", 0.08)} 0%, transparent 22%),
    linear-gradient(135deg, #1A1C20 0%, #20242B 46%, #262D36 100%)
  `,
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.22)",
});

export const heroGlow: SxProps = {
  position: "absolute",
  inset: 0,
  background: `
    linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 32%, rgba(15,23,42,0.18) 100%)
  `,
};

export const heroContent: SxProps = {
  position: "relative",
  zIndex: 1,
  display: "block",
  padding: { xs: 2, md: 2.5 },
};

export const heroCopy: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 0.9,
  minWidth: 0,
  maxWidth: 640,
};

export const heroEyebrow: SxProps<Theme> = (theme) => ({
  fontSize: "0.74rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: alpha(theme.palette.primary.light, 0.9),
});

export const heroTitle: SxProps<Theme> = (theme) => ({
  fontSize: { xs: "1.35rem", md: "1.9rem" },
  lineHeight: 1.06,
  fontWeight: 800,
  color: alpha("#F8FAFC", 0.96),
  textWrap: "balance",
});

export const heroDescription: SxProps<Theme> = (theme) => ({
  maxWidth: 560,
  color: alpha("#E2E8F0", 0.82),
  fontSize: { xs: "0.92rem", md: "0.98rem" },
  lineHeight: 1.5,
});

export const emptyState: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  padding: { xs: 2, md: 2.5 },
  borderStyle: "dashed",
  borderColor: alpha(theme.palette.primary.main, 0.2),
});

export const emptyStateTitle: SxProps = {
  fontWeight: 700,
  marginBottom: 0.75,
};

export const emptyStateDescription: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  marginBottom: 2.5,
});

export const systemCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme, { interactive: true }),
  overflow: "hidden",
  borderRadius: { xs: shape.borderRadius.lg, md: shape.borderRadius.md },
  cursor: "pointer",
});

export const cardMedia: SxProps = {
  height: { xs: 212, md: 260 },
};

export const mobileItemHeight = 196;

export const mobileListItem: SxProps<Theme> = (theme) => ({
  display: "block",
  padding: 0,
  overflow: "hidden",
  height: 174,
  marginX: 1.25,
  marginBottom: 2,
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.95)}`,
  borderRadius: shape.borderRadius.lg,
  backgroundColor: "background.paper",
  boxShadow: "0 14px 32px rgba(0, 0, 0, 0.28)",
  cursor: "pointer",
});

export const mobileListMedia: SxProps = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
};
