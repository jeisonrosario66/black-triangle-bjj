import React from "react";
import { Box } from "@mui/material";
import themeApp from "@src/styles/stylesThemeApp";

import { ToolTipInfo } from "@src/utils/index";

type LabelStepProps = {
  textLabel: string;
  toolTipInfo: string;
};

const LabelStep: React.FC<LabelStepProps> = ({ textLabel, toolTipInfo }) => {
  const theme = themeApp;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row-reverse",
        justifyContent: "center",
      }}
    >
      <Box>
        <ToolTipInfo content={toolTipInfo} />
      </Box>
      <h2
        style={{
          color: theme.palette.text.secondary,
          textAlign: "center",
        }}
      >
        {textLabel}
      </h2>
    </Box>
  );
};

export default LabelStep;
