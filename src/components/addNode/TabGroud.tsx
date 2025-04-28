import React, { useEffect, useState, useMemo } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { getData } from "@src/services/index";
import { optionsMenu } from "@src/components/index";
import { NodeOptionFirestone, tableNameDB } from "@src/context/index";
import { debugLog } from "@src/utils/index";

import * as style from "@src/styles/addNode/styleTabGroup";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Componente reutilizable para renderizar el contenido de cada pestaña.
 * Solo se muestra cuando el índice coincide con el valor seleccionado.
 */
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Atributos de accesibilidad para cada Tab y su panel correspondiente.
 */
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

/**
 * Componente principal que gestiona las pestañas verticales
 * y muestra datos filtrados por categoría (grupo).
 */
export default function BasicTabs({
  onSelectionChange,
}: {
  onSelectionChange: (value: string | null) => void;
}) {
  const [value, setValue] = useState(0);
  const [tabData, setTabData] = useState<NodeOptionFirestone[]>([]);
  const [loading, setLoading] = useState(false); // Estado de carga
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const handleSelectionChange = (newVal: string | null) => {
    setSelectedValue(newVal);
    onSelectionChange(newVal);
  };

  /**
   * Carga todos los nodos desde Firestore al montar el componente.
   * Esta operación solo se realiza una vez.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getData(tableNameDB.nodes); // Petición general
        setTabData(data || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setTabData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Filtra los nodos según el grupo (valor asociado al tab).
   */
  const getFilteredData = useMemo(
    () => (groupName: string) => {
      try {
        const filtered = tabData
          .filter(({ group }) => group === groupName)
          .map(({ id, name, group }) => ({ id, name, group })); // Simplifica los datos
        return filtered;
      } catch (error) {
        debugLog("error", "Error filtrando grupo:", groupName, error);
        return [];
      }
    },
    [tabData]
  );

  /**
   * Manejador de cambio de pestaña.
   */
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log("evento", event);
    setValue(newValue);
  };

  return (
    <Box sx={style.tabGroupContainer}>
      {/* Menú lateral con Tabs */}
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="tabs"
        orientation="vertical"
        sx={style.tabs}
      >
        {optionsMenu.map((item, index) => (
          <Tab
            key={item.value}
            label={item.label}
            {...a11yProps(index)}
            sx={style.tab}
          />
        ))}
      </Tabs>

      {/* Panel dinámico según el tab activo */}
      {optionsMenu.map((item, index) => (
        <CustomTabPanel key={index} value={value} index={index}>
          {loading ? (
            <Typography>Cargando datos...</Typography>
          ) : (
            <>
              {getFilteredData(item.value).length > 0 ? (
                <ToggleButtonGroup
                  value={selectedValue}
                  exclusive
                  onChange={(_, newVal) => handleSelectionChange(newVal)}
                  orientation="vertical"
                  fullWidth
                >
                  {getFilteredData(item.value).map((data) => (
                    <ToggleButton
                      key={data.id}
                      value={data.id ?? ""}
                      aria-label={data.name}
                      sx={style.toggleButton}
                    >
                      {item.icon &&
                        React.cloneElement(
                          item.icon as React.ReactElement<any>,
                          {
                            sx: style.itemICon(data.id ?? "", selectedValue),
                          }
                        )}
                      {data.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              ) : (
                <Typography>No hay datos para esta categoría.</Typography>
              )}
            </>
          )}
        </CustomTabPanel>
      ))}
    </Box>
  );
}
