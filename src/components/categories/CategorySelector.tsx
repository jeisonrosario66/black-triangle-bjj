import { List, ListItemButton, ListItemText } from "@mui/material";
import { Category } from "@src/context/index";
import {capitalizeFirstLetter} from "@src/utils/index"

import * as styles from "@src/styles/test/styleTest";

type Props = {
  readonly categories: Category[];
  readonly onSelect?: (id: [string, string]) => void;
  readonly selectedId?: string | null;
};


export default function CategorySelector({
  categories,
  onSelect,
  selectedId,
}: Props) {
  return (
    <List sx={styles.groupNames}>
      {categories.map((cat) => (
        <ListItemButton
          key={cat.label}
          selected={selectedId === cat.label}
          onClick={() => {
            onSelect?.([
              cat.label,
              capitalizeFirstLetter(cat.title || "category name"),
            ]);
          }}
        >
          <ListItemText
            primary={capitalizeFirstLetter(cat.title || "category name")}
          />
        </ListItemButton>
      ))}
    </List>
  );
}
