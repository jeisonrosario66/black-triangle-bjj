import useUIStore from "@src/store/useCounterStore";
import themeApp from "@src/styles/stylesThemeApp";
import Box from "@mui/material/Box";
import ButtonClose from "@src/components/ButtonClose";

const theme = themeApp;
const buttonCloseFunction = () => {
  useUIStore.setState({ isAddNodeActive: false });
  useUIStore.setState({ activeStep: 0 });
};
const title = "Agregando nodo";
const titleFinal = "Nodo Agregado";

export default () => {
  const activeStep = useUIStore((state) => state.activeStep);
  const isUploadFirestore = useUIStore((state) => state.isUploadFirestore);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ButtonClose
          buttonFunction={buttonCloseFunction}
          isUploadFirestore={isUploadFirestore}
        />
        <h1
          style={{
            color:
              activeStep == 2
                ? theme.palette.action.success
                : theme.palette.text.secondary,
            textAlign: "center",
          }}
        >
          {activeStep == 2 ? titleFinal : title}
        </h1>
      </Box>
    </>
  );
};
