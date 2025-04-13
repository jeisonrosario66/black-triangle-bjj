import React from "react";

import { useForm, SubmitHandler } from "react-hook-form";

import Box from "@mui/material/Box";
import { NodeOptionFirestone } from "@src/context/exportType";
import Header from "@src/components/addNode/Header";
import { addData, getIndex, getData } from "@src/services/firebaseService";
import { tableNameDB } from "@src/context/configGlobal";
import StepperComponent from "@src/components/Stepper";
import useUIStore from "@src/store/useCounterStore";
import { debugLog } from "@src/utils/debugLog";
import { Step1, Step2 } from "@src/components/addNode/StepByStep";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { containerAddNodeWindow } from "@src/styles/stylesAddNodeWindow";
const schema = yup.object({
  index: yup.number().required(),
  name: yup
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .required("El nombre es obligatorio"),
  position: yup.string().required("La posición es obligatoria"),
  nodeSource: yup.number().required("El nodo origen es obligatorio"),
  // nodeTarget: yup.number().required("El nodo destino es obligatorio"),
});

type NodeFormData = {
  /**
   * Se definen los datos que recogera el formulario
   */
  index: number;
  name: string;
  position: string;
  nodeSource: number;
  // nodeTarget: number;
  uploadedDate?: string;
};

const NodeForm: React.FC = () => {
  /**
   * Componente contenedor del formulario
   */
  const {
    control,
    trigger,
    handleSubmit, // envuelve "onSubmit para ser enviado sina argumentos"
    formState: { errors },
  } = useForm<NodeFormData>({
    resolver: yupResolver(schema),
    mode: "onChange", // Propaga los cambios de los inputs
    defaultValues: {
      index: 0,
      name: "",
      position: "",
      nodeSource: undefined,
      // nodeTarget: undefined,
    },
  });

  const activeStep = useUIStore((state) => state.activeStep);
  const [nodeOptions, setNodeOptions] = React.useState<NodeOptionFirestone[]>(
    []
  );
  let count = 0;
  // Llama getNameNodes una sola vez al montar el componente
  React.useEffect(() => {
  
    const getDataNodes = async () => {
      try {
        const dataNodes = await getData(tableNameDB.nodes);
        console.log("Ejecuciones: ", count);
        count += 1;
        setNodeOptions(dataNodes || []);
      } catch (error) {
        console.error("Error al obtener nodos desde Firestore:", error);
        setNodeOptions([]); // Opcional: asegúrate de no dejar el estado sin asignar
      }
    };
  
    getDataNodes();
  }, []);

  const onSubmit: SubmitHandler<NodeFormData> = async (dataNodes) => {
    // Obtendra el index del ultimo nodo almacenado y aumentara en 1 para un nuevo registro
    const indexNewNode = (await getIndex(tableNameDB.nodes)) + 1;

    // Obtiene la fecha altual al guardar en el registro
    const date = new Date();
    const today = new Date(date);

    addData(
      tableNameDB.nodes,
      tableNameDB.links,
      (dataNodes.index = indexNewNode),
      dataNodes.name,
      dataNodes.position,
      dataNodes.nodeSource,
      (dataNodes.uploadedDate = today.toLocaleDateString())
    );
    // reset();
    debugLog("debug", "Informacion enviada a firestone: ", dataNodes);
  };

  const handleValidate = async () => {
    /**
     * @summary : Valida el ingreso de los datos requeridos en cada paso del stepper
     * @event: trigger: Permite evaluar los campos del formulario manualmente
     */
    const arrayStepper = [false, false];
    const isValidStep1 = await trigger(["name", "position"]);
    const isValidStep2 = await trigger(["nodeSource"]);

    if (isValidStep1) {
      arrayStepper[0] = true;
    }
    if (isValidStep2) {
      arrayStepper[1] = true;
    }
    return arrayStepper;
  };

  return (
    <Box
      style={containerAddNodeWindow}
    >
      <Header />

      {activeStep === 0 && <Step1 control={control} errors={errors} />}
      {activeStep === 1 && (
        <Step2 control={control} errors={errors} nodeOptions={nodeOptions} />
      )}

      <StepperComponent
        onValidate={handleValidate}
        onHandleSubmit={handleSubmit(onSubmit)}
      />
    </Box>
  );
};

export default NodeForm;
