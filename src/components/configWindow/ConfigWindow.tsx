import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { ButtonClose } from "@src/components/index";
import { useUIStore } from "@src/store/index";
import { cacheUser } from "@src/context/index";

const textHardcoded = "components.configWindow.";

const ConfigWindow: React.FC = () => {
  const initialLang = useUIStore((state) => state.languageGlobal);
  const [language, setLanguage] = useState(initialLang);
  const { t, i18n } = useTranslation();

  const buttonCloseFunction = () => {
    localStorage.setItem(cacheUser.languageUser, initialLang);
    useUIStore.setState({
      languageGlobal: initialLang,
      isConfigWindowActive: false,
    });
  };
  const handleChangeLanguage = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
    localStorage.setItem(cacheUser.languageUser, event.target.value);
    i18n.changeLanguage(event.target.value);
  };
  const buttonCloseSaveFunction = () => {
    useUIStore.setState({
      isConfigWindowActive: false,
      languageGlobal: language,
    });
  };

  return (
    <Box
      sx={{
        width: "80%",
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        zIndex: "10",
      }}
    >
      <ButtonClose buttonFunction={buttonCloseFunction} isPositionAbsolute={true}/>

      <Typography variant="h4" sx={{ fontWeight: "600", marginBottom: "2rem" }}>
        {t(textHardcoded+"title")}
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: "2rem" }}>
        <InputLabel id="demo-simple-select-label">{t(textHardcoded+"languageLabel")}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          defaultValue={initialLang}
          label={t(textHardcoded+"languageLabel")}
          onChange={handleChangeLanguage}
        >
          <MenuItem value={"es"}>{t(textHardcoded+"es")}</MenuItem>
          <MenuItem value={"en"}>{t(textHardcoded+"en")}</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={buttonCloseSaveFunction}
      >
        {t(textHardcoded+"buttonClose")}
      </Button>
    </Box>
  );
};

export default ConfigWindow;
