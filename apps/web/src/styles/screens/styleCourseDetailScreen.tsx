import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
// import { shape } from "@bt/shared/design-system/index";

export const container: SxProps<Theme> = (Theme) => ({
  height: "100vh",
  padding: 3,
  backgroundColor: Theme.palette.background.default,
  });
