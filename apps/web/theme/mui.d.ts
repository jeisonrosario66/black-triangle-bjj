import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    primary: string;
    /* ===== Core surfaces (MD3 compatible) ===== */
    surface: string;
    surfaceVariant: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;

    /* ===== Text / on colors ===== */
    onSurface: string;
    onSurfaceVariant: string;

      
    /* ===== Borders / dividers ===== */
    outline: string;
    outlineVariant: string;

    /* ===== Brand / semantic ===== */
    brandPrimary: string;
    brandSecondary: string;
  }

  interface PaletteOptions {
    primary?: string;
    surface?: string;
    surfaceVariant?: string;
    surfaceContainer?: string;
    surfaceContainerHigh?: string;
    surfaceContainerHighest?: string;

    onSurface?: string;
    onSurfaceVariant?: string;

    success?: string;
    warning?: string;
    error?: string;
    info?: string;

    outline?: string;
    outlineVariant?: string;

    brandPrimary?: string;
    brandSecondary?: string;
  }
}
