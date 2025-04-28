import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system";
const theme = themeApp;

export const containerAddNodeWindow: SxProps = {
  color: theme.palette.text.primary,
  zIndex: 20,
  width: "100%",
  height: "100%",
  position: "absolute",
  backgroundColor: theme.palette.formStyles.containerBackgroundColor,
  overflow: "auto",
  top: 0,
  flexDirection: "column",
  justifyContent: "space-between",
  display: "flex",
};

export const logoContainer: SxProps = {
  padding: "2rem 0 ",
  backgroundColor: theme.palette.formStyles.containerBackgroundColor,
};