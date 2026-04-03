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
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 52px rgba(15, 23, 42, 0.08)",
};

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
  marginTop: 1,
  marginBottom: 3,
  maxWidth: 760,
});

export const moduleList: SxProps = {
  marginTop: 1,
};
