import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { shape } from "@bt/shared/design-system/index";

export const container: SxProps<Theme> = (theme) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
});

export const heroCard: SxProps = {
  position: "relative",
  borderRadius: shape.borderRadius.lg,
  overflow: "hidden",
};

export const heroMedia: SxProps = {
  height: { xs: 220, md: 340 },
  objectFit: "cover",
};

export const headerMetaRow: SxProps = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  marginTop: 1.5,
};

export const description: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  marginTop: 1,
  marginBottom: 3,
  maxWidth: 760,
});

export const moduleList: SxProps = {
  marginTop: 1,
};
