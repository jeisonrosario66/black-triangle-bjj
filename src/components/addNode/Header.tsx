import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { configGlobal } from "@src/context/configGlobal";
import { useUIStore } from "@src/store/index";
import { ButtonClose } from "@src/components/index";
import { routeList } from "@src/context/index";

import * as style from "@src/styles/styleLogoContainer";

type HeaderProps = {
  isYoutubeSearch?: boolean;
  positionAbsolute?: boolean;
};

const Header: React.FC<HeaderProps> = ({
  isYoutubeSearch,
  positionAbsolute,
}) => {
  const navigate = useNavigate();
  const buttonCloseFunction = () => {
    navigate(routeList.root);
    useUIStore.setState({ addNodeActiveStep: 0 });
  };
  const isUploadFirestore = useUIStore((state) => state.isUploadFirestore);

  return (
    <>
      {isYoutubeSearch ? null : (
        <Box
          sx={{
            display: "flex",
            position: positionAbsolute ? "absolute" : "relative",
            width: "100%",
            top: "0",
            justifyContent: "space-between",
            margin: "1rem 0",
          }}
        >
          <Box sx={style.containerlogo}>
            <img
              src={configGlobal.logoApp}
              alt="Black Triangle BJJ Logo"
              style={style.logo}
            />
            <Typography sx={style.title}>
              {configGlobal.namePage}
            </Typography>
          </Box>
          <ButtonClose
            buttonFunction={buttonCloseFunction}
            disabled={isUploadFirestore}
          />
        </Box>
      )}
    </>
  );
};

export default Header;
