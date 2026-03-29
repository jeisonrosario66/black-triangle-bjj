import { Box } from "@mui/material";
import { ReactNode } from "react";

interface SimpleGridProps {
  columns?: { xs: number; md?: number; lg?: number };
  gap?: number;
  children: ReactNode;
}

/**
 * Grid ligero basado en CSS Grid.
 * Evita dependencia de Grid2 y mantiene compatibilidad.
 */
export default function SimpleGrid({
  columns = { xs: 1, md: 2, lg: 3 },
  gap = 2,
  children,
}: SimpleGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: `repeat(${columns.xs}, minmax(0, 1fr))`,
          md: columns.md
            ? `repeat(${columns.md}, minmax(0, 1fr))`
            : undefined,
          lg: columns.lg
            ? `repeat(${columns.lg}, minmax(0, 1fr))`
            : undefined,
        },
        gap,
      }}
    >
      {children}
    </Box>
  );
}
