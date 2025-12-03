import {
  ListItemText,
  Grid,
  ListItemButton,
  List,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { capitalizeFirstLetter } from "@src/utils/index";
import * as styles from "@src/styles/test/styleTest";

const textHardcoded = "components.addNode.tabGround.notItems";

type SubcategoryItem = {
  id?: string | number;
  name?: string;
  group?: string;
};

type Props = {
  /** Lista de subcategorías que se mostrarán en el componente */
  items: SubcategoryItem[];
  /** ID del elemento actualmente seleccionado */
  selectedId?: string | number | null;
  /** Callback ejecutado cuando el usuario selecciona un elemento */
  onSelect?: (id: string | number) => void;
};

/**
 * Lista interactiva de subcategorías.
 * Permite visualizar y seleccionar elementos con soporte para traducción
 * y estilos personalizados.
 *
 * @component
 */
export default function SubcategoryList({
  items,
  selectedId,
  onSelect,
}: Props) {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return (
      <Typography variant="subtitle1" color="text.primary">
        {t(textHardcoded)}
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} sx={styles.gridContainer}>
      <List>
        {items.map((item) => (
          <ListItemButton
            className="buttonItemSelector"
            key={item.id}
            selected={item.id === selectedId}
            onClick={() => item.id !== undefined && onSelect?.(item.id)}
          >
            <ListItemText
              className="buttonItemText"
              primary={capitalizeFirstLetter(item.name || "item name")}
            />
          </ListItemButton>
        ))}
      </List>
    </Grid>
  );
}
