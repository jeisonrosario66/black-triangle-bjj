import { SxProps } from "@mui/system";

import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp;

export const containerControls: SxProps = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  mt: 2,
  alignItems: "center",
  "& .MuiPaper-root": { margin: "1rem 0" },
};

export const containerProgressBar: SxProps = { px: 2, mb: 1, width: "95%" };

export const progressBar: SxProps = {
  height: 8,
  borderRadius: 5,
  backgroundColor: "#eee",
  cursor: "pointer",
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#1976d2",
  },
};

export const containerPlayerControls: SxProps = {
  p: 1,
  borderRadius: "12px",
  backgroundColor: theme.palette.formStyles.cardBackgroundColor,
};

export const iconsPlayer: SxProps = {
  bgcolor: "white",
  border: `1px solid ${theme.palette.formStyles.borderColor}`,
  "&:hover": { bgcolor: "#e0e0e0" },
};
