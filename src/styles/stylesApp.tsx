import { GlobalStyles } from "@mui/material";

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

        fontFamily: "Poppins, system-ui, Avenir, Helvetica, Arial, sans-serif",
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
