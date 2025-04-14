import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system";
import React from "react";

const theme = themeApp;

const containerBoxStep: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  alignItems: "center",
};

const formPosition: React.CSSProperties = {
  backgroundColor: "#f1f1f1",
  padding: 20,
  borderRadius: 2,
  border: "1px solid #ccc",
  marginTop: "20px",
};

const formLabel: React.CSSProperties = {
  color: theme.palette.text.secondary,
};


const formSelect = (isNot1Step2: boolean): SxProps => ({
  color: isNot1Step2 ? theme.palette.action.deactivate : theme.palette.text.primary,
  border: `1px solid ${isNot1Step2 ? theme.palette.action.deactivate : "grey"}`,
  borderRadius: 1,
  "&.Mui-focused": {
    borderColor: "blue",
    boxShadow: "none",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
});

const boxFormSelect = (isNot1Step2: boolean): SxProps => ({
  display: "flex",
  flexDirection: "column-reverse",
  "& .MuiTypography-root": {
    fontSize: "0.75rem",
    textAlign:"center",
    display: isNot1Step2? "block": "none",
    color: theme.palette.action.deactivate,
    marginTop: "3px",
    fontWeight:400,


  },
})
export { containerBoxStep, formPosition, formLabel, formSelect,boxFormSelect };




// MenuItem → "MuiMenuItem-root"

// Select → "MuiSelect-root"

// Typography → "MuiTypography-root"

// Button → "MuiButton-root"

// OutlinedInput → "MuiOutlinedInput-notchedOutline"