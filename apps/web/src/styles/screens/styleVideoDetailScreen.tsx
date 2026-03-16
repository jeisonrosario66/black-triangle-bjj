import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { shape } from "@bt/shared/design-system/index";

export const container: SxProps<Theme> = (theme) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
});

export const videoFrame: SxProps = {
  width: "100%",
  aspectRatio: "16 / 9",
  borderRadius: shape.borderRadius.md,
  overflow: "hidden",
  backgroundColor: "#000",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
};

export const videoIframe: SxProps = {
  width: "100%",
  height: "100%",
  border: 0,
};

export const descriptionBox: SxProps = {
  marginTop: 2,
};
