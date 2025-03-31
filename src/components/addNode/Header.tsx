import Button from "@mui/material/Button";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import useUIStore from "@src/store/useCounterStore";

const buttonClick = () => {
  useUIStore.setState({ isAddNodeActive: false });
};

export default ({ description }: { description?: string }) => (
  <>
    <Button size="medium" onClick={buttonClick}>
      <CloseOutlined sx={{ color: "red" }} />
    </Button>
    <h1 className="h1">Agregar nodo</h1>
    <p style={{ fontSize: 14, lineHeight: 1.3 }}>{description}</p>
  </>
);
