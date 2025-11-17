import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Box, Typography, FormControl } from "@mui/material";
import { useTranslation } from "react-i18next";

import { HeaderAddNode, CategoryPanel } from "@src/components/index";

import * as style from "@src/styles/addNode/styleStepByStep";

const textHardcoded = "components.addNode.step4.";

type Step4Props = { control: Control<any>; errors: FieldErrors<any> };

/**
 * Paso 4 del proceso de creación de un nodo.
 * Permite seleccionar la categoría/origen del nodo mediante un panel interactivo,
 * integrándose con react-hook-form para validar y registrar el valor seleccionado.
 *
 * @component
 */
const Step4: React.FC<Step4Props> = ({ control, errors }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <HeaderAddNode title={t(textHardcoded + "title")} />
      </Box>
      <Box sx={style.containerBoxGroup}>
        <Controller
          name="nodeSourceIndex"
          control={control}
          render={({ field }) => (
            <FormControl
              error={!!errors.nodeSource}
              id="boxFormSelectContainer"
            >
              <Box id="tabGroup">
                <CategoryPanel
                  onSelectionChange={(val) => {
                    field.onChange(val);
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
    </>
  );
};

export default Step4;
