import Button from "@mui/material/Button";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import useUIStore from "@src/store/useCounterStore";
import themeApp from "@src/styles/stylesThemeApp";
import Box from "@mui/material/Box";
const theme = themeApp;
const buttonClick = () => {
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
          marginBottom: "2rem",
          height: "15%",
        }}
      >
        <Button
          size="medium"
          disabled={isUploadFirestore}
          onClick={buttonClick}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: theme.palette.background.paper,
            "&:hover": {
              backgroundColor: "#ccc",
              opacity: 0.8,
            },
            color: theme.palette.action.deactivate,
          }}
        >
          <CloseOutlined />
        </Button>
        <h1
          style={{
            color:
              activeStep == 2
                ? theme.palette.action.success
                : theme.palette.action.active,
            textAlign: "center",
            margin: "60px 0",
          }}
        >
          {activeStep == 2 ? titleFinal : title}
        </h1>
      </Box>
    </>
  );
};
