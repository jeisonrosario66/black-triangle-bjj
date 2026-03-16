import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

export const screen: SxProps<Theme> = (theme) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
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

export const cardMedia: SxProps = {
  height: { xs: 200, md: 260 },
  objectFit: "cover",
};

export const cardContent: SxProps = {
  padding: 2,
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

export const mobileItemHeight = 96;

export const mobileListItem: SxProps = {
  display: "flex",
  gap: 1.5,
  padding: 1.5,
  alignItems: "center",
  borderBottom: "1px solid",
  borderColor: "outlineVariant",
  height: mobileItemHeight,
};

export const mobileListMedia: SxProps = {
  width: 84,
  height: 64,
  borderRadius: 1,
  objectFit: "cover",
  flexShrink: 0,
};

export const mobileListContent: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};
