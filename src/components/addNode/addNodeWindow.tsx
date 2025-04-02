import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Header from "./Header";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import Divider from "@mui/material/Divider";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import styles from "@cssModules/addNodeWindow.module.css";
import { addData, getIndex } from "@src/services/firebaseService";
import { tableNameDB } from "@src/context/configGlobal";
import StepperComponent from "@src/components/Stepper";

type NodeFormData = {
  index: number;
  name: string;
  position: string; // Ejemplo: "Guard", "Mount", "Back Control", etc.
  useGi: string;
  description?: string;
  select?: string;
  linkVideo: string;
  autor: string;
  uploadedDate: string;
  uploadedBy: string;
};

const NodeForm: React.FC = () => {
  const { register, handleSubmit, control } = useForm<NodeFormData>();

  const onSubmit: SubmitHandler<NodeFormData> = async (data) => {
    // Obtendra el index del ultimo nodo almacenado y aumentara en 1 para un nuevo registro
    const index = (await getIndex(tableNameDB.nodes)) + 1;
    // Obtiene la fecha altual para guardar en el registro
    const date = new Date();
    const today = new Date(date);

    addData(
      tableNameDB.nodes,
      (data.index = index),
      data.name,
      data.select || "",
      data.useGi === "true",
      data.description || "null",
      data.autor || "null",
      data.linkVideo || "null",
      (data.uploadedDate = today.toLocaleDateString()),
      data.uploadedBy || "null"
    );

    // getData("nodos");
    // reset();
  };

  return (
    <div className={styles.formContainer}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          Width: "90vw",
          Height: "100vh",
          color: "#333",
          backgroundColor: "#f2f2f2",
          border: "1px solid #ccc",
          boxShadow: "0 0 17px rgb(106, 38, 166)",
        }}
      >
        <Header description="Agrega un nuevo nodo al grafo" />
        <Divider />

        <TextField
          label="Nombre de la posición"
          variant="outlined"
          {...register("name", { required: true })}
        />

        <TextField
          label="Link del video"
          variant="outlined"
          {...register("linkVideo", { required: true })}
        />

        {/* Select control para elegir una posición en BJJ */}
        <Controller
          name="select"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              <InputLabel id="position-select-label">Posición BJJ</InputLabel>
              <Select
                labelId="position-select-label"
                id="position-select"
                label="Posición BJJ"
                defaultValue="control"
                {...field}
              >
                <MenuItem value={"control"}>Control</MenuItem>
                <MenuItem value={"sumision"}>sumisión</MenuItem>
                <MenuItem value={"pasaje"}>pasaje</MenuItem>
              </Select>
            </>
          )}
        />

        <section>
          <label>Uniforme</label>
          <Controller
            name="useGi"
            control={control}
            defaultValue=""
            rules={{ required: "Selecciona un uniforme" }}
            render={({ field, fieldState: { error } }) => (
              <>
                <RadioGroup aria-label="Uniforme" {...field}>
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Gi"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="No Gi"
                  />
                </RadioGroup>
                {error && (
                  <span style={{ color: "red", fontSize: "0.8rem" }}>
                    {error.message}
                  </span>
                )}
              </>
            )}
          />
        </section>

        <TextField
          label="Descripción"
          variant="outlined"
          multiline
          rows={3}
          {...register("description")}
        />
        <StepperComponent/>
        {/* <Button type="submit" variant="contained" color="primary">
          Agregar Nodo
        </Button> */}
      </Box>
    </div>
  );
};

export default NodeForm;
