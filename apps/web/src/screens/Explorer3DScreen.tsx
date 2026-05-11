import { Box } from "@mui/material";
import { useEffect } from "react";

import { AppBarNewHeader, ConfigWindow } from "@src/components/index";
import { MainAppLayout } from "@src/layouts/index";
import { useUIStore } from "@src/store/index";
import * as styles from "@src/styles/screens/styleExplorer3DScreen";

export default function Explorer3DScreen() {
  const isConfigWindowActive = useUIStore(
    (state) => state.isConfigWindowActive,
  );

  useEffect(() => {
    return () => {
      useUIStore.setState({ isConfigWindowActive: false });
    };
  }, []);

  return (
    <Box sx={styles.screen}>
      <AppBarNewHeader />
      <MainAppLayout />
      {isConfigWindowActive ? <ConfigWindow /> : null}
    </Box>
  );
}
