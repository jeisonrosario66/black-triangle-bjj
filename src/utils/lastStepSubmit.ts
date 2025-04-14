// si es el ultimo paso, ejecuta la funcion
export const lastStepSubmit = (onHandleSubmit: () => void, nextStep: () => void, activeStep: number, steps: string[]) => {
    if (activeStep + 1 === steps.length) {
        nextStep();
        onHandleSubmit();
        console.log("ultimo paso")
    } else {
        nextStep();
        console.log("siguiente paso")
    }
};