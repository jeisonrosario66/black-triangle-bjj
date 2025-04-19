import { Controller, Control, FieldErrors } from "react-hook-form";
import {
  Box,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Button,
  Tab,
  Tabs,
  LinearProgress,
} from "@mui/material";
import { NodeOptionFirestone, NodeFormData } from "@src/context/exportType";
import * as style from "@src/styles/styleStepByStep";
import useUIStore from "@src/store/useCounterStore";
import React from "react";
import Graph2D from "@src/components/Graph2D";
import Header from "@src/components/addNode/Header";
import SelectableButtonGroup from "@src/components/addNode/SelectableButton";
import TabGroup from "@src/components/addNode/TabGroud"
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
  newNodeData: NodeFormData;
  selectedSourceNodeData: NodeOptionFirestone;
};
const Step1: React.FC<Step1Props> = ({ control, errors }) => {
  return (
    <Box sx={style.containerBoxStep}>
      <Header />
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

const Step2: React.FC<Step2Props> = ({
  control,
  errors,
  nodeOptions,
  isNot1Step2,
}) => {




  return (
    <Box sx={style.containerBoxStep}>
      <Header />
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
              <TabGroup/>
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

const StepFinal: React.FC<StepFinalProps> = ({
  newNodeData: dataNodes,
  selectedSourceNodeData: selectedSourceNode,
}) => {
  const isUploadFirestore = !useUIStore((state) => state.isUploadFirestore);
  const graphStepFinalData = {
    nodes: [
      { id: dataNodes.index, name: dataNodes.name },
      { id: dataNodes.nodeSourceIndex, name: selectedSourceNode.name },
    ],
    links: [{ source: dataNodes.nodeSourceIndex, target: dataNodes.index }],
  };

  return (
    <Box sx={style.containerBoxStep}>
      <Header />
      <Box sx={style.progress(isUploadFirestore)}>
        <LinearProgress sx={{ width: "60%" }} />
        <LinearProgress sx={{ width: "25%" }} />
        <LinearProgress sx={{ width: "32%" }} />
        <LinearProgress sx={{ width: "20%" }} />
        <LinearProgress sx={{ width: "50%" }} />
        <LinearProgress sx={{ width: "54%" }} />
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
            <strong>Posición:</strong> {dataNodes.group}
          </p>
          <p>
            <strong>Nodo Origen:</strong>{" "}
            {" {" + dataNodes.nodeSourceIndex + "}"}
          </p>
          <p>
            <strong>Fecha de subida:</strong>{" "}
            {dataNodes.uploadedDate ?? "Sin fecha aún"}
          </p>
        </div>
      </Box>
      <Graph2D
        graphStepFinalData={graphStepFinalData}
        isUploadFirestore={isUploadFirestore}
      />
    </Box>
  );
};
export { Step1, Step2, StepFinal };
