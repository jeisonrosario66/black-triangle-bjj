import themeApp from "@src/styles/stylesThemeApp";
const colorButton = themeApp.palette.buttons.buttonHomeScreen
export const buttonStyle: React.CSSProperties = {
  position: 'absolute',
  top: "30px",
  left: "30px",
  zIndex: 10,
  display: 'flex',
  color: colorButton,
  borderColor: colorButton,
  width: "150px",
  height: "60px",
};
