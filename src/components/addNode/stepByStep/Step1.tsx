import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Box, TextField } from "@mui/material";

import { useTranslation } from "react-i18next";

import { LabelStep, HeaderAddNode } from "@src/components/index";

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
      <HeaderAddNode title={t(textHardcoded + "step1Title")} />

      <LabelStep
        textLabel={t(textHardcoded + "step1Title")}
        toolTipInfo={t(textHardcoded + "toolTipInfo")}
      />

      {/* Campo "name" */}
      <Controller
        name="name"
        control={control}
        rules={{ required: t(textHardcoded + "formLabel") }}
        render={({ field }) => (
          <TextField
            {...field}
            label={t(textHardcoded + "formLabel")}
            error={!!errors.name}
            helperText={
              typeof errors.name?.message === "string"
                ? errors.name.message
                : undefined
            }
          />
        )}
      />
    </Box>
  );
};

export default Step1;
