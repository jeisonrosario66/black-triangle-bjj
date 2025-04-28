// si es el ultimo paso, ejecuta la funcion
const lastStepSubmit = (onHandleSubmit: () => void, nextStep: () => void, activeStep: number, steps: string[]) => {
    if (activeStep + 1 === steps.length) {
        nextStep();
        onHandleSubmit();
    } else {
        nextStep();
    }
};

export default lastStepSubmit;