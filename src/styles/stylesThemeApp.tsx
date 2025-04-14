
  import { createTheme } from '@mui/system';

const themeApp = createTheme({
    palette: {
      background: {
        paper: '#fff',
        form:"#f3f3f3",
        formInput:"#fff",
      },
      text: {
        primary: '#173A5E',
        secondary: '#46505A',
      },
      action: {
        progress: '#001E3C',
        success: '#1976d2',
        deactivate: '#d32f2f',
      },
      success: {
        dark: '#009688',
      },
    },
  });


export default themeApp;