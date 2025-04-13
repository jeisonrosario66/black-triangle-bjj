
import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp;

const containerAddNodeWindow: React.CSSProperties ={
    color: theme.palette.text.primary,
    zIndex: 20,
    width: "100%",
    height: "100%",
    position: "absolute",
    background: "#ffffff",
    overflow: "auto",
    top: 0,
    flexDirection: "column",
    justifyContent: "space-between",
    display: "flex",
  };

export {containerAddNodeWindow}