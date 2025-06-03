import { SxProps } from "@mui/system";
import themeApp from "@src/styles/stylesThemeApp";

const theme = themeApp;

export const containerBoxStep: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  maxHeight: "80vh",
  overflow: "auto",
  // padding: "1.3em",
};

export const barSearch: SxProps = {
  background: "red",
  height: "30px",
  position: "absolute",
  width: "100%",
  top: "0",
  display: "flex",
  flexDirection: "row",
};

export const resultSearchContainer: SxProps = {
  display: "grid",
  gridTemplateColumns: "repeat(1, 1fr)",
  "@media (min-width: 600px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  gap: 2,
  "& .MuiPaper-root": {
    width: "90%",
    margin: "0 auto",
  },
  "& .MuiCardContent-root": {
    padding: "0em 0.5em 1em 0.5em",
    display: "flex",
  },
  "& .MuiCardContent-root .MuiTypography-subtitle2": {
    fontSize: "0.8em",
    fontFamily: "Poppins",
  },
  "& .MuiCardContent-root .MuiTypography-body2": {
    fontSize: "0.6em",
    fontFamily: "Poppins",
  },
  "& .MuiCardContent-root .MuiCardMedia-root": {
    width: "2em",
    height: "2em",
    borderRadius: "50%",
    marginRight: "0.5em",
    marginTop: "auto",
    marginBottom: "auto",
  },
};

export const resultSearchCard = (videoSeleted: boolean): SxProps => ({
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  border: videoSeleted ? "2px solid red" : "none",
});

export const videoDuration: SxProps = {
  textAlign: "right",
  position: "relative",
  color: theme.palette.text.primary,
  bottom: " 2rem",
  right: "0.7rem",
  fontFamily: "Poppins",
};

export const videoAndDurationContainer: SxProps = {
  display: "flex",
  flexDirection: "column-reverse",
};
