import { Button } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

import themeApp from "@src/styles/stylesThemeApp";

import React from "react";

const theme = themeApp;

type ButtonCloseProps = {
  buttonFunction: () => void;
  disabled?: boolean;
};
const ButtonClose: React.FC<ButtonCloseProps> = ({
  buttonFunction,
  disabled: isUploadFirestore,
}) => {
  return (
    <Button
      size="medium"
      disabled={isUploadFirestore}
      onClick={buttonFunction}
      sx={{
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: theme.palette.formStyles.containerBackgroundColor,
        "&:hover": {
          backgroundColor: theme.palette.formStyles.cardBackgroundColor,
          opacity: 0.8,
        },
        color: theme.palette.action.deactivate,
      }}
    >
      <CloseOutlined />
    </Button>
  );
};

export default ButtonClose;
