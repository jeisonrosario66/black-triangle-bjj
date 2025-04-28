import Box from "@mui/material/Box";
import React from "react";
import { useUIStore } from "@src/store/index";
import { ButtonClose } from "@src/components/index";

import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp;
const buttonCloseFunction = () => {
  useUIStore.setState({ isAddNodeActive: false });
  useUIStore.setState({ activeStep: 0 });
};

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const activeStep = useUIStore((state) => state.activeStep);
  const isUploadFirestore = useUIStore((state) => state.isUploadFirestore);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ButtonClose
          buttonFunction={buttonCloseFunction}
          disabled={isUploadFirestore}
        />
        <h2
          style={{
            color:
              activeStep == 2
                ? theme.palette.action.success
                : theme.palette.text.secondary,
            textAlign: "center",
          }}
        >
          {title}
        </h2>
      </Box>
    </>
  );
};

export default Header;
