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
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { ButtonClose } from "@src/components/index";
import { useUIStore } from "@src/store/index";
import { cacheUser, DagMode, nodesDataBaseActive, tableNameDB } from "@src/context/index";
import { ToolTipInfo } from "@src/utils/index";

const textHardcoded = "components.configWindow.";

const ConfigWindow: React.FC = () => {
  // Estado inicial desde Zustand para idioma, modo DAG y separación
  const initialLang = useUIStore((state) => state.languageGlobal);
  const initialDagMode = useUIStore((state) => state.dagModeConfig);
  const initialDagLevel = useUIStore((state) => state.dagLevelDistanceConfig);

  // Estados locales controlados para el formulario
  const [language, setLanguage] = useState(initialLang);
  const [dagMode, setDagMode] = useState(initialDagMode);
  const [dagLevel, setDagLevel] = useState(initialDagLevel);

  const { t, i18n } = useTranslation();

  // Cancela y cierra la ventana sin guardar cambios locales
  const buttonCloseFunction = () => {
    localStorage.setItem(cacheUser.languageUser, initialLang);
    useUIStore.setState({
      languageGlobal: initialLang,
      dagModeConfig: localStorage.getItem(cacheUser.dagModeCache) as DagMode,
      dagLevelDistanceConfig: Number(
        localStorage.getItem(cacheUser.dagLevelDistanceCache)
      ),
      isConfigWindowActive: false,
    });
  };

  // Cambia el idioma activo (local y en i18n)
  const handleChangeLanguage = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
    localStorage.setItem(cacheUser.languageUser, event.target.value);
    i18n.changeLanguage(event.target.value);
  };

  // Actualiza el modo DAG seleccionado
  const handleChangeDagMode = (event: SelectChangeEvent) => {
    const value = event.target.value as DagMode;
    setDagMode(value);
    useUIStore.setState({ dagModeConfig: value });
  };

  // Cambia la separación entre niveles, validando el rango permitido
  const handleChangeDagLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setDagLevel(value);
      useUIStore.setState({ dagLevelDistanceConfig: value });
    }
  };

  // Guarda los cambios y cierra la ventana de configuración
  const buttonCloseSaveFunction = () => {
    localStorage.setItem(cacheUser.dagModeCache, dagMode);
    localStorage.setItem(cacheUser.dagLevelDistanceCache, String(dagLevel));
    useUIStore.setState({
      languageGlobal: language,
      isConfigWindowActive: false,
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
      {/* Botón para cerrar sin guardar */}
      <ButtonClose
        buttonFunction={buttonCloseFunction}
        isPositionAbsolute={true}
      />

      {/* Título principal de la ventana */}
      <Typography variant="h4" sx={{ fontWeight: "600", marginBottom: "2rem" }}>
        {t(textHardcoded + "title")}
      </Typography>

      {/* Selección de idioma de la interfaz */}
      <FormControl
        fullWidth
        sx={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "row",
          "& .MuiInputBase-root": { width: "100%" },
        }}
      >
        <InputLabel id="language-select-label">
          {t(textHardcoded + "language.label")}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          defaultValue={initialLang}
          label={t(textHardcoded + "language.label")}
          onChange={handleChangeLanguage}
        >
          <MenuItem value={"es"}>{t(textHardcoded + "es")}</MenuItem>
          <MenuItem value={"en"}>{t(textHardcoded + "en")}</MenuItem>
        </Select>
        {/* Tooltip explicativo */}
        <ToolTipInfo content={t(textHardcoded + "language.description")} />
      </FormControl>

      {/* Selección del modo de jerarquía (DAG) del grafo */}
      <FormControl
        fullWidth
        sx={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "row",
          "& .MuiInputBase-root": { width: "100%" },
        }}
      >
        <InputLabel id="dagMode-select-label">
          {t(textHardcoded + "dagMode")}
        </InputLabel>
        <Select
          labelId="dagMode-select-label"
          id="dagMode-select"
          value={dagMode}
          label={t(textHardcoded + "dagMode")}
          onChange={handleChangeDagMode}
        >
          <MenuItem value={"td"}>{t(textHardcoded + "dagMode.td")}</MenuItem>
          <MenuItem value={"bu"}>{t(textHardcoded + "dagMode.bu")}</MenuItem>
          <MenuItem value={"lr"}>{t(textHardcoded + "dagMode.lr")}</MenuItem>
          <MenuItem value={"rl"}>{t(textHardcoded + "dagMode.rl")}</MenuItem>
          <MenuItem value={"radialout"}>
            {t(textHardcoded + "dagMode.radialout")}
          </MenuItem>
          <MenuItem value={"radialin"}>
            {t(textHardcoded + "dagMode.radialin")}
          </MenuItem>
          <MenuItem value={null as unknown as DagMode}>
            {t(textHardcoded + "dagMode.none")}
          </MenuItem>
        </Select>
        <ToolTipInfo content={t(textHardcoded + "dagMode.description")} />
      </FormControl>

      {/* Campo numérico para definir la separación entre niveles jerárquicos */}
      <FormControl
        fullWidth
        sx={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "row",
          "& .MuiFormControl-root": { width: "100%" },
        }}
      >
        <TextField
          id="outlined-number"
          label={t(textHardcoded + "dagLevelDistance")}
          type="number"
          value={dagLevel}
          onChange={handleChangeDagLevel}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
        <ToolTipInfo
          content={t(textHardcoded + "dagLevelDistance.description")}
        />
      </FormControl>

      {/* Botón para guardar cambios y cerrar */}
      <Button
        variant="contained"
        color="primary"
        onClick={buttonCloseSaveFunction}
      >
        {t(textHardcoded + "buttonClose")}
      </Button>
    </Box>
  );
};

export default ConfigWindow;
