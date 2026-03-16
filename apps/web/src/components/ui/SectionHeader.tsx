import { Box, Divider, Typography } from "@mui/material";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  withDivider?: boolean;
}

/**
 * Encabezado de sección reutilizable.
 * Provee jerarquía tipográfica y acciones alineadas.
 */
export default function SectionHeader({
  title,
  subtitle,
  action,
  withDivider = true,
}: SectionHeaderProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action ? <Box>{action}</Box> : null}
      </Box>
      {withDivider ? <Divider sx={{ mt: 2 }} /> : null}
    </Box>
  );
}
