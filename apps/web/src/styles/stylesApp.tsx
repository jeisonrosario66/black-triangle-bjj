import { GlobalStyles } from "@mui/material";
import type { CSSProperties } from "react";
import themeApp from "@src/styles/stylesThemeApp";

const fontFamily = themeApp.palette.typography.fontFamily;

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
  flex: "1 1 auto",
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
};

export const canvasContainer: CSSProperties = {
  position: "relative",
  flex: "1 1 auto",
  width: "100%",
  height: "100%",
};
