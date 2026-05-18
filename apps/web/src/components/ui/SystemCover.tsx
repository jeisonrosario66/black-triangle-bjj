import { getCoverPalette } from "@bt/shared/context";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { shape } from "@bt/shared/design-system/index";
import { resolveStorageAssetUrl } from "@src/utils/resolveStorageAssetUrl";

type SystemCoverVariant = "hero" | "card" | "list" | "header" | "home";
type CoverOrientation = "portrait" | "landscape" | "square";

interface SystemCoverProps {
  title: string;
  eyebrow?: string;
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
    case "home":
      return {
        titleVariant: "h3" as const,
        titleSize: { xs: "1.2rem", md: "2rem" },
        subtitleSize: "0.8rem",
        coachSize: "0.95rem",
        countSize: "0.82rem",
        padding: { xs: 2, md: 3 },
        badgeSpacing: 1,
        sectionGap: { xs: 2.25, md: 3 },
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
  eyebrow,
  subtitle,
  coach,
  coverUrl,
  videoCount,
  showVisitedIndicator = false,
  variant = "card",
}: SystemCoverProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [imageReady, setImageReady] = useState(false);
  const [coverOrientation, setCoverOrientation] = useState<CoverOrientation>("landscape");
  const seed = [title, subtitle, coach].filter(Boolean).join("-");
  const palette = getCoverPalette(seed);
  const variantStyles = getVariantStyles(variant);
  const resolvedCoverUrl = resolveStorageAssetUrl(coverUrl);
  const useImage = shouldUseImage(resolvedCoverUrl);
  const debugLabel = [title, subtitle, coach].filter(Boolean).join(" | ");
  const isPortrait = coverOrientation === "portrait";
  const isHeader = variant === "header";
  const isHeaderLike = variant === "header" || variant === "list";
  const isHome = variant === "home";
  const showInlineVideoCount = !isHome && (variant === "card" || variant === "list");
  const showTopVideoCount = !isHome && !showInlineVideoCount;

  const posterLayout = isHeaderLike
    ? {
        width: isHeader
          ? isPortrait
            ? { xs: "22%", md: "18%" }
            : { xs: "34%", md: "26%" }
          : isPortrait
            ? { xs: "28%", md: "24%" }
            : { xs: "42%", md: "34%" },
        maxWidth: isHeader ? (isPortrait ? 96 : 132) : isPortrait ? 112 : 148,
        insetInlineEnd: isHeader ? { xs: 6, md: 10 } : { xs: 10, md: 14 },
        insetBlockStart: { xs: 10, md: 14 },
        insetBlockEnd: { xs: 10, md: 14 },
      }
    : isHome
      ? {
          width: isPortrait ? { xs: "24%", sm: "26%", md: "24%" } : { xs: "36%", sm: "38%", md: "34%" },
          maxWidth: isPortrait ? 120 : 180,
          insetInlineEnd: { xs: 10, sm: 12, md: 18 },
          insetBlockStart: { xs: 10, sm: 12, md: 18 },
          insetBlockEnd: { xs: 10, sm: 12, md: 18 },
        }
      : {
          width: isPortrait ? { xs: "34%", md: "30%" } : { xs: "52%", md: "46%" },
          maxWidth: isPortrait ? 200 : 340,
          insetInlineEnd: { xs: 14, md: 22 },
          insetBlockStart: { xs: 14, md: 20 },
          insetBlockEnd: { xs: 14, md: 20 },
        };

