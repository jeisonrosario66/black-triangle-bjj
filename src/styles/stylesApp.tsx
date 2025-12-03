import { GlobalStyles } from "@mui/material";
import themeApp from "@src/styles/stylesThemeApp";

const fontFamily = themeApp.palette.typography.fontFamily;

export const globalStyles = (
  <GlobalStyles
    styles={{
      html: {
        margin: 0,
        padding: 0,
        overflow: "hidden",
        width: "100vw",
        height: "100vh",
      },
      body: {
        margin: 0,
        padding: 0,
        overflow: "hidden",
        width: "100vw",
        height: "100vh",
      },
      "#root": {
        margin: 0,
        padding: 0,
        overflow: "hidden",
        width: "100vw",
        height: "100vh",

        fontFamily: fontFamily,
      },
    }}
  />
);

export const appContainer = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const canvasContainer = {
  width: "100vw",
  height: "100vh",
};
