import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system";
const theme = themeApp;

export const tabGroupContainer: SxProps = {
  width: "100%",
  display: "flex",
  '& [role="tabpanel"]': {
    maxHeight: "60vh",
    overflow: "auto",
  },
};

export const tabs: SxProps = {
  borderRight: 1,
  borderColor: theme.palette.formStyles.borderColor,
  minWidth: "120px",

};

export const tab: SxProps = {
  fontWeight: "800",
  borderBottom: `1px solid ${theme.palette.formStyles.borderColor}`,
};


export const toggleButton: SxProps = {
  backgroundColor: "#fff",
  color: theme.palette.text.secondary,
  width: "100%",
  marginBottom: "5px",
  border: `1px solid ${theme.palette.formStyles.borderColor}`,
  // Estilos cuando está seleccionado
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.success,
    color: theme.palette.text.primary,
    borderColor: theme.palette.formStyles.borderColor,
  },

  // Estilos al hacer hover cuando está seleccionado
  "&.Mui-selected:hover": {
    backgroundColor: "primary.dark",
  },
};

export const itemICon = (data: string | number, selectedValue: string| null): SxProps => {
  return {
    color: data == selectedValue ? "#fff" : theme.palette.text.secondary,
  };
};
