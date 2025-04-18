import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Box from "@mui/material/Box";

import LogoContainer from "@src/components/LogoComponent";
import StepperComponent from "@src/components/Stepper";
import { Step1, Step2, StepFinal } from "@src/components/addNode/StepByStep";

import { NodeOptionFirestone, NodeFormData } from "@src/context/exportType";
import { tableNameDB } from "@src/context/configGlobal";

import { addData, getIndex, getData } from "@src/services/firebaseService";

import useUIStore from "@src/store/useCounterStore";

import { debugLog } from "@src/utils/debugLog";

import { containerAddNodeWindow } from "@src/styles/nodeView/stylesAddNodeWindow";

const schema = yup.object({
  index: yup.number().required(),
  name: yup
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .required("El nombre es obligatorio"),
  group: yup.string().required("La posición es obligatoria"),
  nodeSourceIndex: yup.number().required("El nodo origen es obligatorio"), // No tiene Efecto
});

const NodeForm: React.FC = () => {
  /**
   * Componente contenedor de los steps del formulario
   */

  // finalFormData: Almacena la informacion completa recogida por el formlario
  // Se inicializa con valores default
  const [finalFormData, setFinalFormData] = useState<NodeFormData>({
    index: 0,
    name: "",
    group: "",
    nodeSourceIndex: 1,
  });
  const [selectedSourceNodeData, setfinalNodeSourceData] =
    useState<NodeOptionFirestone>({
      id: 0,
      index: 0,
      name: "",
      group: "",
    });

  const {
    control,
    trigger,
    watch,
    reset,
    handleSubmit, // envuelve "onSubmit para ser enviado sina argumentos"
    formState: { errors },
  } = useForm<NodeFormData>({
    resolver: yupResolver(schema),
    mode: "onChange", // Propaga los cambios de los inputs
    defaultValues: {
      index: 0,
      name: "",
      group: "",
      nodeSourceIndex: 1,
    },
  });

  const activeStep = useUIStore((state) => state.activeStep);
  const [nodeOptions, setNodeOptions] = useState<NodeOptionFirestone[]>([]);
  // Llama getNameNodes una sola vez al montar el componente
  React.useEffect(() => {
    const getDataNodes = async () => {
      try {
        const dataNodes = await getData(tableNameDB.nodes);
        setNodeOptions(dataNodes || []);
      } catch (error) {
        console.error("Error al obtener nodos desde Firestore:", error);
        setNodeOptions([]); // Opcional: asegúrate de no dejar el estado sin asignar
      }
    };

    getDataNodes();
  }, []);

  const onSubmit: SubmitHandler<NodeFormData> = async (dataNodes) => {
    // Modifica el estado global para indicar que se estan cargando datos a firestore
    useUIStore.setState({ isUploadFirestore: true });
    // Obtendra el index del ultimo nodo almacenado y aumentara en 1 para un nuevo registro
    const indexNewNode = (await getIndex(tableNameDB.nodes)) + 1;

    // Obtiene la fecha altual al guardar en el registro
    const date = new Date();
    const today = new Date(date);

    const selectedIndex = dataNodes.nodeSourceIndex;

    // Informacion del nodo de origen
    const selectedSourceNode = nodeOptions.find(
      (node) => node.index === selectedIndex
    );

    addData(
      tableNameDB.nodes,
      tableNameDB.links,
      (dataNodes.index = indexNewNode),
      dataNodes.name,
      dataNodes.group,
      dataNodes.nodeSourceIndex,
      (dataNodes.uploadedDate = today.toLocaleDateString())
    );
    // guarda los datos para mostrarlos en StepFinal
    setFinalFormData({ ...dataNodes });
    setfinalNodeSourceData({ ...selectedSourceNode });
    debugLog("debug", "Informacion enviada a firestone: ", dataNodes);

    reset();
  };

  const handleValidate = async () => {
    /**
     * @summary : Valida el ingreso de los datos requeridos en cada paso del stepper
     * @event: trigger: Permite evaluar los campos del formulario manualmente
     */
    const arrayStepper = [false, false];
    const isValidStep1 = await trigger(["name", "group"]);
    const isNot1_Step2 = watch("nodeSourceIndex");

    if (isValidStep1) {
      arrayStepper[0] = true;
    }
    // isNot1_Step2: Representa la primera opcion en el input "nodeSourceIndex"
    // si este es igual 1, entonces no pasara la verificacion
    // 1 sera el defaulValue en el input
    if (isNot1_Step2 !== 1) {
      arrayStepper[1] = true;
    } else {
      debugLog(
        "warn",
        "Escoge una conexión de origen para el nodo o preciona en saltar"
      );
    }
    return arrayStepper;
  };

  return (
    <Box style={containerAddNodeWindow}>
      <Box style={{padding: "2rem 0"}}>
        <LogoContainer />
      </Box>
      {activeStep === 0 && <Step1 control={control} errors={errors} />}
      {activeStep === 1 && (
        <Step2
          control={control}
          errors={errors}
          nodeOptions={nodeOptions}
          isNot1Step2={watch("nodeSourceIndex")}
        />
      )}
      {activeStep === 2 && (
        <StepFinal
          newNodeData={finalFormData}
          selectedSourceNodeData={selectedSourceNodeData}
        />
      )}

      <StepperComponent
        onValidate={handleValidate}
        onHandleSubmit={handleSubmit(onSubmit)}
      />
    </Box>
  );
};

export default NodeForm;
