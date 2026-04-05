import { SxProps } from "@mui/system";
import { Theme, alpha } from "@mui/material/styles";
import { surfaceRecipes } from "@bt/shared/design-system/index";

export const container: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.page(theme),
});


export const headerMetaRow: SxProps = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  marginTop: 1.5,
};

export const description: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  maxWidth: 760,
});

export const descriptionCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme, { muted: true }),
  marginTop: 3,
  padding: { xs: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
});

export const contextMedia: SxProps = {
  marginTop: 3,
  minHeight: { xs: 210, md: 250 },
};

export const modulesAccordion: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  marginTop: 3,
  overflow: "hidden",
  "&::before": {
    display: "none",
  },
});

export const accordionSummary: SxProps<Theme> = (theme) => ({
  minHeight: 64,
  borderBottom: `1px solid ${alpha(theme.palette.outlineVariant, 0.72)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  "& .MuiAccordionSummary-content": {
    marginY: 1.25,
  },
});

export const moduleList: SxProps = {
  paddingTop: 1,
};
