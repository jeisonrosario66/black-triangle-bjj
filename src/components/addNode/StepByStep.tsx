import React from "react";

import { Controller, Control, FieldErrors } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Button, MenuItem, Select } from "@mui/material";
import { NodeOptionFirestone } from "@src/context/exportType";
import * as style from "@src/styles/styleStepByStep";
import { NodeFormData } from "@src/context/exportType";
import LinearProgress from "@mui/material/LinearProgress";
import { useState } from "react";
import useUIStore from "@src/store/useCounterStore";

type Step1Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
};

type Step2Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
  nodeOptions: NodeOptionFirestone[];
  isNot1Step2: number;
};

type StepFinalProps = {
  dataNodes: NodeFormData;
};
const Step1: React.FC<Step1Props> = ({ control, errors }) => {
  return (
    <Box sx={style.containerBoxStep}>
      {/* Campo "name" */}
      <Controller
        name="name"
        control={control}
        rules={{ required: "El nombre es obligatorio" }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nombre del nodo"
            error={!!errors.name}
            helperText={
              typeof errors.name?.message === "string"
                ? errors.name.message
                : undefined
            }
          />
        )}
      />

      {/* Campo position */}
      <Controller
        name="position"
        control={control}
        render={({ field }) => (
          <FormControl style={style.formPosition}>
            <FormLabel style={style.formLabel}>Tipo de nodo</FormLabel>
            <RadioGroup {...field}>
              <FormControlLabel
                value="guard"
                control={<Radio />}
                label="Guardia"
              />
              <FormControlLabel
                value="pass"
                control={<Radio />}
                label="Pasaje"
              />
              <FormControlLabel
                value="submission"
                control={<Radio />}
                label="Sumisión"
              />
              <FormControlLabel
                value="transition"
                control={<Radio />}
                label="Transición"
              />
            </RadioGroup>
            {errors.position && (
              <Typography color="error" variant="caption">
                {typeof errors.position?.message === "string"
                  ? errors.position.message
                  : ""}
              </Typography>
            )}
          </FormControl>
        )}
      />
    </Box>
  );
};

const Step2: React.FC<Step2Props> = ({
  control,
  errors,
  nodeOptions,
  isNot1Step2,
}) => {
  return (
    <Box sx={style.containerBoxStep}>
      <FormLabel>Seleccionar nodo origen</FormLabel>
      <Controller
        name="nodeSource"
        control={control}
        render={({ field }) => (
          <FormControl error={!!errors.nodeSource}>
            <Box sx={style.boxFormSelect(isNot1Step2 == 1)}>
              <Typography>
                Elige una conexión de origen o presioná en saltar
              </Typography>
              <Select sx={style.formSelect(isNot1Step2 == 1)} {...field}>
                {/*  Mapea el estado "nodeOptions" para obtener solo los nombres  */}
                {nodeOptions
                  //Filtra los nombre vacios
                  .filter((node) => node.name && node.name.trim() !== "")
                  .map((node, index) => (
                    <MenuItem key={index} value={node.index}>
                      {`${node.name}: ${node.index}`}
                    </MenuItem>
                  ))}
              </Select>
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

const StepFinal: React.FC<StepFinalProps> = ({ dataNodes }) => {
  const isUploadFirestore = !useUIStore((state) => state.isUploadFirestore);
  return (
    <Box sx={style.stepFinalContainer}>
      <Box sx={style.progress(isUploadFirestore)}>
        <LinearProgress sx={{ width: "35%" }} />
        <LinearProgress sx={{ width: "12%" }} />
        <LinearProgress sx={{ width: "17%" }} />
        <LinearProgress sx={{ width: "20%" }} />
        <LinearProgress sx={{ width: "20%" }} />
        <LinearProgress sx={{ width: "40%" }} />
      </Box>
      <Box sx={style.result(isUploadFirestore)}>
        <div>
          <h3>Resumen del Nodo</h3>
          <p>
            <strong>Índice:</strong> {dataNodes.index}
          </p>
          <p>
            <strong>Nombre:</strong> {dataNodes.name}
          </p>
          <p>
            <strong>Posición:</strong> {dataNodes.position}
          </p>
          <p>
            <strong>Nodo Origen:</strong>{" "}
            {dataNodes.name + " {" + dataNodes.nodeSource + "}"}
          </p>
          <p>
            <strong>Fecha de subida:</strong>{" "}
            {dataNodes.uploadedDate ?? "Sin fecha aún"}
          </p>
        </div>
      </Box>
    </Box>
  );
};
export { Step1, Step2, StepFinal };
