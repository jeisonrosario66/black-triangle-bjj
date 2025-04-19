import React, { useEffect, useState } from "react";
import { optionsMenu } from "@src/components/addNode/IconsGroup";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { getData } from "@src/services/firebaseService";
import { NodeOptionFirestone } from "@src/context/exportType";
import { tableNameDB } from "@src/context/configGlobal";
import { debugLog } from "@src/utils/debugLog";

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
      hidden={value !== index} // Oculta si no es el tab activo
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
export default function BasicTabs() {
  const [value, setValue] = useState(0); // Índice del tab activo
  const [tabData, setTabData] = useState<NodeOptionFirestone[]>([]); // Todos los nodos
  const [loading, setLoading] = useState(false); // Estado de carga

  const currentOption = optionsMenu[value]; // Opción actualmente seleccionada

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
  const getFilteredData = (groupName: string) => {
    try {
      const filtered = tabData
        .filter(({ group }) => group === groupName)
        .map(({ id, name, group }) => ({ id, name, group })); // Simplifica los datos
      debugLog("info", "Query to group:", filtered);
      return filtered;
    } catch (error) {
      debugLog("error", "Error filtrando grupo:", groupName, error);
      return [];
    }
  };

  /**
   * Manejador de cambio de pestaña.
   */
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", display: "flex" }}>
      {/* Menú lateral con Tabs */}
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="tabs"
        orientation="vertical"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        {optionsMenu.map((item, index) => (
          <Tab
            key={index}
            label={item.label}
            {...a11yProps(index)}
            sx={{ padding: "0" }}
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
                <pre>{JSON.stringify(getFilteredData(item.value), null, 2)}</pre>
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
