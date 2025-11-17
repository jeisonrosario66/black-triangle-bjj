import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  Step1,
  Step2,
  Step3,
  Step4,
  StepFinal,
  StepperComponent,
} from "@src/components/index";
import {
  NodeOptionFirestone,
  NodeFormData,
  tableNameDB,
} from "@src/context/index";
import { addData, getIndex, getDataFirestore } from "@src/services/index";
import { useUIStore } from "@src/store/index";
import { debugLog } from "@src/utils/index";

import * as style from "@src/styles/addNode/stylesAddNodeWindow";
import * as generalStyleToform from "@src/styles/stylesApp";

const textHardcoded = "components.addNode.addNodeWindow.";

/**
 * Componente contenedor de los steps del formulario
 */
const AddNodeForm: React.FC = () => {
  const { t } = useTranslation();

  /**
   * Esquema de validación de datos del formulario usando YUP
   */
  const schema = yup.object({
    index: yup.number().required(),
    name: yup
      .string()
      .min(4, t(textHardcoded + "textRequired1"))
      .required(t(textHardcoded + "textRequired2")),
    group: yup.string().required(t(textHardcoded + "textRequired3")),
    nodeSourceIndex: yup.number().required(t(textHardcoded + "textRequired4")), // No tiene Efecto
  });

  /**
   * Estado que almacena la información final del formulario
   * Se inicializa con valores por defecto
   */
  const [finalFormData, setFinalFormData] = useState<NodeFormData>({
    index: 0,
    name: "",
    group: "",
    nodeSourceIndex: 1,
    videoid: "",
    start: "",
    end: "",
  });

  /**
   * Estado que guarda la información del nodo fuente seleccionado
   */
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

  const activeStep = useUIStore((state) => state.addNodeActiveStep);

  /**
   * Lista de nodos obtenidos desde Firestore
   */
  const [nodeOptions, setNodeOptions] = useState<NodeOptionFirestone[]>([]);

  /**
   * Llama a `getDataNodes` una sola vez al montar el componente
   */
  useEffect(() => {
    const getDataNodes = async () => {
      try {
        const dataNodes = await getDataFirestore(
          tableNameDB.AllSystemsNodesArray,
          "nodes"
        );
        setNodeOptions(dataNodes || []);
      } catch (error) {
        console.error("Error al obtener nodos desde Firestore:", error);
        setNodeOptions([]);
      }
    };

    getDataNodes();
  }, []);

  /**
   * Envía la información del formulario a Firestore
   * @param dataNodes Datos ingresados en el formulario
   */
  const onSubmit: SubmitHandler<NodeFormData> = async (dataNodes) => {
    // Modifica el estado global para indicar que se están cargando datos a Firestore
    useUIStore.setState({ isUploadFirestore: true });

    // Obtiene el índice del último nodo y lo incrementa en 1
    const indexNewNode = (await getIndex()) + 1;

    const date = new Date();
    const today = new Date(date);

    const selectedIndex = dataNodes.nodeSourceIndex;

    // Información del nodo de origen
    const selectedSourceNode = nodeOptions.find(
      (node) => node.index === selectedIndex
    );

    dataNodes.index = indexNewNode;
    dataNodes.uploadedDate = today.toLocaleDateString();
    const nodeNames = dataNodes.name.split(",");

    addData({
      dbNodesName: tableNameDB.nodes,
      dbLinksName: tableNameDB.links,
      index: dataNodes.index,
      name_es: nodeNames[0],
      name_en: nodeNames[1],
      group: dataNodes.group,
      nodeSource: dataNodes.nodeSourceIndex,
      videoid: dataNodes.videoid ?? "",
      start: dataNodes.start ?? "",
      end: dataNodes.end ?? "",
      uploadedDate: dataNodes.uploadedDate,
    });

    // Guarda los datos para mostrarlos en StepFinal
    setFinalFormData({ ...dataNodes });
    setFinalNodeSourceData({ ...selectedSourceNode });
    debugLog("debug", "Información enviada a Firestore: ", dataNodes);
    reset();
  };

  /**
   * Valida el ingreso de los datos requeridos en cada paso del stepper
   * @returns Array de booleanos que indica la validez de cada paso
   */
  const handleValidate = async () => {
    const arrayStepper = [false, false, false, false];
    const isValidStep1 = await trigger(["name"]);
    const isValidStep2 = await trigger(["group"]);
    const isValidStep3_videoid = watch("videoid");
    const isValidStep3_start = watch("start");
    const isValidStep3_end = watch("end");
    const isValidStep4 = watch("nodeSourceIndex");

    if (isValidStep1) arrayStepper[0] = true;
    if (isValidStep2) arrayStepper[1] = true;
    if (isValidStep3_videoid && isValidStep3_start && isValidStep3_end)
      arrayStepper[2] = true;

    // Si el nodo fuente no es el valor por defecto (1), se marca como válido
    if (isValidStep4 === 1) {
      debugLog(
        "warn",
        "Escoge una conexión de origen para el nodo o presiona en saltar"
      );
    } else {
      arrayStepper[3] = true;
    }

    return arrayStepper;
  };

  return (
    <>
      {generalStyleToform.globalStyles}
      <Box sx={style.containerAddNodeWindow}>
        <Divider sx={{ width: "90%", mx: "auto" }} />
        {activeStep === 0 && <Step1 control={control} errors={errors} />}
        {activeStep === 1 && <Step2 control={control} errors={errors} />}
        {activeStep === 2 && (
          <Step3 setValue={setValue} videoIdSeleted={watch("videoid")} />
        )}
        {activeStep === 3 && <Step4 control={control} errors={errors} />}{" "}
        {activeStep === 4 && (
          <StepFinal
            newNodeData={finalFormData}
            selectedSourceNodeData={finalNodeSourceData}
          />
        )}
        <StepperComponent
          onValidate={handleValidate}
          onHandleSubmit={handleSubmit(onSubmit)}
          reset={reset}
        />
      </Box>
    </>
  );
};

export default AddNodeForm;
