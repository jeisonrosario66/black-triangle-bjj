import { Box } from "@mui/material";
import { logoBlackTriangleFull } from "@bt/shared/assets";

import * as style from "@src/styles/styleLogoContainer";

export default function logoContainer() {
  return (
    <Box sx={style.containerlogo}>
      <Box
        component="img"
        src={logoBlackTriangleFull}
        alt="Black Triangle BJJ Logo"
        sx={style.logo}
      />
    </Box>
  );
}
