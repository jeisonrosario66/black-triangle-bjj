import { SxProps } from "@mui/system";
import themeApp from "@src/styles/stylesThemeApp";
import { darken, Typography } from "@mui/material";
const theme = themeApp;

export const containerPanel: SxProps = {
  maxWidth: "1300px",
  minWidth: "500px",
  margin: "0 auto",
  height: "calc(100vh - 16px)",
};

export const groupPanelTitle: SxProps = {
  margin: "1rem 0 0 1rem",
};

export const groupPanel: SxProps = {
  color: themeApp.palette.text.primary,
  borderRadius: "7px 0 0 7px",
};

// ------- CategoriySelector ---------
export const groupNames: SxProps = {
  margin: "0",
  color: themeApp.palette.text.tertiary,

  "&& .MuiButtonBase-root": {
    margin: "2px 10px",
    padding: "4px 12px",
    borderRadius: "5px",
  },
  "&& .MuiListItemText-root .MuiTypography-root": {
    fontWeight: 600,
  },
  "&& .MuiListItemButton-root.Mui-selected": {
    backgroundColor: themeApp.palette.action.success,
    color: themeApp.palette.text.primary,
  },
  "&& .MuiButtonBase-root:hover": {
    backgroundColor: darken(themeApp.palette.action.success, 0.7),
    color: themeApp.palette.text.primary,
  },
  "&& .MuiTypography-root": {
    fontFamily: themeApp.palette.typography.fontFamily,
  },
};

// ------- SubcategoryList ---------
export const subGroupPanel: SxProps = {
  backgroundColor: themeApp.palette.background.form,
  color: themeApp.palette.text.primary,
  borderRadius: "0 7px 7px 0",
  border: "1px solid #0a0a22",
  padding: "1.4rem 1rem 1rem 1rem",
  "&& h6": {
    color: "black",
    fontSize: "1.9rem",
  },
};

export const gridContainer: SxProps = {
  // alignItems: "stretch",

  flexDirection: "column",
  color: themeApp.palette.text.tertiary,

  "& .buttonItemSelector": {
    border: `1px solid ${themeApp.palette.formStyles.borderColor}`,
    borderRadius: "5px",
    color: themeApp.palette.text.tertiary,
    marginBottom: "1rem",
  },
  "& .buttonItemSelector:hover": {
    color: themeApp.palette.text.primary,
    backgroundColor: darken(themeApp.palette.action.success, 0.7),
  },
  "& .buttonItemSelector.Mui-selected": {
    backgroundColor: themeApp.palette.action.success,
    color: themeApp.palette.text.primary,
  },
  "& .MuiTypography-root": {
    fontWeight: 500,
    fontFamily: theme.palette.typography.fontFamily,
  },
};

// export const gridItemImage: SxProps = {
//   width: "70%",
//   objectFit: "cover",
//   display: "flex",
//   margin: "auto",
// };
