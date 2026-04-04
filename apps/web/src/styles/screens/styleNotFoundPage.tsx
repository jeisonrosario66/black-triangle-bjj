import type { SxProps } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

import { surfaceRecipes } from "@bt/shared/design-system";

export const page: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.page(theme),
});

export const pageContainer: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "calc(100vh - 88px)",
};

export const card: SxProps<Theme> = (theme) => ({
  ...surfaceRecipes.hero(theme),
  width: "100%",
  maxWidth: 720,
  padding: { xs: 3, md: 5 },
  background: `
    radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.16)} 0%, transparent 34%),
    linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.surfaceVariant, 0.88)} 100%)
  `,
});

export const iconWrap: SxProps<Theme> = (theme) => ({
  width: 68,
  height: 68,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(theme.palette.primary.main, 0.14),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.32)}`,
  boxShadow: `0 0 22px ${alpha(theme.palette.primary.main, 0.16)}`,
});

export const icon: SxProps<Theme> = (theme) => ({
  fontSize: 34,
  color: theme.palette.primary.main,
});

export const code: SxProps<Theme> = (theme) => ({
  color: theme.palette.primary.main,
  fontWeight: 800,
  fontSize: { xs: "0.92rem", md: "1rem" },
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  marginBottom: 1,
});

export const title: SxProps = {
  fontWeight: 800,
  lineHeight: 1.04,
  textWrap: "balance",
};

export const description: SxProps<Theme> = (theme) => ({
  maxWidth: 520,
  color: theme.palette.text.secondary,
  fontSize: { xs: "0.98rem", md: "1.04rem" },
  lineHeight: 1.7,
});
