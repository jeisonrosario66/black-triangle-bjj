import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { AppBarNewHeader } from "@src/components/index";
import { MainAppLayout } from "@src/layouts/index";
import * as styles from "@src/styles/screens/styleExplorer3DScreen";

const EXPLORER_3D_TEXT = "components.explorer3d.";

export default function Explorer3DScreen() {
  const { t } = useTranslation();

  return (
    <Box sx={styles.screen}>
      <AppBarNewHeader />
      <MainAppLayout />
    </Box>
  );
}
