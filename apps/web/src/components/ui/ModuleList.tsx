import { Box, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import { NodeOptionFirestore } from "@bt/shared/context/index";

interface ModuleListProps {
  modules: NodeOptionFirestore[];
  onSelect: (module: NodeOptionFirestore, index: number) => void;
  selectedModuleId?: number;
}

/**
 * Lista de módulos reutilizable para cursos.
 */
export default function ModuleList({
  modules,
  onSelect,
  selectedModuleId,
}: ModuleListProps) {
  return (
    <List disablePadding>
      {modules.map((module, index) => (
        <Box key={module.id}>
          <ListItemButton
            selected={selectedModuleId === module.id}
            onClick={() => onSelect(module, index)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
            }}
          >
            <ListItemText primary={`${index + 1}. ${module.name}`} />
          </ListItemButton>
          <Divider />
        </Box>
      ))}
    </List>
  );
}
