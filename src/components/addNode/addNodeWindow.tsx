import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Divider } from "@mui/material";

import {
  Step1,
  Step2,
  Step3,
  StepFinal,
  StepperComponent,
  LogoContainer,
} from "@src/components/index";
import {
  NodeOptionFirestone,
  NodeFormData,
  tableNameDB,
} from "@src/context/index";
import { addData, getIndex, getData } from "@src/services/index";
import { useUIStore } from "@src/store/index";
import { debugLog } from "@src/utils/index";

import * as style from "@src/styles/addNode/stylesAddNodeWindow";

const schema = yup.object({
  index: yup.number().required(),
  name: yup
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .required("El nombre es obligatorio"),
  group: yup.string().required("El tipo de nodo es obligatorio"),
  nodeSourceIndex: yup.number().required("El nodo origen es obligatorio"), // No tiene Efecto
});

/**
 * Componente contenedor de los steps del formulario
 */
const NodeForm: React.FC = () => {
  // finalFormData: Almacena la informacion completa recogida por el formlario
  // Se inicializa con valores default
  const [finalFormData, setFinalFormData] = useState<NodeFormData>({
    index: 0,
    name: "",
    group: "",
    nodeSourceIndex: 1,
    videoid: "",
    start: "",
    end: "",
  });
  const [finalNodeSourceData, setFinalNodeSourceData] =
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
    setValue,
    handleSubmit, // envuelve "onSubmit para ser enviado sin argumentos"
    formState: { errors },
  } = useForm<NodeFormData>({
    resolver: yupResolver(schema),
    mode: "onChange", // Propaga los cambios de los inputs
    defaultValues: {
      index: 0,
      name: "",
      group: "",
      nodeSourceIndex: 1,
      videoid: "",
      start: "",
      end: "",
    },
  });

  const activeStep = useUIStore((state) => state.activeStep);
  const [nodeOptions, setNodeOptions] = useState<NodeOptionFirestone[]>([]);

  // Llama getNameNodes una sola vez al montar el componente
  useEffect(() => {
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

    const date = new Date();
    const today = new Date(date);

    const selectedIndex = dataNodes.nodeSourceIndex;

    // Informacion del nodo de origen
    const selectedSourceNode = nodeOptions.find(
      (node) => node.index === selectedIndex
    );

    dataNodes.index = indexNewNode;
    dataNodes.uploadedDate = today.toLocaleDateString();
  
    addData({
      dbNodesName: tableNameDB.nodes,
      dbLinksName: tableNameDB.links,
      index: dataNodes.index,
      name: dataNodes.name,
      group: dataNodes.group,
      nodeSource: dataNodes.nodeSourceIndex,
      videoid: dataNodes.videoid ?? "",
      start: dataNodes.start ?? "",
      end: dataNodes.end ?? "",
      uploadedDate: dataNodes.uploadedDate,
    });

    // guarda los datos para mostrarlos en StepFinal
    setFinalFormData({ ...dataNodes });
    setFinalNodeSourceData({ ...selectedSourceNode });
    debugLog("debug", "Informacion enviada a firestore: ", dataNodes);
    reset();
  };

  /**
   * @summary : Valida el ingreso de los datos requeridos en cada paso del stepper
   * @event: trigger: Permite evaluar los campos del formulario manualmente
   */
  const handleValidate = async () => {
    const arrayStepper = [false, false, true];
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
    <Box sx={style.containerAddNodeWindow}>
      <Box
        sx={style.logoContainer}
      >
        <LogoContainer />
      </Box>
      <Divider sx={{ width: "90%", mx: "auto" }} />
      {activeStep === 0 && <Step1 control={control} errors={errors} />}
      {activeStep === 1 && (
        <Step2
          control={control}
          errors={errors}
          isNot1Step2={watch("nodeSourceIndex")}
        />
      )}
      {activeStep === 2 && <Step3 setValue={setValue} />}

      {activeStep === 3 && (
        <StepFinal
          newNodeData={finalFormData}
          selectedSourceNodeData={finalNodeSourceData}
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