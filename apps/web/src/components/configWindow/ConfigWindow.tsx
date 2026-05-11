import React, { useState, useEffect, useMemo } from "react";
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
  Stack,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from "react-i18next";

import { ButtonClose, PrimaryScreenSwitcher } from "@src/components/index";
import { useSession } from "@src/hooks";
import { useUIStore } from "@src/store/index";
import { cacheUser, DagMode } from "@src/context/index";
import { ToolTipInfo, hasGraphEditorAccess } from "@src/utils/index";
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
  const documentsFirestore = useUIStore((s) => s.documentsFirestore);
  const linksData = useUIStore((s) => s.linksData);
  const { user } = useSession();
  const canManageGraph = hasGraphEditorAccess(user);

  useEffect(() => {
    void loadSystems();
  }, [loadSystems]);

  const { t, i18n } = useTranslation();

  const graphCoverage = useMemo(() => {
    const connectedIds = new Set<number>();

    linksData.forEach((link) => {
      const sourceId =
        typeof link.source === "number" ? link.source : link.source?.id;
      const targetId =
        typeof link.target === "number" ? link.target : link.target?.id;

      if (typeof sourceId === "number") {
        connectedIds.add(sourceId);
      }

      if (typeof targetId === "number") {
        connectedIds.add(targetId);
      }
    });

    const connected = documentsFirestore.filter((node) =>
      connectedIds.has(node.id),
    ).length;

    return {
      totalCourses: systemsBjjSelectedNodesStore.length,
      totalNodes: documentsFirestore.length,
      connected,
      pending: Math.max(documentsFirestore.length - connected, 0),
    };
  }, [documentsFirestore, linksData, systemsBjjSelectedNodesStore.length]);

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

  const allSystemOptions = useMemo(
    () => systemsOptions.flatMap((group) => group.systems),
    [systemsOptions],
  );
  const visibleSystemGroups = useMemo(
    () =>
      canManageGraph
        ? systemsOptions
        : systemsOptions.filter((group) => group.status === "complete"),
    [canManageGraph, systemsOptions],
  );
  const visibleSystemOptions = useMemo(
    () => visibleSystemGroups.flatMap((group) => group.systems),
    [visibleSystemGroups],
  );
  const visibleSystemNodesSet = useMemo(
    () => new Set(visibleSystemOptions.map((option) => option.valueNodes)),
    [visibleSystemOptions],
  );

  const handleSelectAllSystems = () => {
    setTempSystemsNodes(visibleSystemOptions.map((option) => option.valueNodes));
    setTempSystemsLinks(visibleSystemOptions.map((option) => option.valueLinks));
  };

  const handleClearSystems = () => {
    setTempSystemsNodes([]);
    setTempSystemsLinks([]);
  };

  useEffect(() => {
    if (canManageGraph) {
      return;
    }

    setTempSystemsNodes((currentNodes) =>
      currentNodes.filter((path) => visibleSystemNodesSet.has(path)),
    );
    setTempSystemsLinks((currentLinks) =>
      currentLinks.filter((path) =>
        visibleSystemOptions.some((option) => option.valueLinks === path),
      ),
    );
  }, [canManageGraph, visibleSystemNodesSet, visibleSystemOptions]);

  /**
   * Guarda los cambios de idioma, DAG y sistemas seleccionados.
   * Actualiza Zustand y localStorage con los valores locales.
   */
  const buttonCloseSaveFunction = () => {
    const allowedOptions = canManageGraph ? allSystemOptions : visibleSystemOptions;
    const allowedNodes = new Set(allowedOptions.map((option) => option.valueNodes));
    const allowedLinks = new Set(allowedOptions.map((option) => option.valueLinks));
    const nextSystemsNodes = tempSystemsNodes.filter((path) => allowedNodes.has(path));
    const nextSystemsLinks = tempSystemsLinks.filter((path) => allowedLinks.has(path));

    // Guardar configuraciones numéricas y de modo DAG
    i18n.changeLanguage(language.locale);
    localStorage.setItem(cacheUser.languageUser, language.locale);
    localStorage.setItem(cacheUser.dagModeCache, dagMode);
    localStorage.setItem(cacheUser.dagLevelDistanceCache, String(dagLevel));

    // Guardar selección de sistemas en cache
    localStorage.setItem(
      cacheUser.systemsCacheNameNodes,
      JSON.stringify(nextSystemsNodes)
    );
    localStorage.setItem(
      cacheUser.systemsCacheNameLinks,
      JSON.stringify(nextSystemsLinks)
    );

    // Actualizar estado global solo al confirmar
    useUIStore.setState({
      languageGlobal: language,
      dagModeConfig: dagMode,
      dagLevelDistanceConfig: dagLevel,
      systemBjjSelectedNodes: nextSystemsNodes,
      systemBjjSelectedLinks: nextSystemsLinks,
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

      <Box sx={style.sectionCard}>
        <Typography sx={style.sectionEyebrow}>
          {t(textHardcoded + "coverageTitle")}
        </Typography>
        <Typography sx={style.sectionBody}>
          {t(textHardcoded + "coverageDescription")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Box sx={style.metricCard}>
            <Typography sx={style.metricLabel}>
              {t(textHardcoded + "coverageCourses")}
            </Typography>
            <Typography sx={style.metricValue}>{graphCoverage.totalCourses}</Typography>
          </Box>
          <Box sx={style.metricCard}>
            <Typography sx={style.metricLabel}>
              {t(textHardcoded + "coverageConnected")}
            </Typography>
            <Typography sx={style.metricValue}>{graphCoverage.connected}</Typography>
          </Box>
          <Box sx={style.metricCard}>
            <Typography sx={style.metricLabel}>
              {t(textHardcoded + "coveragePending")}
            </Typography>
            <Typography sx={style.metricValue}>{graphCoverage.pending}</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={style.sectionCard}>
        <Typography sx={style.sectionEyebrow}>
          {t(textHardcoded + "navigationTitle")}
        </Typography>
        <Typography sx={style.sectionBody}>
          {t(textHardcoded + "navigationDescription")}
        </Typography>
        <PrimaryScreenSwitcher
          variant="panel"
          onNavigate={() =>
            useUIStore.setState({ isConfigWindowActive: false })
          }
        />
      </Box>

      {/* Selector de idioma */}
      <FormControl fullWidth sx={style.formGeneral}>
        <InputLabel id="language-select-label">
          {t(textHardcoded + "language.label")}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={language.locale}
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
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
          <Button variant="outlined" size="small" onClick={handleSelectAllSystems}>
            {t(textHardcoded + "systemSelectAll")}
          </Button>
          <Button variant="text" size="small" onClick={handleClearSystems}>
            {t(textHardcoded + "systemClear")}
          </Button>
        </Stack>
        <Paper sx={style.selectSystemPaper}>
          <MenuList dense>

            {visibleSystemGroups.map((set, index) => (
              <Box key={set.label} sx={{ marginBottom: 2 }}>
                <Accordion defaultExpanded={index === 0}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography component="span">
                      {set.name} ({set.systems.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {set.systems.map((option) => (
                      <MenuItem
                        key={option.valueNodes}
                        selected={tempSystemsNodes.includes(option.valueNodes)}
                        sx={style.selectSystemItem(
                          tempSystemsNodes.includes(option.valueNodes)
                        )}
                        onClick={() =>
                          handleSystemSelect(option.valueNodes, option.valueLinks)
                        }
                      >
                        {tempSystemsNodes.includes(option.valueNodes) && (
                          <ListItemIcon>
                            <Check color="primary" />
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={option.label}
                          secondary={
                            option.coverage
                              ? t(textHardcoded + "systemCoverage", {
                                  connected: option.coverage.connectedNodes,
                                  total: option.coverage.totalNodes,
                                })
                              : undefined
                          }
                        />
                      </MenuItem>
                    ))}
                  </AccordionDetails>
                </Accordion>


              </Box>
            ))}


          </MenuList>
        </Paper>
        {!canManageGraph && visibleSystemGroups.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            {t(textHardcoded + "systemNoComplete")}
          </Typography>
        ) : null}
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
