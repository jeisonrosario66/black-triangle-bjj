import {
  ListItem,
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
  items: SubcategoryItem[];
  selectedId?: string | number | null;
  onSelect?: (id: string | number) => void;
};
export default function SubcategoryList({
  items,
  selectedId,
  onSelect,
}: Props) {
  // Hook de traducción
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
