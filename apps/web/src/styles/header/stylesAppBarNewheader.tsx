import type { SxProps } from "@mui/system";
import { alpha, type Theme } from "@mui/material/styles";

export const appBar: SxProps<Theme> = (theme) => ({
  background: alpha(theme.palette.background.default, 0.92),
  borderBottom: `1px solid ${theme.palette.outlineVariant}`,
  backdropFilter: "blur(18px)",
});

export const toolbarContainer: SxProps = {
  display: "flex",
  alignItems: "center",
};

export const brandButton: SxProps = {
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  flexGrow: 1,
  cursor: "pointer",
  borderRadius: 2,
  mr: 1,
  py: 0.5,
  "&:hover": {
    opacity: 0.96,
  },
};

export const brandLogo: SxProps = {
  mr: 1,
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
};

export const brandLogoImage: SxProps = {
  display: "block",
  width: { xs: 24, sm: 28 },
  height: "auto",
};

export const brandWordmark: SxProps<Theme> = (theme) => ({
  display: "block",
  width: { xs: "min(44vw, 122px)", sm: 150, md: 170 },
  maxWidth: "100%",
  height: "auto",
  minWidth: 0,
  overflow: "hidden",
  pr: 1,
  filter: `drop-shadow(0 0 12px ${alpha(theme.palette.primary.main, 0.1)})`,
});
