import { SxProps } from "@mui/system";

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
