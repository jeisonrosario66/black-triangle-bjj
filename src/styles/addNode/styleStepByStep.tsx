import themeApp from "@src/styles/stylesThemeApp";
import { margin, SxProps } from "@mui/system";
import React from "react";

const theme = themeApp;

export const containerBoxStep: SxProps = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  height: "100%",
  alignItems: "center",
  backgroundColor: theme.palette.formStyles.containerBackgroundColor,

  "& .MuiFormLabel-root": {
    marginBottom: "3rem",
  },
  "& .MuiInputBase-root": {
    backgroundColor: theme.palette.formStyles.cardBackgroundColor,
  },
};

export const formGroup: SxProps = {
  backgroundColor: theme.palette.formStyles.cardBackgroundColor,
  padding: "40px",
  border: `2px solid ${theme.palette.formStyles.borderColor}`,
  borderRadius: "4px",
  marginTop: "20px",
  marginBottom: "20px",
  "& .MuiFormGroup-root": {
    color: theme.palette.text.secondary,
    fontWeight: "600",
  },
};

export const formLabel: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "400",
  marginBottom: "2rem",
  textAlign: "center",
};

export const formSelect = (isNot1Step2: boolean): SxProps => ({
  color: isNot1Step2
    ? theme.palette.action.deactivate
    : theme.palette.text.secondary,
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

// ------------------------ 3er step --------------------------
export const stepFinalContainer: SxProps = {
  display: "flex",
  fontSize: "15px",
  flexDirection: "column",
  background: theme.palette.formStyles.containerBackgroundColor,
  width: "100%",
  height: "100%",
};

export const progress = (butonState: boolean): SxProps => ({
  display: butonState ? "none" : "block",
  width: "100%",
  "& .MuiLinearProgress-root": {
    marginTop: "1.8em",
    marginLeft: "2em",
    height: "1em",
    borderRadius: "5px",
  },
});

export const result = (butonState: boolean): SxProps => ({
  display: butonState ? "block" : "none",
  width: "100%",
  "& p": {
    marginTop: "1.8em",
    height: "1em",
    color: theme.palette.text.secondary,
  },
  " & div": {
    paddingLeft: "2em",
    paddingTop: "1em",
    color: theme.palette.text.secondary,
  },
});
// ------------------------ 4to step --------------------------
export const containerBoxGroup: SxProps = {
  // background: "pink",
  margin: "auto",
  "& #tabGroup": {
    // width: "700px",
  },
};

// ----------------------------------------------------------------
