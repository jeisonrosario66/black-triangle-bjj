import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  Header,
  SelectableButtonGroup,
  LabelStep,
} from "@src/components/index";
import * as style from "@src/styles/addNode/styleStepByStep";

const textHardcoded = "components.addNode.step2.";

type Step2Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
};

const Step2: React.FC<Step2Props> = ({ control, errors }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: "100%", margin: "0 0  50px 0", textAlign: "center" }}>
      <Header />
      <LabelStep
        textLabel={t(textHardcoded + "step2Title")}
        toolTipInfo={t(textHardcoded + "toolTipInfo")}
      />

      <Controller
        name="group"
        control={control}
        render={({ field }) => (
          <FormControl sx={style.formGroup}>
            <FormLabel style={style.formLabel}>
              {t(textHardcoded + "formLabel")}
            </FormLabel>
            <RadioGroup {...field}>
              <SelectableButtonGroup
                value={field.value}
                onChange={field.onChange}
              />
            </RadioGroup>
            {errors.group && (
              <Typography
                color="error"
                variant="caption"
                sx={{ textAlign: "center", marginTop: "20px" }}
              >
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

export default Step2;
