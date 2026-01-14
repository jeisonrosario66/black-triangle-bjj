import { SxProps } from "@mui/system";
import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp.palette;
const textColor = theme.text;

export const containerlogo: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "1rem",
};
export const title: SxProps = {
  color: textColor.titleBig,
  fontSize: "1.2rem",
  lineHeight: "1",
  fontWeight: 600,
  fontFamily: "Poppins",
  fontStyle: "italic",
};
export const logo = {
  width: "50px",
  marginRight: "20px",
};
