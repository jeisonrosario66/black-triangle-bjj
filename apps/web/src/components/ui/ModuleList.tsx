import { Box, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { NodeOptionFirestore } from "@bt/shared/context/index";
import type { VideoProgressEntry } from "@bt/shared/services";

interface ModuleListProps {
  modules: NodeOptionFirestore[];
  onSelect: (module: NodeOptionFirestore, index: number) => void;
  selectedModuleId?: number;
  visitedModuleIds?: number[];
  videoProgressById?: Record<string, VideoProgressEntry>;
}

/**
 * Lista de módulos reutilizable para cursos.
 */
export default function ModuleList({
  modules,
  onSelect,
  selectedModuleId,
  visitedModuleIds = [],
  videoProgressById = {},
}: ModuleListProps) {
  const visitedSet = new Set(visitedModuleIds);

  return (
    <List disablePadding>
      {modules.map((module, index) => {
        const progressEntry = videoProgressById[String(module.id)];
        const progressPercent = Math.min(
          100,
          Math.max(
            progressEntry?.progressPercent ?? 0,
            progressEntry?.completed ? 100 : 0,
          ),
        );
        const progressLabel = progressEntry?.completed
          ? "Completado"
          : progressPercent > 0
            ? `${Math.round(progressPercent)}% visto`
            : undefined;

        return (
          <Box key={module.id}>
            <ListItemButton
              selected={selectedModuleId === module.id}
              onClick={() => onSelect(module, index)}
              sx={(theme) => ({
                borderRadius: 2,
                mb: 0.5,
                display: "flex",
                alignItems: "flex-start",
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
                py: 1.15,
              })}
            >
              <Box
                sx={(theme) => ({
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flexShrink: 0,
                  mt: 0.85,
                  backgroundColor: visitedSet.has(module.id)
                    ? theme.palette.primary.main
                    : alpha(theme.palette.outline, 0.4),
                  boxShadow: visitedSet.has(module.id)
                    ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`
                    : "none",
                })}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ListItemText
                  primary={`${index + 1}. ${module.name}`}
                  secondary={progressLabel}
                  sx={{ my: 0 }}
                  secondaryTypographyProps={{
                    sx: {
                      mt: 0.35,
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      color: progressEntry?.completed
                        ? "success.main"
                        : "text.secondary",
                    },
                  }}
                />
                {progressPercent > 0 ? (
                  <Box
                    sx={(theme) => ({
                      mt: 0.85,
                      width: "100%",
                      height: 6,
                      borderRadius: 999,
                      overflow: "hidden",
                      backgroundColor: alpha(theme.palette.primary.main, 0.14),
                    })}
                  >
                    <Box
                      sx={(theme) => ({
                        width: `${progressPercent}%`,
                        height: "100%",
                        borderRadius: 999,
                        backgroundColor: progressEntry?.completed
                          ? theme.palette.success.main
                          : theme.palette.primary.main,
                        transition: "width 160ms ease",
                        boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.22)}`,
                      })}
                    />
                  </Box>
                ) : null}
              </Box>
            </ListItemButton>
            <Divider />
          </Box>
        );
      })}
    </List>
  );
}
