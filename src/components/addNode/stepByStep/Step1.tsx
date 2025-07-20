import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Box, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";

import { Header, LabelStep } from "@src/components/index";

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
      <Header positionAbsolute={true} />

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

      {/* Campo "gender" */}
      <Controller
        name="gender"
        control={control}
        rules={{ required: t(textHardcoded + "genderRequired") }}
        render={({ field }) => (
          <FormControl error={!!errors.gender}>
            <FormLabel id="demo-radio-buttons-group-label">
              {t(textHardcoded + "genderLabel") || "Gender"}
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              {...field}
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {/* <FormControlLabel value="female" control={<Radio />} label={t(textHardcoded + "female") || "Female"} />
              <FormControlLabel value="male" control={<Radio />} label={t(textHardcoded + "male") || "Male"} />
              <FormControlLabel value="other" control={<Radio />} label={t(textHardcoded + "other") || "Other"} />
              */}
            </RadioGroup>
          </FormControl>
        )}
      />
    </Box>
  );
};

export default Step1;
