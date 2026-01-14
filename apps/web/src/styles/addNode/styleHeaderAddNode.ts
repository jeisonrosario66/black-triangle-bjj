import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system";
const theme = themeApp;

let heightVariable = "30px";

export const containerHeaderAddNode: SxProps = {
  top: "0px",
  width: "100%",
  height: heightVariable,
  position: "absolute",
  margin: "10px 0",
  display: "flex",
    };

export const headerTitle: SxProps = {
  fontFamily: "Poppins",
  margin: "auto 0",
  fontSize: "14px",
  lineHeight: "22px",
  borderTop: `4px solid ${theme.palette.paletteBjj.rojoVibrante}`,
  borderBottom: `4px solid ${theme.palette.paletteBjj.rojoVibrante}`,
  color: "#000",
};

export const logoContainer: SxProps = {
  "&& img": {
    height: heightVariable,
    margin: "0 15px",
  },
};

export const closeButton: SxProps = {
  backgroundColor: "rgba(239,239,239,0.9)",
  borderRadius: "50%",
  width: heightVariable,
  height: heightVariable,
  ml: "auto",
  mr: "15px",
  "&:hover": {
    backgroundColor: theme.palette.paletteBjj.rojoVibrante,
    "& svg": { color: "white" },
  },
  color: "rgba(0,0,0,0.54)",
};
