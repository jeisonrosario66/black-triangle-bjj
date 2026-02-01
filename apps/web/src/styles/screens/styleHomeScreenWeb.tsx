import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { shape } from "@bt/shared/design-system/index";

export const boxContainer: SxProps = {
  height: "100vh",
  width: "100vw",
};

export const sectionStyle: SxProps = {
  mt: 3,
  mb: 6,
};

export const dividerStyle: SxProps = {
  mb: 2,
};

export const cardStyle: SxProps<Theme> = (theme) => ({
  p: 2,
  backgroundColor: theme.palette.surface,
  borderRadius: theme.shape.borderRadius,
});

export const cardTitleStyle: SxProps = {
  mb: 1,
};

export const cardLabelStyle: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  mb: 1,
});

export const progressBar: SxProps = {
  mb: 2,
};

export const cardBottomStyle: SxProps = {
  width: "100%",
  borderRadius: shape.borderRadius.xs,
};

export const containerCardRow: SxProps = {
  display: "flex",
  flexDirection: {
    xs: "row",
    sm: "row",
  },
  justifyContent: "space-around",
  gap: 2,
};

export const cardColumn: SxProps = {
  backgroundColor: "transparent",
  width: "48%",
};

export const cardTopStyle: SxProps<Theme> = (theme) => ({
  backgroundColor: theme.palette.surface,
  p: 0.8,
  borderStartEndRadius: 4,
  borderStartStartRadius: 4,
  borderEndStartRadius: 0,
  borderEndEndRadius: 0,
});

export const cardRouteButtom: SxProps<Theme> = (theme) => ({
  justifyContent: "flex-start",
  color: theme.palette.text.primary,
});

export const cardExplorerButtom: SxProps<Theme> = (theme) => ({
  fontSize: "0.7rem",
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.surfaceVariant,
});

export const cardExplorerButtomCentered: SxProps = {
  mt: 3,
  mb: 4,
  ml: "auto",
  mr: "auto",
  maxWidth: 280,
};
