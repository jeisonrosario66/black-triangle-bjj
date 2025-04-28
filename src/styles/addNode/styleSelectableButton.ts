import { SxProps } from "@mui/system";
import { darken } from "@mui/material/styles";

import themeApp from "@src/styles/stylesThemeApp";
export const theme = themeApp;

export const toggleButtonStyles: SxProps = {
  backgroundColor: "white",
  color: theme.palette.text.secondary,
  // Estilos cuando está seleccionado
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.success,
    color: theme.palette.text.primary,
    borderColor: theme.palette.formStyles.borderColor,
  },

  // Estilos al hacer hover cuando está seleccionado
  "&.Mui-selected:hover": {
    backgroundColor: darken(theme.palette.action.success, 0.2), 
  },
};

export const toggleButtonGroupStyles: SxProps = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 1.5, // Espacio entre botones
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    border: `2px solid ${theme.palette.formStyles.borderColor}`, // Quitar borde colapsado por defecto
    borderRadius: "8px !important", // Forzar bordes uniformes
  },
};