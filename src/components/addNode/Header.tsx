import Button from "@mui/material/Button";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import useUIStore from "@src/store/useCounterStore";
import themeApp from "@src/styles/stylesThemeApp";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
const theme = themeApp;
const buttonClick = () => {
  useUIStore.setState({ isAddNodeActive: false });
  useUIStore.setState({ activeStep: 0 })
};

export default () => (
  <>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "30px",
        height: "20%",
      }}
    >
      <Button
        size="medium"
        onClick={buttonClick}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.background.paper,
            opacity: 0.8,
          },
          color: theme.palette.action.deactivate,
        }}
      >
        <CloseOutlined />
      </Button>
      <h1 style={{ textAlign:"center", margin:"60px 0" }}>Agregando nodo</h1>
      <Divider  />


    </Box>
  </>
);
