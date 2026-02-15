import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
// import { shape } from "@bt/shared/design-system/index";



export const screen: SxProps<Theme> = (Theme) => ({ 
flex: 1,
padding: Theme.spacing(3),
backgroundColor: Theme.palette.background.default,
});
