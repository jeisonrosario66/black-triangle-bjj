import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system";

const theme = themeApp.palette;

export const containerWindowViewnode: SxProps = {
  zIndex: 20,
  // position: "absolute",
  backgroundColor: theme.formStyles.containerBackgroundColor,
  width: "80vw",
  height: "100vh",
  // overflowY: "auto",
  paddingBottom: "60px",
};

export const windowViewCard: SxProps = {
  backgroundColor: theme.formStyles.cardBackgroundColor,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  paddingTop: "20px",
};
