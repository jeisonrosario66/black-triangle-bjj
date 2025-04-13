import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";  
import {StepFinal} from "@src/components/addNode/StepByStep"
import Typography from "@mui/material/Typography";
const steps = ["Estas creando un nuevo nodo", "Conecta el nodo"];
import useUIStore from "@src/store/useCounterStore";
type StepperComponentProps = {
  onValidate?: () => void; // la haces opcional si no siempre la necesitas
  onHandleSubmit: () => void;
};

const StepperComponent: React.FC<StepperComponentProps> = ({
  onValidate,
  onHandleSubmit,
}) => {
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
    nextStep();
    if (activeStep === steps.length - 1) {
      onHandleSubmit();
    }
  };

  const handleBack = () => {
    prevStep();
  };

  const handleReset = () => {
    useUIStore.getState().setActiveStep(0);
  };

  const handleSkip = () => {
    nextStep();
  };

  return (
    <Box sx={{ width: "100%" }}>
      {activeStep === steps.length ? (
       <StepFinal handleReset={handleReset}/>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Paso {activeStep + 1}</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Retroceder
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
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
