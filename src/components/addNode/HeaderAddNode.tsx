import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

import { useUIStore } from "@src/store/index";
import { routeList } from "@src/context/index";
import { configGlobal } from "@src/context/configGlobal";

import * as style from "@src/styles/addNode/styleHeaderAddNode";

type HeaderAddNodeProps = {
  title: string;
};

const HeaderAddNode: React.FC<HeaderAddNodeProps> = ({ title }) => {
  const navigate = useNavigate();
  const buttonCloseFunction = () => {
    navigate(routeList.root);
    useUIStore.setState({ activeStep: 0 });
  };

  return (
    <>
      <Box sx={style.containerHeaderAddNode}>
        <Box sx={style.logoContainer}>
          <img src={configGlobal.logoApp} alt="Black Triangle BJJ Logo" />
        </Box>
        <Typography sx={style.headerTitle}>{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={buttonCloseFunction}
          sx={style.closeButton}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
    </>
  );
};

export default HeaderAddNode;
