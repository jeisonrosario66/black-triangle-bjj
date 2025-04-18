import { SxProps } from "@mui/system";
import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp;

export const containerNodeView:SxProps = {
    display: "flex",
            flexDirection: "column",
            zIndex: "10",
            position: "absolute",
            boxShadow: "0 0 10px rgb(247, 236, 236)",
            backgroundColor:theme.palette.formStyles.containerBackgroundColor,
} 

export const containerYoutubeView:SxProps = {
    pointerEvents: "none",
    width: "90vw",
    height: "70vh",
    "& div iframe": {
      width: "100%",
      height:"100%"
    }}