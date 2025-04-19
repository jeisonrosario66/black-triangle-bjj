import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import useUIStore from "@src/store/useCounterStore";
import { lastStepSubmit } from "@src/utils/lastStepSubmit";
import themeApp from "@src/styles/stylesThemeApp";
import * as style from "@src/styles/stylesStepper";

const steps = ["Estas creando un nuevo nodo", "Carga un recurso","Conecta el nodo"];
type StepperComponentProps = {
  onValidate?: () => void;
  onHandleSubmit: () => void;
};

const StepperComponent: React.FC<StepperComponentProps> = ({
  onValidate,
  onHandleSubmit,
}) => {
  const isUploadFirestore = useUIStore((state) => state.isUploadFirestore);

  // Configuracion de stepper
  const activeStep = useUIStore((state) => state.activeStep);

  const nextStep = useUIStore((state) => state.nextStep);
  const prevStep = useUIStore((state) => state.prevStep);

  const isStepOptional = (step: number) => {
    return step === 1;
  };

  const handleNext = async () => {
    // Validar el paso actual antes de avanzar
    const isValid = onValidate ? await onValidate() : true; // Llama a la función de validación si existe
    const isValidThisStep = Array.isArray(isValid)
      ? isValid[activeStep]
      : isValid;

    if (!isValidThisStep) {
      return; // Si no es válido, no avanza al siguiente paso
    }
    lastStepSubmit(onHandleSubmit, nextStep, activeStep, steps);
  };

  const handleBack = () => {
    prevStep();
  };

  const handleReset = () => {
    useUIStore.getState().setActiveStep(0);
  };

  const handleSkip = () => {
    lastStepSubmit(onHandleSubmit, nextStep, activeStep, steps);
  };

  return (
    <Box sx={style.containerStepper}>
      {activeStep === steps.length ? (
        <React.Fragment>
            {/* <Typography sx={{ mt: 2, mb: 1 }}>
              Todos los pasos completados
            </Typography> */}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button disabled={isUploadFirestore} onClick={handleReset}>
              Volver
            </Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {/* <Typography sx={{ mt: 2, mb: 1 }}>Paso {activeStep + 1}</Typography> */}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1, color: themeApp.palette.action.success }}
            >
              Retroceder
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button
                color="inherit"
                onClick={handleSkip}
                sx={{ mr: 1, color: themeApp.palette.action.success }}
              >
                Saltar
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
            </Button>
          </Box>
        </React.Fragment>
      )}
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Opcional</Typography>
            );
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default StepperComponent;
