import { Box, Typography } from "@mui/material";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system";
import { useState } from "react";

import { surfaceRecipes } from "@bt/shared/design-system";

type EditorialImagePanelProps = {
  src?: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  objectPosition?: string;
  sx?: SxProps<Theme>;
};

/**
 * Panel visual reutilizable para piezas editoriales y de marketing.
 * Prioriza imagen real cuando existe el asset y mantiene un fallback elegante
 * con overlays y patrón técnico para que la UI no dependa del archivo.
 */
export default function EditorialImagePanel({
  src,
  alt,
  eyebrow,
  title,
  description,
  objectPosition = "center",
  sx,
}: EditorialImagePanelProps) {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  return (
    <Box
      sx={[
        {
          ...surfaceRecipes.hero(theme),
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: 220, md: 280 },
          background: `
            radial-gradient(circle at 16% 18%, ${alpha(theme.palette.primary.main, 0.24)} 0%, transparent 26%),
            radial-gradient(circle at 82% 18%, ${alpha("#FFFFFF", 0.06)} 0%, transparent 20%),
            linear-gradient(140deg, #080808 0%, #101010 50%, #191919 100%)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(${alpha("#FFFFFF", 0.05)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha("#FFFFFF", 0.05)} 1px, transparent 1px),
              linear-gradient(${alpha(theme.palette.primary.main, 0.08)} 2px, transparent 2px),
              linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 2px, transparent 2px)
            `,
            backgroundSize: "24px 24px, 24px 24px, 120px 120px, 120px 120px",
            opacity: 0.28,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {src && !hasError ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition,
            filter: "saturate(0.94) contrast(1.04) brightness(0.9)",
          }}
        />
      ) : null}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(180deg, ${alpha("#020617", 0.06)} 0%, ${alpha("#020617", 0.18)} 28%, ${alpha("#020617", 0.82)} 100%)
          `,
        }}
      />

      {eyebrow || title || description ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "flex-end",
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Box sx={{ maxWidth: 420 }}>
            {eyebrow ? (
              <Typography
                sx={{
                  mb: 0.9,
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: alpha(theme.palette.primary.main, 0.96),
                }}
              >
                {eyebrow}
              </Typography>
            ) : null}

            {title ? (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.05,
                  textWrap: "balance",
                  textShadow: "0 10px 28px rgba(2, 6, 23, 0.46)",
                }}
              >
                {title}
              </Typography>
            ) : null}

            {description ? (
              <Typography
                sx={{
                  mt: 1,
                  color: alpha("#F7F1E8", 0.88),
                  maxWidth: 380,
                  textShadow: "0 8px 18px rgba(2, 6, 23, 0.42)",
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
