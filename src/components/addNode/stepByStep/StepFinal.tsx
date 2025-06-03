import React from "react";
import { Box, LinearProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { NodeOptionFirestone, NodeFormData } from "@src/context/index";
import { Graph2D, Header } from "@src/components/index";

import * as style from "@src/styles/addNode/styleStepByStep";

const textHardcoded = "components.addNode.stepFinal.";

type StepFinalProps = {
  newNodeData: NodeFormData;
  selectedSourceNodeData: NodeOptionFirestone;
};

const StepFinal: React.FC<StepFinalProps> = ({
  newNodeData: dataNodes,
  selectedSourceNodeData: selectedSourceNode,
}) => {
  const { t } = useTranslation();
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
          <h3>{t(textHardcoded+"text1")}:</h3>
          <p>
            <strong>{t(textHardcoded+"text2")}:</strong> {dataNodes.index}
          </p>
          <p>
            <strong>{t(textHardcoded+"text3")}:</strong> {dataNodes.name}
          </p>
          <p>
            <strong>{t(textHardcoded+"text4")}:</strong> {dataNodes.group}
          </p>
          <p>
            <strong>{t(textHardcoded+"text5")}:</strong>{" "}
            {" {" + dataNodes.nodeSourceIndex + "}"}
          </p>
          <p>
            <strong>{t(textHardcoded+"text6")}:</strong>{" "}
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

export default StepFinal;
