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
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1400,
  overflow: "auto",
});

export const sectionCard: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: 1.1,
  padding: "1rem",
  marginBottom: "1.5rem",
  borderRadius: 16,
  border: `1px solid ${theme.palette.outlineVariant}`,
  background: `
    linear-gradient(180deg, ${theme.palette.surfaceContainerHigh} 0%, ${theme.palette.surfaceContainerHighest} 100%)
  `,
});

export const sectionEyebrow: SxProps<Theme> = (theme) => ({
  fontSize: "0.74rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
});

export const sectionBody: SxProps<Theme> = (theme) => ({
  marginBottom: "0.15rem",
  color: theme.palette.text.secondary,
});

export const metricCard: SxProps<Theme> = (theme) => ({
  flex: "1 1 0",
  minWidth: 0,
  padding: "0.95rem 1rem",
  borderRadius: 14,
  border: `1px solid ${theme.palette.outlineVariant}`,
  backgroundColor: theme.palette.surfaceContainerHigh,
});

export const metricLabel: SxProps<Theme> = (theme) => ({
  fontSize: "0.74rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
});

export const metricValue: SxProps<Theme> = {
  marginTop: "0.2rem",
  fontSize: "1.35rem",
  fontWeight: 700,
};

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
