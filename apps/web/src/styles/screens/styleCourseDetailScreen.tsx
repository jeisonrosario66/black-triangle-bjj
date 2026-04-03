import { SxProps } from "@mui/system";
import { Theme, alpha } from "@mui/material/styles";
import { shape } from "@bt/shared/design-system/index";

export const container: SxProps<Theme> = (theme) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
});

export const heroCard: SxProps<Theme> = (theme) => ({
  position: "relative",
  borderRadius: shape.borderRadius.lg,
  overflow: "hidden",
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.95)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 22px 52px rgba(15, 23, 42, 0.08)",
});

export const heroMedia: SxProps = {
  height: { xs: 220, md: 340 },
};

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
  marginTop: 3,
  padding: { xs: 2, md: 2.5 },
  borderRadius: shape.borderRadius.md,
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.95)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.92),
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.05)",
});

export const modulesAccordion: SxProps<Theme> = (theme) => ({
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

export const moduleList: SxProps = {
  paddingTop: 1,
};
