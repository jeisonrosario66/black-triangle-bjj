import themeApp from "@src/styles/stylesThemeApp";
import { SxProps } from "@mui/system";
import React from "react";

const theme = themeApp;

const containerBoxStep: SxProps = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  height: "100%",
  alignItems: "center",
  backgroundColor: theme.palette.background.form,
  borderTop: `1px solid ${theme.palette.formStyles.borderColor}`,
  borderBottom: `1px solid ${theme.palette.formStyles.borderColor}`,
  "& .MuiFormLabel-root": {
    marginBottom: "3rem",
  },
  "& .MuiInputBase-root": {
    backgroundColor: theme.palette.formStyles.cardBackgroundColor,
  },
};

const formPosition: SxProps = {
  backgroundColor: theme.palette.formStyles.cardBackgroundColor,
  padding: "40px",
  border: `2px solid ${theme.palette.formStyles.borderColor}`,
  borderRadius: "4px",
  marginTop: "20px",
  "& .MuiFormGroup-root": {
    color: theme.palette.text.secondary,
    fontWeight: "600",
  },
};

const formLabel: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "600",
  marginBottom: "2rem",
};

const formSelect = (isNot1Step2: boolean): SxProps => ({
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

const boxFormSelect = (isNot1Step2: boolean): SxProps => ({
  display: "flex",
  flexDirection: "column-reverse",

  "& .MuiTypography-root": {
    fontSize: "0.75rem",
    textAlign: "center",
    display: isNot1Step2 ? "block" : "none",
    color: theme.palette.action.deactivate,
    marginTop: "3px",
    fontWeight: "400",
  },
});

// ------------------------ 3er step --------------------------
const stepFinalContainer: SxProps = {
  display: "flex",
  fontSize: "15px",
  borderTop: `1px solid ${theme.palette.formStyles.borderColor}`,
  borderBottom: `1px solid ${theme.palette.formStyles.borderColor}`,
  flexDirection: "column",
  background: "#f3f3f3",
  width: "100%",
  height: "100%",
};

const progress = (butonState: boolean): SxProps => ({
  display: butonState ? "none" : "block",
  "& .MuiLinearProgress-root": {
    marginTop: "1.8em",
    marginLeft: "2em",
    height: "1em",
    borderRadius: "5px",
  },
});

const result = (butonState: boolean): SxProps => ({
  display: butonState ? "block" : "none",
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
const graph2DProgress = (isUploadFirestore: boolean): SxProps => ({
  display: isUploadFirestore ? "none" : "block",
  margin: "auto",

  "& .MuiCircularProgress-root": {
    width: "100px !important",
    height: "100px !important",
  },
});
const graph2DResult = (isUploadFirestore: boolean): SxProps => ({
  display: isUploadFirestore ? "block" : "none",

  margin: "auto",
});

// ----------------------------------------------------------------

export {
  containerBoxStep,
  formPosition,
  formLabel,
  formSelect,
  boxFormSelect,
  stepFinalContainer,
  progress,
  result,
  graph2DResult,
  graph2DProgress,
};

// MenuItem → "MuiMenuItem-root"

// Select → "MuiSelect-root"

// Typography → "MuiTypography-root"

// Button → "MuiButton-root"

// OutlinedInput → "MuiOutlinedInput-notchedOutline" /
