import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import {
  Box,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { Header, SelectableButtonGroup } from "@src/components/index";

import * as style from "@src/styles/addNode/styleStepByStep";

const textHardcoded = "components.addNode.step1.";

type Step1Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
};

const Step1: React.FC<Step1Props> = ({ control, errors }) => {
  const { t } = useTranslation();
  return (
    <Box sx={style.containerBoxStep}>
      <Header title={"Crea una nueva conexción"} />
      {/* Campo "name" */}
      <Controller
        name="name"
        control={control}
        rules={{ required: t(textHardcoded+"formLabel") }}
        render={({ field }) => (
          <TextField
            {...field}
            label={t(textHardcoded+"title")}
            error={!!errors.name}
            helperText={
              typeof errors.name?.message === "string"
                ? errors.name.message
                : undefined
            }
          />
        )}
      />

      {/* Campo group */}
      <Controller
        name="group"
        control={control}
        render={({ field }) => (
          <FormControl sx={style.formGroup}>
            <FormLabel style={style.formLabel}>Tipo de nodo</FormLabel>
            <RadioGroup {...field}>
              <SelectableButtonGroup
                value={field.value}
                onChange={field.onChange}
              />
            </RadioGroup>
            {errors.group && (
              <Typography color="error" variant="caption">
                {typeof errors.group?.message === "string"
                  ? errors.group.message
                  : ""}
              </Typography>
            )}
          </FormControl>
        )}
      />
    </Box>
  );
};

export default Step1;
