import { Box, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { NodeOptionFirestore } from "@bt/shared/context/index";

interface ModuleListProps {
  modules: NodeOptionFirestore[];
  onSelect: (module: NodeOptionFirestore, index: number) => void;
  selectedModuleId?: number;
  visitedModuleIds?: number[];
}

/**
 * Lista de módulos reutilizable para cursos.
 */
export default function ModuleList({
  modules,
  onSelect,
  selectedModuleId,
  visitedModuleIds = [],
}: ModuleListProps) {
  const visitedSet = new Set(visitedModuleIds);

  return (
    <List disablePadding>
      {modules.map((module, index) => (
        <Box key={module.id}>
          <ListItemButton
            selected={selectedModuleId === module.id}
            onClick={() => onSelect(module, index)}
            sx={(theme) => ({
              borderRadius: 2,
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              border: "1px solid transparent",
              borderColor:
                selectedModuleId === module.id
                  ? alpha(theme.palette.primary.main, 0.42)
                  : visitedSet.has(module.id)
                    ? alpha(theme.palette.primary.main, 0.16)
                    : "transparent",
              backgroundColor:
                selectedModuleId === module.id
                  ? alpha(theme.palette.primary.main, 0.08)
                  : visitedSet.has(module.id)
                    ? alpha(theme.palette.primary.main, 0.04)
                    : undefined,
            })}
          >
            <Box
              sx={(theme) => ({
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: visitedSet.has(module.id)
                  ? theme.palette.primary.main
                  : alpha(theme.palette.outline, 0.4),
                boxShadow: visitedSet.has(module.id)
                  ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`
                  : "none",
              })}
            />
            <ListItemText primary={`${index + 1}. ${module.name}`} />
          </ListItemButton>
          <Divider />
        </Box>
      ))}
    </List>
  );
}
