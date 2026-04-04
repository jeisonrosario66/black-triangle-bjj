import type { SxProps } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import { alpha, styled, type Theme } from "@mui/material/styles";

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

export const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 999,
  backgroundColor: alpha(theme.palette.surfaceVariant, 0.92),
  border: `1px solid ${theme.palette.outlineVariant}`,
  boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}`,
  height: 42,
  minWidth: 132,
  width: "clamp(132px, 24vw, 280px)",
  display: "flex",
  alignItems: "center",
  marginRight: 10,
  transition: theme.transitions.create(["border-color", "box-shadow", "background-color"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": {
    backgroundColor: alpha(theme.palette.surfaceVariant, 1),
    borderColor: alpha(theme.palette.primary.main, 0.54),
  },
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
  },
  [theme.breakpoints.down("md")]: {
    width: "min(44vw, 176px)",
    height: 40,
    marginRight: 6,
  },
}));

export const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.primary,
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  "& .MuiInputBase-input::placeholder": {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("md")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
      fontSize: "0.95rem",
    },
  },
}));
