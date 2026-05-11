import { alpha, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system";

type SwitcherVariant = "menu" | "panel";

type VariantState = {
  isActive: boolean;
  variant: SwitcherVariant;
};

export const switcherShell: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  width: "100%",
  padding: "6px",
  borderRadius: 18,
  border: `1px solid ${alpha(theme.palette.outlineVariant, 0.98)}`,
  background: `
    linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.96)} 0%, ${alpha(theme.palette.surfaceContainerHigh, 0.98)} 100%)
  `,
  boxShadow: `
    0 12px 24px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 ${alpha("#FFFFFF", 0.04)}
  `,
});

export const switcherButton = ({
  isActive,
  variant,
}: VariantState): SxProps<Theme> => (theme) => ({
  minWidth: 0,
  flex: 1,
  gap: variant === "menu" ? 0.8 : 0.7,
  justifyContent: "flex-start",
  height: variant === "menu" ? 42 : 44,
  paddingInline: theme.spacing(1.35),
  borderRadius: variant === "menu" ? 14 : 16,
  border: `1px solid ${isActive ? alpha(theme.palette.primary.main, 0.52) : alpha(theme.palette.outlineVariant, variant === "menu" ? 0.55 : 0.75)}`,
  background: isActive
    ? `
      linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)
    `
    : alpha(theme.palette.surfaceContainerHighest, variant === "menu" ? 0.34 : 0.46),
  color: isActive
    ? theme.palette.text.primary
    : alpha(theme.palette.text.secondary, 0.92),
  transition: "background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease",
  "&:hover": {
    backgroundColor: isActive
      ? alpha(theme.palette.primary.main, 0.18)
      : alpha(theme.palette.surfaceContainerHighest, 0.72),
    transform: "translateY(-1px)",
  },
});

export const switcherIcon = ({
  isActive,
  variant,
}: VariantState): SxProps<Theme> => (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: variant === "menu" ? 26 : 28,
  height: variant === "menu" ? 26 : 28,
  borderRadius: 10,
  color: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.92),
  backgroundColor: isActive
    ? alpha(theme.palette.primary.main, 0.14)
    : alpha(theme.palette.background.default, 0.4),
  "& .MuiSvgIcon-root": {
    fontSize: variant === "menu" ? "1rem" : "1.08rem",
  },
});

export const switcherLabel = ({
  isActive,
  variant,
}: VariantState): SxProps<Theme> => (theme) => ({
  fontSize: variant === "menu" ? "0.78rem" : "0.8rem",
  fontWeight: isActive ? 700 : 600,
  lineHeight: 1,
  whiteSpace: "nowrap",
  letterSpacing: "0.015em",
  color: isActive ? theme.palette.text.primary : alpha(theme.palette.text.secondary, 0.96),
});
