
  import { createTheme } from '@mui/system';

const themeApp = createTheme({
    palette: {
      background: {
        paper: '#fff',
        form:"#f3f3f3",
        formInput:"#000",
      },
      text: {
        titleBig: "#173A5E",
        primary: '#fff',
        secondary: '#46505A',
        white:"#fff"
      },
      action: {
        progress: '#001E3C',
        success: '#1976d2',
        deactivate: '#d32f2f',
      },
      success: {
        dark: '#009688',
      },
      canvas: {
        canvasBackgraundColor:"#002",
      },
      buttons: {
        buttonHomeScreen: "#f1f1f1",
      },
      formStyles: {
        containerBackgroundColor: "#d1d1d1",
        cardBackgroundColor: "#f9f9f9",
        cardBoxShadow: "0 10px 30px rgba(0, 0, 0, 0.99)",
        buttonForm: "#001E3C",
        borderColor: "rgb(109, 109, 109)",
      }
    },
  });


export default themeApp;