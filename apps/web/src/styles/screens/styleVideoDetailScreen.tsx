import { SxProps } from "@mui/system";
import { Theme, alpha } from "@mui/material/styles";
import { shape, surfaceRecipes } from "@bt/shared/design-system/index";

export const container: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.page(theme),
});

export const heroCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.hero(theme),
  position: "relative",
  marginBottom: { xs: 1.5, md: 2.25 },
  overflow: "hidden",
});

export const heroMedia: SxProps = {
  height: { xs: 108, sm: 116, md: 132 },
};

export const videoFrame: SxProps<Theme> = () => ({
  marginTop: { xs: 0, md: 0.5 },
  width: { xs: "calc(100% + 32px)", sm: "100%" },
  marginLeft: { xs: -2, sm: 0 },
  marginRight: { xs: -2, sm: 0 },
  aspectRatio: { xs: "16 / 10", md: "16 / 9" },
  minHeight: { xs: 244, sm: "unset" },
  borderRadius: { xs: shape.borderRadius.sm, sm: shape.borderRadius.lg },
  overflow: "hidden",
  backgroundColor: "#000",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: {
    xs: "0 18px 34px rgba(0, 0, 0, 0.34)",
    md: "0 22px 52px rgba(0, 0, 0, 0.42)",
  },
});

export const videoIframe: SxProps = {
  width: "100%",
  height: "100%",
  border: 0,
};

export const contextMedia: SxProps = {
  minHeight: { xs: 210, md: 240 },
  marginTop: 3,
};

export const metaCard: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.panel(theme),
  marginTop: 3,
  padding: { xs: 2, md: 2.5 },
});

export const navigationAccordion: SxProps<Theme> = (theme) => ({
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

export const navigationControls: SxProps = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
  gap: 1.25,
  marginBottom: 2,
};

export const descriptionBox: SxProps = {
  marginTop: 2,
};

export const videoMetaRow: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
  marginBottom: 1.5,
};

export const viewsLabel: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
});

export const seenLabel: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  paddingX: 1,
  paddingY: 0.5,
  borderRadius: 999,
  fontWeight: 600,
  fontSize: "0.76rem",
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
});
