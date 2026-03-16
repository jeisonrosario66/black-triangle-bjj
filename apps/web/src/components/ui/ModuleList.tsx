import { Box, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import { NodeOptionFirestore } from "@bt/shared/context/index";

interface ModuleListProps {
  modules: NodeOptionFirestore[];
  onSelect: (module: NodeOptionFirestore, index: number) => void;
}

/**
 * Lista de módulos reutilizable para cursos.
 */
export default function ModuleList({ modules, onSelect }: ModuleListProps) {
  return (
    <List disablePadding>
      {modules.map((module, index) => (
        <Box key={module.id}>
          <ListItemButton onClick={() => onSelect(module, index)}>
            <ListItemText primary={`${index + 1}. ${module.name}`} />
          </ListItemButton>
          <Divider />
        </Box>
      ))}
    </List>
  );
}
