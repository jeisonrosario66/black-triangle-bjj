import { IconButton } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

import React from "react";

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
    <IconButton
      disabled={isUploadFirestore}
      onClick={buttonFunction}
      sx={{
        ...(isPositionAbsolute
          ? {
              position: "absolute",
              top: 14,
              right: 14,
            }
          : {}),
        width: 40,
        height: 40,
        borderRadius: 2.5,
        border: (theme) => `1px solid ${theme.palette.outlineVariant}`,
        backgroundColor: (theme) => theme.palette.background.paper,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
        "&:hover": {
          backgroundColor: (theme) => theme.palette.surfaceContainerHigh,
        },
        color: (theme) => theme.palette.text.secondary,
      }}
    >
      <CloseOutlined sx={{ fontSize: "1.35rem" }} />
    </IconButton>
  );
};

export default ButtonClose;
