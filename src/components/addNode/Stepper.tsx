import * as React from "react";
import { Button, Box, MobileStepper, useTheme } from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import { useUIStore } from "@src/store/index";
import { lastStepSubmit, debugLog } from "@src/utils/index";

import { useTranslation } from "react-i18next";

import themeApp from "@src/styles/stylesThemeApp";
import * as style from "@src/styles/addNode/stylesStepper";

const textHardcoded = "components.addNode.stepper.";

type StepperComponentProps = {
  onValidate?: () => void;
  onHandleSubmit: () => void;
  reset: () => void;
};

const StepperComponent: React.FC<StepperComponentProps> = ({
  onValidate,
  onHandleSubmit,
  reset,
}) => {
  const { t } = useTranslation();
  const steps = [
    t(textHardcoded + "step1"),
    t(textHardcoded + "step2"),
    t(textHardcoded + "step3"),
    t(textHardcoded + "step4"),
  ];
  const lastStep = steps.length;

  // Configuracion de stepper
  const activeStep = useUIStore((state) => state.activeStep);

  const nextStep = useUIStore((state) => state.nextStep);
  const prevStep = useUIStore((state) => state.prevStep);

  const isStepOptional = (step: number) => {
    return step === 3;
  };

  const handleNext = async () => {
    // Validar el paso actual antes de avanzar
    const isValid = onValidate ? await onValidate() : true; // Llama a la función de validación si existe
    const isValidThisStep = Array.isArray(isValid)
      ? isValid[activeStep]
      : isValid;

    if (!isValidThisStep) {
      debugLog("debug", `Step ${activeStep}: Invalido `);
      return; // Si no es válido, no avanza al siguiente paso
    }
    lastStepSubmit(onHandleSubmit, nextStep, activeStep, steps);
  };

  const handleBack = () => {
    prevStep();
  };

  const handleReset = () => {
    useUIStore.getState().setActiveStep(0);
    reset();
  };

  const handleSkip = () => {
    lastStepSubmit(onHandleSubmit, nextStep, activeStep, steps);
  };
  const theme = useTheme();
  return (
    <MobileStepper
      variant="dots"
      steps={steps.length}
      position="static"
      activeStep={activeStep}
      sx={style.containerStepper}
      nextButton={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row-reverse",
          }}
        >
          {activeStep == lastStep ? (
            <Button size="small" onClick={handleReset}>
              {t(textHardcoded + "reset")}
              {theme.direction === "rtl" ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          ) : (
            <Button size="small" onClick={handleNext}>
              {t(textHardcoded + "next")}
              {theme.direction === "rtl" ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          )}

          {isStepOptional(activeStep) && (
            <Button
              size="small"
              onClick={handleSkip}
              sx={{ color: themeApp.palette.action.success, ml: 1 }}
            >
              {t(textHardcoded + "skip")}
            </Button>
          )}
        </Box>
      }
      backButton={
        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
          {t(textHardcoded + "back")}
        </Button>
      }
    />
  );
};

export default StepperComponent;
