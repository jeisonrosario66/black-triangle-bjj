import Button from "@mui/material/Button";
import AddCircleOutlined from "@mui/icons-material/AddCircleOutlined";
import useUIStore from "@src/store/useCounterStore";
import buttonStyle from "@src/styles/stylesButtonAddNode"



const buttonClick = () => {
    useUIStore.setState({ isAddNodeActive: true });
};
const AddNodeButton = () => {
  return (
    <Button
      onClick={buttonClick}
      style={buttonStyle}
      variant="outlined"
      color="primary"
      startIcon={<AddCircleOutlined />}
    >
      Agregar nodos
    </Button>
  );
};

export default AddNodeButton;
