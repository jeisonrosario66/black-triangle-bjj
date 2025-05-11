import React, { useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { GraphData } from "@src/context/exportType";
import Box from "@mui/material/Box";
import * as style from "@src/styles/addNode/styleStepByStep";
import CircularProgress from '@mui/material/CircularProgress';

type Graph2DProps = {
  graphStepFinalData: GraphData;
  isUploadFirestore: boolean;
};
const Graph2D: React.FC<Graph2DProps> = ({ graphStepFinalData, isUploadFirestore }) => {
  const graphRef = useRef<any>(null); // Referencia para el grafo 3D
  useEffect(() => {
    if (graphRef.current && graphStepFinalData?.nodes?.length >= 2) {
      const [n1, n2] = graphStepFinalData.nodes;

      const midX = n1.x !== undefined && n2.x !== undefined ? (n1.x + n2.x) / 2 : 0;
      const midY = n1.y !== undefined && n2.y !== undefined ? (n1.y + n2.y) / 2 : 0;

      // Primer paso: centramos suavemente
      setTimeout(() => {
        graphRef.current.centerAt(midX, midY, 1500); // duración más larga = más suave
      }, 300);

      // Segundo paso: zoom suave después
      setTimeout(() => {
        graphRef.current.zoom(8, 1000);
      }, 1800);
    }
  }, [graphStepFinalData]);
  return (
    <>
    <Box sx={style.graph2DProgress(isUploadFirestore)} >
      <CircularProgress  />
    </Box>
    <Box sx={style.graph2DResult(isUploadFirestore)} >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphStepFinalData}
        nodeRelSize={3}
        linkWidth={10}
        dagMode={"td"}
        enablePanInteraction={false}
        enablePointerInteraction={false}
        enableZoomInteraction={false}
        minZoom={8}
        linkCurvature={0.1}
        linkDirectionalParticles={4}
        height={150}

        nodeCanvasObject={(node, ctx, globalScale) => {
        // Label que se mostrará en el nodo
        const label = node.name;

        // Ajuste dinámico del tamaño del texto según el zoom
        const fontSize = 18 / globalScale;

        // Radio del nodo circular
        const r = 6;

        // Guarda el estado del contexto antes de aplicar transformaciones
        ctx.save();

        // Traslada el contexto al punto (x, y) del nodo
        if (typeof node.x === "number" && typeof node.y === "number") {
          ctx.translate(node.x, node.y);
        }
        
        // Dibuja el círculo del nodo
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI, false); // Círculo centrado
        ctx.fillStyle = "#1976d2";               // Color de relleno del nodo
        ctx.fill();                              // Rellena el nodo
        ctx.lineWidth = 0.4    ;                       // Grosor del borde del nodo (si se usa ctx.stroke)
        ctx.strokeStyle ="black"
        ctx.stroke()

        // Estilo del texto
        ctx.font = `${fontSize}px Sans-Serif`;  // Fuente y tamaño del texto
        ctx.textAlign = "center";               // Alineación horizontal centrada
        ctx.textBaseline = "middle";            // Alineación vertical centrada

        // Dibuja el borde del texto (stroke)
        ctx.strokeStyle = "black";              // Color del borde del texto
        ctx.lineWidth = 0.2;                    // Grosor del borde del texto
        ctx.strokeText(label as string, 0, 0);  // Aplica el borde del texto

        // Dibuja el texto principal (relleno)
        ctx.fillStyle = "white";                // Color del texto
        ctx.fillText(label as string, 0, 0);    // Escribe el texto encima del borde

        // Restaura el estado original del contexto
        ctx.restore();

        }}
      />
    </Box>
    </>
  );
};

export default Graph2D;
