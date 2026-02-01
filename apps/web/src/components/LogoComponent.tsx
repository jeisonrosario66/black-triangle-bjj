import { Box, Typography } from "@mui/material";
import { configGlobal } from "@src/context/index";

import * as style from "@src/styles/styleLogoContainer";

export default function logoContainer() {
  return (
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
  );
}
