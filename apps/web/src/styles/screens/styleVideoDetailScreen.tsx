import { SxProps } from "@mui/system";
import { Theme, alpha } from "@mui/material/styles";
import { shape } from "@bt/shared/design-system/index";

export const container: SxProps<Theme> = (theme) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
});

export const heroCard: SxProps<Theme> = (theme) => ({
  position: "relative",
  marginBottom: 3,
  borderRadius: shape.borderRadius.lg,
  overflow: "hidden",
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.95)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 22px 52px rgba(15, 23, 42, 0.08)",
});

export const heroMedia: SxProps = {
  height: { xs: 188, md: 240 },
};

export const videoFrame: SxProps = {
  width: "100%",
  aspectRatio: "16 / 9",
  borderRadius: shape.borderRadius.lg,
  overflow: "hidden",
  backgroundColor: "#000",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 52px rgba(15, 23, 42, 0.12)",
};

export const videoIframe: SxProps = {
  width: "100%",
  height: "100%",
  border: 0,
};

export const metaCard: SxProps<Theme> = (theme) => ({
  marginTop: 3,
  padding: { xs: 2, md: 2.5 },
  borderRadius: shape.borderRadius.md,
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.95)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
});

export const navigationAccordion: SxProps<Theme> = (theme) => ({
  marginTop: 3,
  overflow: "hidden",
  borderRadius: shape.borderRadius.md,
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.95)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
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
