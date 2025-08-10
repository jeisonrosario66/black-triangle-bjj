import { SxProps } from "@mui/system";
import themeApp from "@src/styles/stylesThemeApp";
import { darken } from "@mui/material";

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
  backgroundColor: "#0a0a22",
  color: themeApp.palette.text.primary,
  borderRadius: "7px 0 0 7px",
};

// ------- CategoriySelector ---------
export const groupNames: SxProps = {
  margin: "0",
  "&& .MuiButtonBase-root": {
    margin: "2px 10px",
    padding: "4px 12px",
    borderRadius: "5px",
  },
  "&& .MuiListItemButton-root.Mui-selected": {
    backgroundColor: themeApp.palette.action.success,
  },
  "&& .MuiButtonBase-root:hover": {
    backgroundColor: darken(themeApp.palette.action.success, 0.7),
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
  alignItems: "stretch",
};

export const gridItem: SxProps = {
  display: "flex",
  "&& .MuiPaper-root": {
    p: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  "&& .MuiPaper-root:hover": {
    backgroundColor: darken(themeApp.palette.action.success, 0.1),
    cursor: "pointer",
  },
  ".MuiListItemText-secondary": {
    display: "-webkit-box",
    WebkitLineClamp: 2, // número de líneas visibles
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export const gridItemImage: SxProps = {
  width: "70%",
  objectFit: "cover",
  display: "flex",
  margin: "auto",
};
