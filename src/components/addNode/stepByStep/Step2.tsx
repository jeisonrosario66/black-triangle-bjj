import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Box, Typography, FormControl, FormLabel } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Header, TabGroup } from "@src/components/index";

import * as style from "@src/styles/addNode/styleStepByStep";

const textHardcoded = "components.addNode.step2.";

type Step2Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
  isNot1Step2: number;
};

const Step2: React.FC<Step2Props> = ({ control, errors, isNot1Step2 }) => {
  const { t } = useTranslation();

  return (
    <Box sx={style.containerBoxStep}>
      <Header title={"Agregar nuevo nodo"} />
      <FormLabel>{t(textHardcoded+"title")}</FormLabel>
      <Controller
        name="nodeSourceIndex"
        control={control}
        render={({ field }) => (
          <FormControl error={!!errors.nodeSource}>
            <Box sx={style.boxFormSelect(isNot1Step2 == 1)}>
              <Typography>
                {t(textHardcoded+"subText1")}
              </Typography>
              {/* <TabGroup/> */}
              <TabGroup
                onSelectionChange={(val) => {
                  field.onChange(val); // Actualiza el valor en el form
                }}
              />

              {/* <TabGroup onSelectionChange={handleTabGroupSelection} /> */}
            </Box>
            {errors.nodeSource && (
              <Typography color="error" variant="caption">
                {typeof errors.nodeSource?.message === "string"
                  ? errors.nodeSource.message
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
