import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Slide from "@mui/material/Slide";
import Collapse from "@mui/material/Collapse";
import useUIStore from "@src/store/useCounterStore";

export default function OutlinedAlerts() {
  const showAlert = useUIStore((state) => state.showAlert);
  const alertMessage = useUIStore((state) => state.alertMessage);
  const alertSeverity = useUIStore((state) => state.alertSeverity);

  return (
    <Stack
      sx={{ width: "80%", position: "absolute", bottom: 20, zIndex: 9999}}
      spacing={2}
    >
      <Slide direction="left" in={showAlert} mountOnEnter unmountOnExit>
        <Collapse in={showAlert}>
          <Alert  severity={alertSeverity}>
            {alertMessage}
          </Alert>
        </Collapse>
      </Slide>
    </Stack>
  );
}
