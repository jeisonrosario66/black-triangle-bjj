import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { shape } from "@bt/shared/design-system/index";

export const page: SxProps<Theme> = (theme) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
});

export const progressCard: SxProps = {
  borderRadius: shape.borderRadius.md,
};

export const progressContent: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export const cardTitleStyle: SxProps = {
  fontWeight: 600,
};

export const cardLabelStyle: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
});

export const progressBar: SxProps = {
  mt: 0.5,
  mb: 1,
};

export const cardBottomStyle: SxProps = {
  width: "100%",
  borderRadius: shape.borderRadius.xs,
  alignSelf: "flex-start",
};

export const sectionAction: SxProps<Theme> = (theme) => ({
  borderColor: theme.palette.outline,
  color: theme.palette.text.primary,
});

export const routeCard: SxProps = {
  overflow: "hidden",
};

export const routeHeader: SxProps = {
  pb: 1,
};

export const routeMeta: SxProps<Theme> = (theme) => ({
  fontSize: "0.8rem",
  color: theme.palette.text.secondary,
});

export const cardRouteButtom: SxProps<Theme> = (theme) => ({
  justifyContent: "flex-start",
  color: theme.palette.text.primary,
  fontSize: "0.85rem",
  py: 1.2,
});

export const systemCard: SxProps = {
  borderRadius: shape.borderRadius.md,
};

export const cardExplorerButtom: SxProps<Theme> = (theme) => ({
  fontSize: "0.85rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.surfaceVariant,
  borderRadius: shape.borderRadius.md,
  py: 1.2,
});
