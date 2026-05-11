import { shape } from "@bt/shared/design-system";
import { alpha, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system";

export const screen: SxProps<Theme> = (theme) => ({
  "--bt-app-header-offset": { xs: "126px", md: "76px" },
  position: "relative",
  minHeight: "100dvh",
  backgroundColor: theme.palette.background.default,
  overflow: "hidden",
});

export const overlayPanel: SxProps<Theme> = (theme) => ({
  position: "absolute",
  top: { xs: 142, md: 92 },
  left: "50%",
  transform: "translateX(-50%)",
  width: "min(calc(100% - 32px), 560px)",
  zIndex: 12,
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
  padding: { xs: 1.5, md: 2 },
  borderRadius: shape.borderRadius.xl * 2,
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.96)}`,
  background: `
    linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.76)} 0%, ${alpha(theme.palette.surfaceContainerHigh, 0.92)} 100%)
  `,
  backdropFilter: "blur(18px)",
  boxShadow: "0 18px 42px rgba(0, 0, 0, 0.34)",
});

export const eyebrow: SxProps<Theme> = (theme) => ({
  color: alpha(theme.palette.primary.light, 0.92),
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
});

export const title: SxProps<Theme> = {
  color: alpha("#F8FAFC", 0.96),
  fontSize: { xs: "1.05rem", md: "1.28rem" },
  lineHeight: 1.1,
  fontWeight: 800,
  textWrap: "balance",
};

export const description: SxProps<Theme> = {
  color: alpha("#E2E8F0", 0.8),
  fontSize: { xs: "0.84rem", md: "0.92rem" },
  lineHeight: 1.45,
  maxWidth: 520,
};
