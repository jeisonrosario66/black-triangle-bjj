import type { SxProps } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import { styled, type Theme } from "@mui/material/styles";

export const appBar: SxProps<Theme> = (theme) => ({
  background: theme.palette.surface,
  borderBottom: `1px solid ${theme.palette.outlineVariant}`,
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
    opacity: 0.92,
  },
};

export const brandLogo: SxProps = {
  mr: 1,
  display: "flex",
  alignItems: "center",
};

export const brandTitle: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.primary,
  fontSize: 19,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  pr: 1,
});

export const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 999,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.outline}`,
  boxShadow: `0 0 0 1px ${theme.palette.outlineVariant}`,
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
    backgroundColor: theme.palette.background.default,
    borderColor: theme.palette.primary.light,
  },
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px rgba(25, 118, 210, 0.16)`,
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
