import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  GuardIcon,
  PassIcon,
  SubmissionIcon,
  SwitchIcon,
  TransitionIcon,
  ControlIcon,
  TachiWazaIcon,
  optionsMenu
} from "@src/components/addNode/IconsGroup";
import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp;
// Define las opciones del grupo con valor, etiqueta e ícono


interface SelectableButtonGroupProps {
  value: string;
  onChange: (value: string) => void;
}

const SelectableButtonGroup: React.FC<SelectableButtonGroupProps> = ({
  value,
  onChange,
}) => {


  // Usamos directamente el valor y el manejador pasados por el formulario
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label="selectable options"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)", // 👉 3 columnas por fila
        gap: 1.5, // 👉 Espacio entre botones
        "& .MuiToggleButtonGroup-grouped": {
          margin: 0,
          border: `2px solid ${theme.palette.formStyles.borderColor}`, // Quitar borde colapsado por defecto
          borderRadius: "8px !important", // Forzar bordes uniformes
        },
      }}
    >
      {optionsMenu.map((opt) => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          sx={{
            // Estilos generales
            backgroundColor: "white",
            color: theme.palette.text.secondary,
            // Estilos cuando está seleccionado
            "&.Mui-selected": {
              backgroundColor: theme.palette.action.success,
              color: theme.palette.text.primary,
              borderColor: theme.palette.formStyles.borderColor,
            },

            // Estilos al hacer hover cuando está seleccionado
            "&.Mui-selected:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          {opt.icon &&
            React.cloneElement(opt.icon as React.ReactElement<any>, {
              color:
                value === opt.value ? "#fff" : theme.palette.text.secondary,
            })}
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default SelectableButtonGroup;
