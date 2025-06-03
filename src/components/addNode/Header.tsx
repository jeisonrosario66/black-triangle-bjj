import React from "react";
import { Box, Typography } from "@mui/material";

import { useUIStore } from "@src/store/index";
import { ButtonClose } from "@src/components/index";

import * as style from "@src/styles/styleLogoContainer";

const buttonCloseFunction = () => {
  useUIStore.setState({ isAddNodeActive: false });
  useUIStore.setState({ activeStep: 0 });
};

type HeaderProps = {
  isYoutubeSearch?: boolean;
  positionAbsolute?: boolean;
};

const Header: React.FC<HeaderProps> = ({
  isYoutubeSearch,
  positionAbsolute,
}) => {
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
              src="./logoApp.svg"
              alt="Black Triangle BJJ Logo"
              style={style.logo}
            />
            <Typography sx={style.title}>
              BLACK <br /> TRIANGLE BJJ
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