  const homeTextMaxWidth = useImage
    ? isPortrait
      ? { xs: "72%", sm: "68%", md: "66%" }
      : { xs: "60%", sm: "56%", md: "52%" }
    : { xs: "100%", md: "68%" };

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
              : isHome
                ? `linear-gradient(180deg, ${alpha("#020617", 0.14)} 0%, ${alpha("#020617", 0.26)} 32%, ${alpha("#020617", 0.82)} 100%)`
              : `linear-gradient(180deg, transparent 0%, ${alpha("#020617", 0.2)} 45%, ${alpha("#020617", 0.76)} 100%)`,
        },
      }}
    >
      {useImage ? (
        <>
          <Box
            component="img"
            src={resolvedCoverUrl}
            alt={title}
            onLoad={(event) => {
              const target = event.currentTarget;
              const ratio = target.naturalWidth / target.naturalHeight;
              setCoverOrientation(ratio < 0.9 ? "portrait" : ratio > 1.1 ? "landscape" : "square");
              setImageReady(true);
            }}
            onError={() => {
              setImageReady(false);
              console.error("Cover image failed to load", {
                system: debugLabel,
                originalCoverUrl: coverUrl,
                resolvedCoverUrl,
              });
            }}
            sx={{
              position: "absolute",
              inset: -22,
              width: "calc(100% + 44px)",
              height: "calc(100% + 44px)",
              objectFit: "cover",
              opacity: imageReady ? 0.42 : 0,
              transition: "opacity 240ms ease",
              filter: "blur(18px) saturate(0.88) contrast(1.02) brightness(0.74)",
              transform: isPortrait ? "scale(1.08)" : "scale(1.02)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              ...posterLayout,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: isHeader ? "flex-end" : "center",
              opacity: imageReady ? 1 : 0,
              transition: "opacity 240ms ease",
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: isHeaderLike ? shape.borderRadius.sm : shape.borderRadius.md,
                overflow: "hidden",
                border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
                boxShadow: isPortrait
                  ? "0 18px 38px rgba(2, 6, 23, 0.42)"
                  : "0 20px 40px rgba(2, 6, 23, 0.34)",
                background: alpha("#020617", 0.18),
                backdropFilter: "blur(10px)",
              }}
            >
              <Box
                component="img"
                src={resolvedCoverUrl}
                alt={title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: isHeader ? "right center" : "center",
                  display: "block",
                  background:
                    "linear-gradient(180deg, rgba(15, 23, 42, 0.06) 0%, rgba(15, 23, 42, 0.18) 100%)",
                }}
              />
            </Box>
          </Box>
        </>
      ) : null}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
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
            justifyContent: isHome ? "flex-start" : "space-between",
            gap: 1,
            flexWrap: variant === "header" ? "wrap" : "nowrap",
          }}
        >
          {isHome ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0.7,
              }}
            >
              {eyebrow ? (
                <Typography
                  variant="overline"
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: alpha("#F8FAFC", 0.72),
                  }}
                >
                  {eyebrow}
                </Typography>
              ) : null}

              <Typography
                sx={{
                  fontSize: variantStyles.subtitleSize,
                  fontWeight: 600,
                  color: alpha("#F8FAFC", 0.88),
                }}
              >
                {subtitle || t("components.systemCover.defaultSubtitle")}
              </Typography>
            </Box>
          ) : (
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
              {subtitle || t("components.systemCover.defaultSubtitle")}
            </Box>
          )}

          {!isHome ? (
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

              {showTopVideoCount && typeof videoCount === "number" ? (
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
                  {t("components.systemCover.videoCount", { count: videoCount })}
                </Box>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isHome ? { xs: 0.55, sm: 0.8, md: variantStyles.badgeSpacing } : variantStyles.badgeSpacing,
            maxWidth: isHome ? homeTextMaxWidth : undefined,
            minWidth: 0,
          }}
        >
          <Typography
            variant={variantStyles.titleVariant}
            sx={{
              fontWeight: 800,
              fontSize: isHome ? { xs: "1rem", sm: "1.15rem", md: "2rem" } : variantStyles.titleSize,
              lineHeight: isHome ? 1.08 : variant === "header" ? 1.08 : 1.02,
              maxWidth: isHome
                ? "100%"
                :
                variant === "list"
                  ? isPortrait
                    ? "68%"
                    : "58%"
                  : variant === "header"
                    ? isPortrait
                      ? "72%"
                      : "62%"
                    : isPortrait
                      ? "64%"
                      : "54%",
              textWrap: "balance",
              textShadow: isHome ? "none" : "0 10px 22px rgba(2, 6, 23, 0.42)",
              color: isHome
                ? alpha(theme.palette.primary.main, 0.96)
                : undefined,
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>

          {coach ? (
            <Typography
              sx={{
                fontSize: isHome ? { xs: "0.72rem", sm: "0.8rem", md: variantStyles.coachSize } : variantStyles.coachSize,
                fontWeight: isHome ? 500 : 600,
                letterSpacing: isHome ? "normal" : "0.08em",
                textTransform: isHome ? "none" : "uppercase",
                color: isHome
                  ? alpha("#F8FAFC", 0.8)
                  : alpha("#E2E8F0", 0.9),
                lineHeight: isHome ? 1.25 : undefined,
                overflowWrap: "anywhere",
              }}
            >
              {isHome ? coach : `Coach ${coach}`}
            </Typography>
          ) : null}

          {showInlineVideoCount && typeof videoCount === "number" ? (
            <Box
              sx={{
                display: "inline-flex",
                alignSelf: "flex-start",
                px: 1,
                py: 0.45,
                borderRadius: 999,
                fontSize: variantStyles.countSize,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: alpha("#F8FAFC", 0.9),
                backgroundColor: alpha(theme.palette.common.black, 0.26),
                border: `1px solid ${alpha("#FFFFFF", 0.14)}`,
                backdropFilter: "blur(8px)",
              }}
            >
              {t("components.systemCover.videoCount", { count: videoCount })}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
