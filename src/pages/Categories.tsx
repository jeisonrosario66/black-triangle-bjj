import React, { useState } from "react";
import { Typography, Grid } from "@mui/material";

import { CategorySelector, SubcategoryList } from "@src/components/index";
import { useCategories, useSubcategories } from "@src/services/index";

import * as styles from "@src/styles/test/styleTest";
import { useTranslation } from "react-i18next";

// Prefijo para las claves de traducción
const textoBase = "pages.categories.";

type PropsCategorias = {};
const Categorias: React.FC<PropsCategorias> = ({}) => {
  const { t } = useTranslation();

  // Estado que guarda la categoría seleccionada: [id, nombre]
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string[]>([]);

  // Hook que obtiene las subcategorías según la categoría seleccionada
  const subcategorias = useSubcategories(categoriaSeleccionada[0] ?? "");

  // Hook que obtiene todas las categorías
  const categorias = useCategories();

  return (
    <Grid container sx={styles.containerPanel}>
      {/* Panel izquierdo: listado de categorías */}
      <Grid sx={styles.groupPanel} size={3}>
        <Typography sx={styles.groupPanelTitle} variant="h6">
          {t(textoBase + "groupTitle")}
        </Typography>
        <CategorySelector
          categories={categorias}
          selectedId={categoriaSeleccionada[0]}
          onSelect={setCategoriaSeleccionada}
        />
      </Grid>

      {/* Panel derecho: listado de subcategorías */}
      <Grid sx={styles.subGroupPanel} size="grow">
        <Typography variant="h6">
          {subcategorias.length > 0
            ? categoriaSeleccionada[1] // Nombre de la categoría seleccionada
            : t(textoBase + "subGroupTitle")}
        </Typography>
        <SubcategoryList subcategories={subcategorias} />
      </Grid>
    </Grid>
  );
};

export default Categorias;
