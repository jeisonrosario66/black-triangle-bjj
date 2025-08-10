import { Button } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { lighten } from "@mui/material/styles";

import themeApp from "@src/styles/stylesThemeApp";

import React from "react";

const theme = themeApp;

type ButtonCloseProps = {
  buttonFunction: () => void;
  disabled?: boolean;
  isPositionAbsolute?: boolean;
};
const ButtonClose: React.FC<ButtonCloseProps> = ({
  buttonFunction,
  disabled: isUploadFirestore,
  isPositionAbsolute,
}) => {
  return (
    <Button
      disabled={isUploadFirestore}
      onClick={buttonFunction}
      sx={{
        ...(!isPositionAbsolute
          ? {}
          : {
              position: "absolute",
              top: 10,
              right: 10,
            }),

        marginRight: "1rem",
        backgroundColor: lighten(
          theme.palette.formStyles.containerBackgroundColor,
          0.4
        ),
        "&:hover": {
          backgroundColor: theme.palette.formStyles.cardBackgroundColor,
          opacity: 0.8,
        },
        color: theme.palette.action.deactivate,
      }}
    >
      <CloseOutlined sx={{ fontSize: "2em" }} />
    </Button>
  );
};

export default ButtonClose;
