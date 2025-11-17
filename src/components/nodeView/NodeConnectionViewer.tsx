/**
 * NodeConnectionViewer.tsx
 *
 * Componente que muestra las conexiones (entrantes y salientes) de un nodo
 * en un grafo interactivo. Permite visualizar los enlaces desde y hacia un nodo
 * con animaciones suaves de aparición/desaparición.
 *
 * Incluye la capacidad de deseleccionar pestañas, ocultando el contenido
 * cuando el usuario vuelve a hacer clic en una pestaña activa.
 *
 * Autor: [Tu nombre o equipo]
 * Fecha: [Fecha de última modificación]
 */

import React, { useState, useMemo } from "react";
import {
  Tabs,
  Tab,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Collapse,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { iconsMap } from "@src/components/index";
import { GraphNode } from "@src/context/index";
import { debugLog, capitalizeFirstLetter } from "@src/utils/index";

import themeApp from "@src/styles/stylesThemeApp";

const textHardcoded = "components.nodeConnectionViewer.";

/**
 * Propiedades del panel asociado a cada pestaña.
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  activeTab: number | null;
}

/**
 * Contenedor que muestra u oculta su contenido según la pestaña activa.
 * Usa animaciones suaves mediante el componente Collapse de MUI.
 */
function CustomTabPanel({ children, activeTab, index }: TabPanelProps) {
  const isActive = activeTab === index;
  return (
    <Collapse in={isActive} timeout={400} unmountOnExit>
      <Box
        role="tabpanel"
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        sx={{ p: 2 }}
      >
        {children}
      </Box>
    </Collapse>
  );
}

/**
 * Genera propiedades ARIA para mejorar la accesibilidad.
 */
function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

/**
 * Propiedades esperadas del componente principal.
 */
interface NodeConnectionViewerProps {
  nodeId: number;
}

/**
 * Componente principal.
 * Muestra las conexiones de un nodo en dos direcciones:
 *  - Source (flecha atrás): conexiones que parten desde el nodo actual.
 *  - Target (flecha adelante): conexiones que llegan al nodo actual.
 *
 * Si el usuario hace clic en una pestaña activa, se deselecciona y oculta su contenido.
 */
export default function NodeConnectionViewer({
  nodeId,
}: NodeConnectionViewerProps) {
  const { t } = useTranslation();
  const linkData = useUIStore((state) => state.linksData);
  const activeTabState = useUIStore(
    (state) => state.connectionViewerActiveStep
  );
  /**
   * Maneja el cambio o deselección de pestañas.
   * Si la pestaña seleccionada ya está activa, se oculta su contenido.
   */
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    useUIStore.setState((state) => ({
      connectionViewerActiveStep:
        state.connectionViewerActiveStep === newValue ? null : newValue,
    }));
  };

  /**
   * Type guard para identificar un obje|to GraphNode válido.
   */
  const isGraphNode = (v: unknown): v is GraphNode =>
    typeof v === "object" && v !== null && "id" in v;

  /**
   * Filtra las conexiones donde el nodo actual es el origen (source).
   */
  const sourceLinks = useMemo(
    () =>
      linkData
        .filter(
          (link) =>
            (isGraphNode(link.source) && link.source.id === nodeId) ||
            link.source === nodeId
        )
        .map((link) => link.target),
    [linkData, nodeId]
  );

  /**
   * Filtra las conexiones donde el nodo actual es el destino (target).
   */
  const targetLinks = useMemo(
    () =>
      linkData
        .filter(
          (link) =>
            (isGraphNode(link.target) && link.target.id === nodeId) ||
            link.target === nodeId
        )
        .map((link) => link.source),
    [linkData, nodeId]
  );

  /**
   * Renderiza una lista de nodos, mostrando su nombre y grupo.
   * Si no hay resultados, muestra un mensaje vacío descriptivo.
   */
  const renderNodeList = (nodes: (GraphNode | number)[], emptyText: string) => {
    if (nodes.length === 0) {
      return <Typography variant="body2">{emptyText}</Typography>;
    }

    return (
      <List dense>
        {nodes.map((node, index) => {
          if (!isGraphNode(node)) return null;
          return (
            <React.Fragment key={node.id}>
              <Button
                sx={{
                  width: "100%",
                  "& .MuiListItemText-primary, .MuiListItemText-secondary": {
                    fontSize: "0.7rem",
                    fontFamily: themeApp.palette.typography.fontFamily,
                  },
                }}
              >
                <ListItem
                  onClick={() => {
                    debugLog("info", "NodeViewer Actualizado: ", node);

                    useUIStore.setState({ nodeViewData: node });
                  }}
                >
                  <ListItemIcon>
                    {(() => {
                      // Normaliza el nombre del grupo: primera letra mayúscula
                      const key = capitalizeFirstLetter(
                        node.group || "groupEmpty"
                      );

                      const IconComponent = iconsMap[key] || iconsMap.default;

                      return <IconComponent color="primary" />;
                    })()}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      node.name || `${t(textHardcoded + "node")} ${node.id}`
                    }
                    secondary={node.group || t(textHardcoded + "groupEmpty")}
                  />
                </ListItem>
                {index < nodes.length - 1 && <Divider variant="inset" />}
              </Button>
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        "& .MuiTab-root": {
          fontSize: "0.85rem",
          fontFamily: themeApp.palette.typography.fontFamily,
        },
      }}
    >
      {/* Navegación principal de pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTabState ?? false}
          onChange={handleChange}
          aria-label="Node connection viewer tabs"
          centered
        >
          <Tab
            icon={<ArrowBack />}
            iconPosition="start"
            label={t(textHardcoded + "ArrowBackToolTip")}
            {...a11yProps(0)}
            onClick={() => {
              // Permite colapsar al volver a hacer clic
              if (activeTabState === 0) {
                useUIStore.setState({
                  connectionViewerActiveStep: null,
                });
              }
            }}
          />
          <Tab
            icon={<ArrowForward />}
            iconPosition="end"
            label={t(textHardcoded + "ArrowForwardToolTip")}
            {...a11yProps(1)}
            onClick={() => {
              if (activeTabState === 1) {
                useUIStore.setState({
                  connectionViewerActiveStep: null,
                });
              }
            }}
          />
        </Tabs>
      </Box>
      {/* Panel: Conexiones entrantes (target) */}
      <CustomTabPanel activeTab={activeTabState} index={0}>
        <Typography variant="subtitle2" gutterBottom>
          {t(textHardcoded + "targetLabel")}
        </Typography>
        {renderNodeList(targetLinks, t(textHardcoded + "targetLinksLabel"))}
      </CustomTabPanel>
      {/* Panel: Conexiones salientes (source) */}
      <CustomTabPanel activeTab={activeTabState} index={1}>
        <Typography variant="subtitle2" gutterBottom>
          {t(textHardcoded + "sourceLabel")}
        </Typography>
        {renderNodeList(sourceLinks, t(textHardcoded + "sourceLinksLabel"))}
      </CustomTabPanel>
    </Box>
  );
}
