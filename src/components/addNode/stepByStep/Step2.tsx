import React from "react";
import {
  Controller,
  Control,
  FieldErrors,
} from "react-hook-form";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
} from "@mui/material";

import { NodeOptionFirestone } from "@src/context/index";
import {
  Header,
  TabGroup,
} from "@src/components/index";

import * as style from "@src/styles/addNode/styleStepByStep";

type Step2Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
  nodeOptions: NodeOptionFirestone[];
  isNot1Step2: number;
};


const Step2: React.FC<Step2Props> = ({
  control,
  errors,
  // nodeOptions,
  isNot1Step2,
}) => {
  return (
    <Box sx={style.containerBoxStep}>
      <Header title={"Agregar nuevo nodo"} />
      <FormLabel>Seleccionar nodo origen</FormLabel>
      <Controller
        name="nodeSourceIndex"
        control={control}
        render={({ field }) => (
          <FormControl error={!!errors.nodeSource}>
            <Box sx={style.boxFormSelect(isNot1Step2 == 1)}>
              <Typography>
                Elige una conexión de origen o presioná en saltar
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