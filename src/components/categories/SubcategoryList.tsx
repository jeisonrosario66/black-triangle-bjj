import { ListItem, ListItemText, Paper, Grid, Box } from "@mui/material";
import { Subcategory } from "@src/context/index";
import {capitalizeFirstLetter} from "@src/utils/index"

import * as styles from "@src/styles/test/styleTest";

type Props = {
  subcategories: Subcategory[];
};

export default function SubcategoryList({ subcategories }: Props) {
  return (
    <Grid container spacing={2} sx={styles.gridContainer}>
      {subcategories.map((sub) => (
        <Grid
          key={sub.label}
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          sx={styles.gridItem}
        >
          <Paper elevation={2}>
            {/* Imagen */}
            <Box
              component="img"
              src={"/black-triangle-bjj/categoryExampleImg.png"}
              alt={sub.title}
              sx={styles.gridItemImage}
            />

            <ListItem disableGutters>
              <ListItemText
                primary={capitalizeFirstLetter(sub.title || "sub category name")}
                secondary={capitalizeFirstLetter(sub.description || "sub category description")}
              />
            </ListItem>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
