import { SxProps } from "@mui/system";
import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp.palette;

export const containerNodeView = (isAddNode: boolean): SxProps =>
  isAddNode
    ? {
        display: "flex",
        flexDirection: "column",
        zIndex: "20",
        position: "absolute",
        boxShadow: "0 0 10px rgb(247, 236, 236)",
        width: "100%",
        top: "0",
        height: "100vh",
      }
    : {
        display: "flex",
        flexDirection: "column",
        zIndex: "10",
        position: "absolute",
        boxShadow: "0 0 10px rgb(247, 236, 236)",
        height: "100vh",
      };

export const nodeViewScreenContainer: SxProps = {
  display: "flex",
  overflow: "auto",
  "& .typography": {
    fontFamily: theme.typography.fontFamily,
    fontWeight: "400",
    color: themeApp.palette.text.tertiary,
  },
  "& .typography.MuiTypography-subtitle2": {
    fontWeight: "200",
    color: themeApp.palette.text.secondary,
    fontSize: "0.7em",
  },
  "& .typography-brand-controls": {
    alignContent: "center",
    textAlign: {
      xs: "center",
    },
    fontSize: {
      xs: "0.8em",
      sm: "1em",
    },
    margin: {
      xs: "0",
      sm: "0 auto 0 0",
      md: "0 auto 0 0",
      lg: "0 auto 0 0",
    },
  },
};

export const containerYoutubeView: SxProps = {
  width: "100%",
  maxWidth: "960px",
  height: "100vh",
  padding: "0 40px",
  margin: "30px auto 0 auto",
  "& div iframe": {
    width: "100%",
    aspectRatio: "16 / 9",
    height: "auto",
  },
};

export const youtubeWrapper: SxProps = {
  position: "relative",
  width: "100%",
  paddingTop: "56.25%",
  background: "#000",
  borderRadius: "4px",
  overflow: "hidden",
  marginBottom: "25px",
  "& iframe": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
};

export const reproTitle: SxProps = {
  margin: "0px 0 15px 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  "& .first-page-icon": {
    width: "50px",
    height: "50px",
  },
};

export const playerControlContainer: SxProps = {
  width: "100%",
  "& #player-controls-descripcion,& #time-brand-preview ,& #time-brand": {
    marginBottom: "20px",
  },
  "& #time-brand-preview ,& #time-brand": {
    border: `1px solid ${theme.formStyles.borderColor}`,
    padding: "0 12px",
    display: "flex",
    flexDirection: {
      xs: "column",
      sm: "row",
      md: "row",
      lg: "row",
    },
    alignItems: {
      xs: "center",
      sm: "center",
    },
  },
  "& .time-brand-button": {
    display: "flex",
  },
  "& .time-brand-button button": {
    margin: {
      xs: "17px 16px 17px 0",
      sm: "17px 15px 17px 0",
      md: "17px 5px 17px 0",
      lg: "17px 17px 17px 0",
    },
  },
};
