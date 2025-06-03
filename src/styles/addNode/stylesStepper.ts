import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system"
const theme = themeApp;

export const containerStepper: SxProps = {
    paddingLeft: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    backgroundColor: theme.palette.formStyles.cardBackgroundColor,
    borderTop: `2px solid ${theme.palette.formStyles.borderColor}`,
    marginTop: "1rem",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    boxShadow: theme.palette.formStyles.cardBoxShadow,
    width:"400px",
    margin:"0 auto",
}