import { SxProps, Theme } from "@mui/material";

/** Contenedor principal de la ventana de configuración */
export const containerConfigWindow: SxProps<Theme> = (theme) => ({
  width: { xs: "92vw", md: "720px" },
  height: { xs: "90vh", md: "80vh" },
  padding: "2rem",
  backgroundColor: theme.palette.surface,
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 2
      : theme.shape.borderRadius,
  border: `1px solid ${theme.palette.outlineVariant}`,
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 10,
  overflow: "auto",
});

/** Espaciado y formato general de los formularios */
export const formGeneral: SxProps<Theme> = {
  marginBottom: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
};

/** Contenedor de la lista de sistemas disponibles */
export const selectSystemPaper: SxProps<Theme> = {
  width: "100%",
  maxHeight: 320,
  overflowY: "auto",
  borderRadius: 8,
};

/** Estilo dinámico de cada elemento de sistema (seleccionado / no seleccionado) */
export const selectSystemItem = (selected: boolean): SxProps<Theme> => ({
  borderRadius: 10,
  marginBottom: "0.25rem",
  transition: "all 0.2s ease",
  backgroundColor: selected ? "rgba(25, 118, 210, 0.08)" : "transparent",
  "&:hover": {
    backgroundColor: selected
      ? "rgba(25, 118, 210, 0.12)"
      : "rgba(15, 23, 42, 0.04)",
  },
  "& .MuiListItemText-root": {
    fontWeight: selected ? 600 : 500,
  },
});
