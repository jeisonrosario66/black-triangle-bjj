import { Box, Container } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  sx?: SxProps<Theme>;
}

/**
 * Contenedor base de página.
 * Unifica padding, ancho y fondo para mantener consistencia visual.
 */
export default function PageContainer({
  children,
  maxWidth = "lg",
  sx,
}: PageContainerProps) {
  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 4 }, ...sx }}>
        {children}
      </Container>
    </Box>
  );
}
