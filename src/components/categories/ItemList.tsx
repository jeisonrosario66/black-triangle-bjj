import { ToggleButton, ToggleButtonGroup } from "@mui/material";

type Item = {
  id: string;
  name: string;
  group: string;
};

type Props = {
  items: Item[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export function ItemList({ items, selectedId, onSelect }: Props) {
  return (
    <ToggleButtonGroup
      value={selectedId}
      exclusive
      onChange={(_, newId) => onSelect?.(newId)}
      orientation="vertical"
      fullWidth
    >
      {items.map((item) => (
        <ToggleButton key={item.id} value={item.id} aria-label={item.name}>
          {item.name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
