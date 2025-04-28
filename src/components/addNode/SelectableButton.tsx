import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { optionsMenu } from "@src/components/index";
import * as style from "@src/styles/addNode/styleSelectableButton";

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
      sx={style.toggleButtonGroupStyles}
    >
      {optionsMenu.map((opt) => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          sx={style.toggleButtonStyles}
        >
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
