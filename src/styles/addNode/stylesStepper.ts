import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system";
const theme = themeApp;

export const containerStepper: SxProps = {
  paddingLeft: "1rem",
  paddingRight: "1rem",
  borderTop: `1px solid ${theme.palette.formStyles.borderColor}`,
};

export const nextButton: SxProps = {
  display: "flex",
  alignItems: "center",
  flexDirection: "row-reverse",
};
