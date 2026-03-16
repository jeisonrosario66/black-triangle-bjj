import { Box, Chip, ChipProps } from "@mui/material";

export interface TagItem {
  id: string | number;
  label: string;
  color?: ChipProps["color"];
}

interface TagListProps {
  items: TagItem[];
  variant?: ChipProps["variant"];
  size?: ChipProps["size"];
}

/**
 * Lista de tags reutilizable para taxonomías y metadatos.
 */
export default function TagList({
  items,
  variant = "outlined",
  size = "small",
}: TagListProps) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.label}
          color={item.color ?? "default"}
          variant={variant}
          size={size}
        />
      ))}
    </Box>
  );
}
