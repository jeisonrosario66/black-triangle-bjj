import { SxProps } from "@mui/system";
import themeApp from "@src/styles/stylesThemeApp";
export const colorButton = themeApp.palette.buttons.buttonHomeScreen;

export const containerAccountMenu: SxProps = {
  display: "flex",
  alignItems: "center",
  textAlign: "center",
  position: "absolute",
  zIndex: 10,
  top: "30px",
  right: "30px",
};

export const containerAccountAvatar: SxProps = {
  width: 55,
  height: 55,
  backgroundColor: "transparent",
  border: `2px solid ${colorButton}`,
};

export const accountAvatarSvg: SxProps = {
  color: colorButton,
  fontSize: "2.5rem",
};
