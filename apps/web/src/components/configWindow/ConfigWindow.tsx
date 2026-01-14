import React, { useState, useEffect } from "react";
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
  ListItemText,
  Paper,
  MenuList,
  ListItemIcon,
  Accordion, AccordionDetails, AccordionSummary,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from "react-i18next";

import { ButtonClose } from "@src/components/index";
import { useUIStore } from "@src/store/index";
import { cacheUser, DagMode } from "@src/context/index";
import { ToolTipInfo } from "@src/utils/index";
import * as style from "@src/styles/configWindow/styleConfigWindow";

const textHardcoded = "components.configWindow.";

/**
 * Ventana de configuración principal de la aplicación.
 * Permite al usuario cambiar idioma, modo DAG, distancia jerárquica
 * y seleccionar sistemas de BJJ que se cargarán en la escena.
 */
const ConfigWindow: React.FC = () => {
  /** Estado inicial desde Zustand */
  const initialLang = useUIStore((state) => state.languageGlobal);
  const initialDagMode = useUIStore((state) => state.dagModeConfig);
  const initialDagLevel = useUIStore((state) => state.dagLevelDistanceConfig);
  const systemsBjjSelectedNodesStore = useUIStore(
    (state) => state.systemBjjSelectedNodes
  );
  const systemsBjjSelectedLinksStore = useUIStore(
    (state) => state.systemBjjSelectedLinks
  );

  // Estado local temporal de los ajustes seleccionados.
  const [language, setLanguage] = useState(initialLang);
  const [dagMode, setDagMode] = useState(initialDagMode);
  const [dagLevel, setDagLevel] = useState(initialDagLevel);
  const [tempSystemsNodes, setTempSystemsNodes] = useState<string[]>(
    systemsBjjSelectedNodesStore
  );
  const [tempSystemsLinks, setTempSystemsLinks] = useState<string[]>(
    systemsBjjSelectedLinksStore
  );

  // Lista de sistemas disponibles para carga y visualización en la aplicación.
  const loadSystems = useUIStore((s) => s.loadSystems);
  const systemsOptions = useUIStore((s) => s.systemsOptions);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  const { t, i18n } = useTranslation();

  /**
   * Cierra la ventana sin guardar los cambios.
   * Restaura idioma y configuraciones iniciales desde Zustand/localStorage.
   */
  const buttonCloseFunction = () => {
    useUIStore.setState({
      languageGlobal: initialLang,
      dagModeConfig: initialDagMode,
      dagLevelDistanceConfig: initialDagLevel,
      isConfigWindowActive: false,
    });
  };

  /**
   * Cambia el idioma activo de la aplicación.
   * @param event Evento del selector de idioma.
   */
  const handleChangeLanguage = (event: SelectChangeEvent<"es" | "en">) => {
    const value = event.target.value;
    setLanguage({ locale: value });
  };

  /**
   * Actualiza el modo DAG seleccionado.
   * @param event Evento del selector de modo.
   */
  const handleChangeDagMode = (event: SelectChangeEvent) => {
    const value = event.target.value as DagMode;
    setDagMode(value);
  };

  /**
   * Actualiza la distancia jerárquica entre niveles del grafo.
   * Valida que el número esté dentro del rango 0–100.
   * @param e Evento de cambio del campo numérico.
   */
  const handleChangeDagLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value) && value >= 0 && value <= 100) {
      setDagLevel(value);
    }
  };
  /**
   * Maneja la selección temporal de sistemas (nodos y enlaces).
   * No actualiza el estado global ni el localStorage hasta que se presione "Guardar".
   */
  const handleSystemSelect = (valueNodes: string, valueLinks: string) => {
    setTempSystemsNodes((prev) =>
      prev.includes(valueNodes)
        ? prev.filter((v) => v !== valueNodes)
        : [...prev, valueNodes]
    );

    setTempSystemsLinks((prev) =>
      prev.includes(valueLinks)
        ? prev.filter((v) => v !== valueLinks)
        : [...prev, valueLinks]
    );
  };

  /**
   * Guarda los cambios de idioma, DAG y sistemas seleccionados.
   * Actualiza Zustand y localStorage con los valores locales.
   */
  const buttonCloseSaveFunction = () => {
    // Guardar configuraciones numéricas y de modo DAG
    i18n.changeLanguage(language.locale);
    localStorage.setItem(cacheUser.languageUser, language.locale);
    localStorage.setItem(cacheUser.dagModeCache, dagMode);
    localStorage.setItem(cacheUser.dagLevelDistanceCache, String(dagLevel));

    // Guardar selección de sistemas en cache
    localStorage.setItem(
      cacheUser.systemsCacheNameNodes,
      JSON.stringify(tempSystemsNodes)
    );
    localStorage.setItem(
      cacheUser.systemsCacheNameLinks,
      JSON.stringify(tempSystemsLinks)
    );

    // Actualizar estado global solo al confirmar
    useUIStore.setState({
      languageGlobal: language,
      dagModeConfig: dagMode,
      dagLevelDistanceConfig: dagLevel,
      systemBjjSelectedNodes: tempSystemsNodes,
      systemBjjSelectedLinks: tempSystemsLinks,
      isConfigWindowActive: false,
    });
  };

  return (
    <Box sx={style.containerConfigWindow}>
      {/* Botón para cerrar sin guardar */}
      <ButtonClose
        buttonFunction={buttonCloseFunction}
        isPositionAbsolute={true}
      />

      {/* Título principal */}
      <Typography variant="h4" sx={{ fontWeight: "600", marginBottom: "2rem" }}>
        {t(textHardcoded + "title")}
      </Typography>

      {/* Selector de idioma */}
      <FormControl fullWidth sx={style.formGeneral}>
        <InputLabel id="language-select-label">
          {t(textHardcoded + "language.label")}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          defaultValue={initialLang.locale}
          label={t(textHardcoded + "language.label")}
          onChange={handleChangeLanguage}
        >
          <MenuItem value={"es"}>{t(textHardcoded + "es")}</MenuItem>
          <MenuItem value={"en"}>{t(textHardcoded + "en")}</MenuItem>
        </Select>
        <ToolTipInfo content={t(textHardcoded + "language.description")} />
      </FormControl>

      {/* Selector de modo DAG */}
      <FormControl fullWidth sx={style.formGeneral}>
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

      {/* Campo numérico de distancia entre niveles */}
      <FormControl fullWidth sx={style.formGeneral}>
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

      {/* Lista de sistemas disponibles */}
      <InputLabel id="system-select-label">
        {t(textHardcoded + "system")}
      </InputLabel>
      <FormControl fullWidth sx={style.formGeneral}>
        <Paper sx={style.selectSystemPaper}>
          <MenuList dense>

            {systemsOptions.map((set) => (
              <Box key={set.label} sx={{ marginBottom: 2 }}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography component="span">
                      {set.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {set.systems.map((option) => (
                      <MenuItem
                        key={option.valueNodes}
                        selected={tempSystemsNodes.includes(option.valueNodes)}
                        onClick={() =>
                          handleSystemSelect(option.valueNodes, option.valueLinks)
                        }
                      >
                        {tempSystemsNodes.includes(option.valueNodes) && (
                          <ListItemIcon>
                            <Check color="primary" />
                          </ListItemIcon>
                        )}
                        <ListItemText>{option.label}</ListItemText>
                      </MenuItem>
                    ))}
                  </AccordionDetails>
                </Accordion>


              </Box>
            ))}


          </MenuList>
        </Paper>
        <ToolTipInfo content={t(textHardcoded + "system.description")} />
      </FormControl>

      {/* Botón guardar */}
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

export default React.memo(ConfigWindow);
