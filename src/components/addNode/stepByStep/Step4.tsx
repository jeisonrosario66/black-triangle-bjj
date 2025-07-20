import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Box, Typography, FormControl, FormLabel } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Header, TabGroup } from "@src/components/index";

import * as style from "@src/styles/addNode/styleStepByStep";

const textHardcoded = "components.addNode.step4.";

type Step4Props = { control: Control<any>; errors: FieldErrors<any> };

const Step4: React.FC<Step4Props> = ({ control, errors }) => {
  const { t } = useTranslation();

  return (
    <Box sx={style.containerBoxStep}>
      <Header positionAbsolute={true}/>
      <FormLabel>{t(textHardcoded + "title")}</FormLabel>
      <Controller
        name="nodeSourceIndex"
        control={control}
        render={({ field }) => (
          <FormControl error={!!errors.nodeSource}>
            <Box sx={style.boxFormSelect(false)}>
              <Typography>{t(textHardcoded + "subText1")}</Typography>
              <TabGroup
                onSelectionChange={(val) => {
                  field.onChange(val); // Actualiza el valor en el form
                }}
              />
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

export default Step4;
