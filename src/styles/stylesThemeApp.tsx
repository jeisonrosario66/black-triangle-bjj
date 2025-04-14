
  import { createTheme } from '@mui/system';

const themeApp = createTheme({
    palette: {
      background: {
        paper: '#fff',
      },
      text: {
        primary: '#173A5E',
        secondary: '#46505A',
      },
      action: {
        active: '#001E3C',
        deactivate: '#d32f2f',
      },
      success: {
        dark: '#009688',
      },
    },
  });


export default themeApp;