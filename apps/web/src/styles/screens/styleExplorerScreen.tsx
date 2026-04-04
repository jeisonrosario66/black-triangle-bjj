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

export const resultsMeta: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  marginBottom: 2,
});

export const heroVisual: SxProps = {
  minHeight: { xs: 210, md: 250 },
  marginBottom: 2.5,
};

export const systemCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme, { interactive: true }),
  overflow: "hidden",
  borderRadius: { xs: shape.borderRadius.lg, md: shape.borderRadius.md },
});

export const cardMedia: SxProps = {
  height: { xs: 212, md: 260 },
  borderBottom: "1px solid",
  borderColor: "rgba(148, 163, 184, 0.16)",
};

export const cardContent: SxProps = {
  padding: 2.25,
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
};

export const metaRow: SxProps = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,
  flexWrap: "wrap",
};

export const mobileItemHeight = 182;

export const mobileListItem: SxProps<Theme> = (theme) => ({
  display: "block",
  padding: 0,
  overflow: "hidden",
  height: 160,
  marginX: 1.25,
  marginBottom: 2,
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.95)}`,
  borderRadius: shape.borderRadius.lg,
  backgroundColor: "background.paper",
  boxShadow: "0 14px 32px rgba(0, 0, 0, 0.28)",
});

export const mobileListMedia: SxProps = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

export const mobileListContent: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};
