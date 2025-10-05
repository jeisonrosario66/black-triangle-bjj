import { createTheme } from "@mui/system";

const themeApp = createTheme({
  palette: {
    background: {
      paper: "#fff",
      form: "#f3f3f3",
      formInput: "#000",
    },
    text: {
      titleBig: "#173A5E",
      primary: "#fff",
      secondary: "#46505A",
      tertiary: "#171A1FFF",
      white: "#fff",
    },
    action: {
      progress: "#001E3C",
      success: "#1976d2",
      deactivate: "#d32f2f",
    },
    success: {
      dark: "#009688",
    },
    canvas: {
      canvasBackgraundColor: "#002",
    },
    buttons: {
      buttonHomeScreen: "#f1f1f1",
    },
    formStyles: {
      containerBackgroundColor: "#FAFAFBFF",
      cardBackgroundColor: "#f9f9f9",
      cardBoxShadow: "0 10px 30px rgba(0, 0, 0, 0.99)",
      buttonForm: "#001E3C",
      borderColor: "rgb(109, 109, 109)",
    },
    paletteBjj: {
      rojoVibrante: "#FF1E1E",
      azulMarino: "#002B5B",
      grisCarbon: "#1C1C1C",
      amarilloOro: "#FFC300",
      grisClaro: "#F5F5F5",
    },
    typography: {
      fontFamily: "poppins",
    },
  },
});

export default themeApp;
