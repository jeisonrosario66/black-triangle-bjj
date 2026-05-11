import { GlobalStyles } from "@mui/material";
import type { CSSProperties } from "react";
import themeApp from "@src/styles/stylesThemeApp";

const fontFamily = themeApp.palette.typography.fontFamily;
const viewportHeight = "calc(100dvh - var(--bt-app-header-offset, 0px))";

export const globalStyles = (
  <GlobalStyles
    styles={{
      html: {
        margin: 0,
        padding: 0,
        overflow: "hidden",
        width: "100%",
        height: "100dvh",
      },
      body: {
        margin: 0,
        padding: 0,
        overflow: "hidden",
        width: "100%",
        height: "100dvh",
      },
      "#root": {
        margin: 0,
        padding: 0,
        overflow: "hidden",
        width: "100%",
        height: "100dvh",

        fontFamily: fontFamily,
      },
    }}
  />
);

export const appContainer: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  width: "100%",
  height: viewportHeight,
  overflow: "hidden",
};

export const canvasContainer: CSSProperties = {
  width: "100%",
  height: "100%",
};
