import { useEffect, useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getDataFirestore, useCategories } from "@src/services/index";
import { NodeOptionFirestone, firestoreSchema } from "@src/context/index";
import { debugLog, capitalizeFirstLetter } from "@src/utils/index";
import { CategorySelector, SubcategoryList } from "@src/components/index";

import * as style from "@src/styles/addNode/styleCategoryPanel";

const textHardcoded = "components.addNode.tabGround.";

/**
 * CategoryPanel
 *
 * Componente principal que permite navegar por **categorías** y
 * visualizar los **ítems asociados a cada una**.
 *
 * Flujo general:
 *  1. Obtiene datos desde Firestore (nodos).
 *  2. Filtra ítems según la categoría seleccionada.
 *  3. Renderiza el listado y notifica al padre con el `id` seleccionado.
 *
 * Props:
 * - onSelectionChange: callback para notificar al padre el `id` del ítem seleccionado.
 */
export default function CategoryPanel({
  onSelectionChange,
}: {
  readonly onSelectionChange: (value: string | null) => void;
}) {
  // Estado que contiene todos los nodos obtenidos de Firestore
  const [tabData, setTabData] = useState<NodeOptionFirestone[]>([]);

  // Estado que indica si la data se está cargando
  const [loading, setLoading] = useState(false);
  // Estado para el ítem seleccionado
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(
    null
  );

  /**
   * Efecto: carga inicial de los nodos desde Firestore.
   * Solo se ejecuta una vez al montar el componente.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDataFirestore(
          firestoreSchema.cachedSystemNodes,
          "nodes"
        );
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
   * Memoized function: retorna los ítems filtrados según el grupo (categoría).
   * Esto evita recalcular los filtros innecesariamente cuando `tabData` no cambia.
   */
  const getFilteredData = useMemo(
    () => (groupName: string) => {
      try {
        return tabData
          .filter(({ group }) => group === groupName)
          .map(({ id, name, group }) => ({ id, name, group }));
      } catch (error) {
        debugLog("error", "Error filtrando grupo:", groupName, error);
        return [];
      }
    },
    [tabData]
  );

  // Hook de traducción
  const { t } = useTranslation();

  // Categoría actualmente seleccionada [id, título]
  const [selectedCategory, setSelectedCategory] = useState<
    [string, string] | null
  >(null);

  // Subcategoría seleccionada (aún no implementada, pero reservada para expansión)
  const [_selectedSubcategory, setSelectedSubcategory] = useState<
    string | null
  >(null);

  // Obtiene la categoría completa a partir de la selección
  const categorias = useCategories();
  const currentCategory = categorias.find(
    (cat) => cat.label === selectedCategory?.[0]
  );

  // Ítems filtrados de acuerdo a la categoría activa
  const items = getFilteredData(selectedCategory?.[0] || "null");

  return (
    <Box sx={style.categoryPanelContainer}>
      {/* Nivel 1 – Selección de categorías */}
      <CategorySelector
        categories={categorias}
        selectedId={selectedCategory?.[0] || null}
        onSelect={(id) => {
          setSelectedCategory(id);
          setSelectedSubcategory(null); // Reset de subcategoría al cambiar de categoría
          setSelectedItemId(null); // Reset de ítem seleccionado al cambiar de categoría
        }}
      />

      {/* Nivel 2 – Listado de ítems asociados a la categoría */}
      <Box>
        {currentCategory ? (
          <>
            {/* Título de la categoría seleccionada */}
            <Typography variant="h6" id="categoryTitle">
              {capitalizeFirstLetter(currentCategory.title || "")}
            </Typography>
            {/* Muestra spinner/texto mientras carga, o la lista de ítems */}
            {loading ? (
              <Typography>{t(textHardcoded + "loadingData")}</Typography>
            ) : (
              <SubcategoryList
                items={items}
                selectedId={selectedItemId}
                onSelect={(id) => {
                  setSelectedItemId(id);
                  // Notifica al padre con el ID del ítem seleccionado
                  if (onSelectionChange) onSelectionChange(id.toString());
                }}
                // selectedId={}
              />
            )}
          </>
        ) : (
          // Texto placeholder cuando no hay categoría seleccionada
          <Typography color="text.primary">
            {t(textHardcoded + "selecCategory")}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
