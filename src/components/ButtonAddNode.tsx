import Button from "@mui/material/Button";
import AddCircleOutlined from "@mui/icons-material/AddCircleOutlined";
import useUIStore from "@src/store/useCounterStore";

const buttonClick = () => {
    useUIStore.setState({ isAddNodeActive: true });
//   console.log("Botón presionado: ",useUIStore.getState().isAddNodeActive);
};
const AddNodeButton = () => {
  return (
    <Button
      onClick={buttonClick}
      style={{
        position: "absolute",
        top: 30,
        left: 30,
        zIndex: 10,
        display: "flex",
        color: "azure",
        borderColor: "azure",
        width: 150,
        height: 60,
      }}
      variant="outlined"
      color="primary"
      startIcon={<AddCircleOutlined />}
    >
      Agregar nodo
    </Button>
  );
};

export default AddNodeButton;
