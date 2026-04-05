import { getCoverPalette } from "@bt/shared/context";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import { shape } from "@bt/shared/design-system/index";

type SystemCoverVariant = "hero" | "card" | "list" | "header";

interface SystemCoverProps {
  title: string;
  subtitle?: string;
  coach?: string;
  coverUrl?: string;
  videoCount?: number;
  showVisitedIndicator?: boolean;
  variant?: SystemCoverVariant;
}

const getVariantStyles = (variant: SystemCoverVariant) => {
  switch (variant) {
    case "hero":
      return {
        titleVariant: "h3" as const,
        titleSize: { xs: "1.6rem", md: "2.6rem" },
        subtitleSize: "0.8rem",
        coachSize: "0.95rem",
        countSize: "0.82rem",
        padding: { xs: 2, md: 3 },
        badgeSpacing: 1,
        sectionGap: { xs: 2.25, md: 3 },
      };
    case "list":
      return {
        titleVariant: "subtitle2" as const,
        titleSize: "0.9rem",
        subtitleSize: "0.68rem",
        coachSize: "0.72rem",
        countSize: "0.68rem",
        padding: 1.25,
        badgeSpacing: 0.75,
        sectionGap: 1.25,
      };
    case "header":
      return {
        titleVariant: "h6" as const,
        titleSize: { xs: "1rem", md: "1.2rem" },
        subtitleSize: "0.68rem",
        coachSize: "0.76rem",
        countSize: "0.68rem",
        padding: { xs: 1.25, md: 1.5 },
        badgeSpacing: 0.45,
        sectionGap: { xs: 1.6, md: 1.85 },
      };
    default:
      return {
        titleVariant: "h6" as const,
        titleSize: { xs: "1.05rem", md: "1.2rem" },
        subtitleSize: "0.72rem",
        coachSize: "0.82rem",
        countSize: "0.72rem",
        padding: 2,
        badgeSpacing: 1,
        sectionGap: 2,
      };
  }
};

const shouldUseImage = (coverUrl?: string) =>
  Boolean(coverUrl && !coverUrl.includes("picsum.photos"));

/**
 * Cover visual reutilizable para sistemas y cursos.
 * Genera una portada determinística basada en el contenido del sistema y
 * usa imagen real solo cuando existe una portada curada distinta del placeholder.
 */
export default function SystemCover({
  title,
  subtitle,
  coach,
  coverUrl,
  videoCount,
  showVisitedIndicator = false,
  variant = "card",
}: SystemCoverProps) {
  const theme = useTheme();
  const [imageReady, setImageReady] = useState(false);
  const seed = [title, subtitle, coach].filter(Boolean).join("-");
  const palette = getCoverPalette(seed);
  const variantStyles = getVariantStyles(variant);
  const useImage = shouldUseImage(coverUrl);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: "inherit",
        color: "#F8FAFC",
        backgroundColor: palette.base,
        backgroundImage: `
          radial-gradient(circle at 18% 20%, ${alpha(palette.glow, 0.28)} 0%, transparent 30%),
          radial-gradient(circle at 85% 18%, ${alpha(palette.accent, 0.4)} 0%, transparent 34%),
          linear-gradient(135deg, ${palette.base} 0%, ${palette.edge} 45%, #0B0F14 100%)
        `,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${alpha("#FFFFFF", 0.06)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha("#FFFFFF", 0.06)} 1px, transparent 1px)
          `,
          backgroundSize:
            variant === "hero" ? "46px 46px" : variant === "header" ? "22px 22px" : "28px 28px",
          opacity: variant === "header" ? 0.18 : 0.24,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            variant === "header"
              ? `linear-gradient(180deg, ${alpha("#020617", 0.08)} 0%, ${alpha("#020617", 0.44)} 100%)`
              : `linear-gradient(180deg, transparent 0%, ${alpha("#020617", 0.2)} 45%, ${alpha("#020617", 0.76)} 100%)`,
        },
      }}
    >
      {useImage ? (
        <Box
          component="img"
          src={coverUrl}
          alt={title}
          onLoad={() => setImageReady(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imageReady ? 0.88 : 0,
            transition: "opacity 240ms ease",
            filter: "saturate(0.96) contrast(1.05)",
          }}
        />
      ) : null}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: variant === "header" ? "center" : "space-between",
          padding: variantStyles.padding,
          gap: variantStyles.sectionGap,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: variant === "header" ? "wrap" : "nowrap",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignSelf: "flex-start",
              px: 1,
              py: 0.5,
              borderRadius: shape.borderRadius,
              fontSize: variantStyles.subtitleSize,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: alpha("#F8FAFC", 0.92),
              backgroundColor: alpha(theme.palette.common.black, 0.22),
              border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
              backdropFilter: "blur(8px)",
            }}
          >
            {subtitle || "Black Triangle"}
          </Box>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              alignSelf: "flex-start",
            }}
          >
            {showVisitedIndicator ? (
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`,
                }}
              />
            ) : null}

            {typeof videoCount === "number" ? (
              <Box
                sx={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  px: 1,
                  py: 0.5,
                  borderRadius: 999,
                  fontSize: variantStyles.countSize,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: alpha("#F8FAFC", 0.94),
                  backgroundColor: alpha(theme.palette.common.black, 0.28),
                  border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                {videoCount} videos
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: variantStyles.badgeSpacing }}>
          <Typography
            variant={variantStyles.titleVariant}
            sx={{
              fontWeight: 800,
              fontSize: variantStyles.titleSize,
              lineHeight: variant === "header" ? 1.08 : 1.02,
              maxWidth:
                variant === "list"
                  ? "90%"
                  : variant === "header"
                    ? "100%"
                    : "80%",
              textWrap: "balance",
              textShadow: "0 10px 22px rgba(2, 6, 23, 0.42)",
            }}
          >
            {title}
          </Typography>

          {coach ? (
            <Typography
              sx={{
                fontSize: variantStyles.coachSize,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: alpha("#E2E8F0", 0.9),
              }}
            >
              Coach {coach}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
