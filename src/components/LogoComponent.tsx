import { Box, Typography} from "@mui/material";

import * as style from "@src/styles/styleLogoContainer";

export default function logoContainer() {
  return (
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
  );
}
