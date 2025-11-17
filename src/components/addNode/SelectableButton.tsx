import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { optionsMenu } from "@src/components/index";
import * as style from "@src/styles/addNode/styleSelectableButton";

interface SelectableButtonGroupProps {
  /** Valor actualmente seleccionado */
  value: string;
  /** Callback que notifica cuando el usuario elige una nueva opción */
  onChange: (value: string) => void;
}

/**
 * Grupo de botones seleccionables basado en ToggleButtonGroup (MUI).
 * Permite elegir una única opción entre un conjunto definido.
 *
 * @component
 */
const SelectableButtonGroup: React.FC<SelectableButtonGroupProps> = ({
  value,
  onChange,
}) => {
  /**
   * Maneja el cambio de selección dentro del grupo.
   * MUI envía `newValue = null` cuando se intenta deseleccionar,
   * por eso se valida antes de aplicar el cambio.
   *
   * @param _ Evento de clic (ignorado)
   * @param newValue Nuevo valor seleccionado o null
   */
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
      sx={style.toggleButtonGroupStyles}
    >
      {optionsMenu.map((opt) => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          sx={style.toggleButtonStyles}
        >
          {/* Icono opcional. Se clona para ajustar el color según selección */}
          {opt.icon &&
            React.cloneElement(opt.icon as React.ReactElement<any>, {
              color:
                value === opt.value
                  ? "#fff"
                  : style.theme.palette.text.secondary,
            })}
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default SelectableButtonGroup;
