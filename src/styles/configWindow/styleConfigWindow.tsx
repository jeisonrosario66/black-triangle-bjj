import { SxProps, Theme } from "@mui/material";

/** Contenedor principal de la ventana de configuración */
export const containerConfigWindow: SxProps<Theme> = {
  width: "80%",
  padding: "2rem",
  backgroundColor: "white",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  zIndex: "10",
};

/** Espaciado y formato general de los formularios */
export const formGeneral: SxProps<Theme> = {
  marginBottom: "2rem",
  display: "flex",
  flexDirection: "row",
  "& .MuiInputBase-root, .MuiFormControl-root": { width: "100%" },
  
};

/** Contenedor de la lista de sistemas disponibles */
export const selectSystemPaper: SxProps<Theme> = {
  width: "100%",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? "rgba(30,30,30,0.9)"
      : "rgba(255,255,255,0.9)",
  boxShadow: "inset 0 0 8px rgba(0,0,0,0.15)",
};

/** Estilo dinámico de cada elemento de sistema (seleccionado / no seleccionado) */
export const selectSystemItem = (selected: boolean): SxProps<Theme> => ({
  borderRadius: "10px",
  marginBottom: "0.25rem",
  transition: "all 0.25s ease",
  backgroundColor: selected ? "rgba(25, 118, 210, 0.1)" : "transparent",
  "&:hover": {
    backgroundColor: selected
      ? "rgba(25, 118, 210, 0.2)"
      : "rgba(255,255,255,0.05)",
    transform: "translateX(4px)",
  },
  "& .MuiListItemText-root": {
    fontWeight: selected ? 600 : 400,
    color: selected ? "primary.main" : "text.primary",
  },
});