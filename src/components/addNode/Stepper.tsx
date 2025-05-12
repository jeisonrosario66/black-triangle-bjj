import * as React from "react";
import {
  Typography,
  StepLabel,
  Button,
  Step,
  Stepper,
  Box,
} from "@mui/material/index";

import { useUIStore } from "@src/store/index";
import { lastStepSubmit } from "@src/utils/index";

import { useTranslation } from "react-i18next";

import themeApp from "@src/styles/stylesThemeApp";
import * as style from "@src/styles/addNode/stylesStepper";

const textHardcoded = "components.addNode.stepper.";

type StepperComponentProps = {
  onValidate?: () => void;
  onHandleSubmit: () => void;
};

const StepperComponent: React.FC<StepperComponentProps> = ({
  onValidate,
  onHandleSubmit,
}) => {
  const { t } = useTranslation();
  const steps = [
    t(textHardcoded + "step1"),
    t(textHardcoded + "step2"),
    t(textHardcoded + "step3"),
  ];
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
              {t(textHardcoded + "button1")}
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
              {t(textHardcoded + "button2")}
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button
                color="inherit"
                onClick={handleSkip}
                sx={{ mr: 1, color: themeApp.palette.action.success }}
              >
                {t(textHardcoded + "button3")}
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ?  t(textHardcoded + "finish") :  t(textHardcoded + "next")}
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
              <Typography variant="caption">{t(textHardcoded + "optional")}</Typography>
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
