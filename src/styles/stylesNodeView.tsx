import { SxProps } from "@mui/system";

export const containerYoutubeView: SxProps = {
  pointerEvents: "none",
  width: "100vw",
  height: "70vh",
  top: "0",
  "& div iframe": {
    width: "100%",
    height: "100%",
  },
};

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

