import React, { useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { getPlatform } from "@src/utils/index";
import { useUIStore } from "@src/store/index";

// Permite que el diálogo se deslice desde abajo al abrirse
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const touch: string = "Usa gestos táctiles para navegar la escena";
const desk: string = "Usa el mouse para navegar la escena";

const NavigationGestures: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const [valueCheckBox, setValueCheckBox] = React.useState(false);
  
  // Al montar el componente, lee la preferencia guardada en localStorage
  useEffect(() => {
    const hide = localStorage.getItem("hideNavigationGestures");
    console.log("hideNavigationGestures : ", hide);
    if (hide === "true") {
      setOpen(false); 
      useUIStore.setState({ overlayDontShowAgain: true });
    } else {
      setOpen(true);
      useUIStore.setState({ overlayDontShowAgain: false });
    }
  }, []);

   // Cierra el diálogo y guarda la preferencia en Zustand
  const handleClose = () => {
    useUIStore.setState({ overlayDontShowAgain: valueCheckBox });
    setOpen(false);
  };

  // Maneja el cambio del checkbox y guarda/remueve la preferencia en localStorage
  const handleCheckboxChange = (e: any) => {
    const checked = e.target.checked;
    console.log("Checkbox changed: ", checked);
    setValueCheckBox(checked);
    if (checked) {
      localStorage.setItem("hideNavigationGestures", "true");
    } else {
      localStorage.removeItem("hideNavigationGestures");
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        slots={{ transition: Transition }}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {getPlatform() === "Android" || getPlatform() === "iOS"
            ? touch
            : desk}
        </DialogTitle>
        <DialogContent sx={{ padding: "20px" }}>
          <DialogContentText
            component="div"
            id="alert-dialog-slide-description"
            sx={{ "& div": { marginTop: "20px" } }}
          >
            {getPlatform() === "iOS" || getPlatform() === "Android" ? (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <img
                    src="gestures/one-swipe.svg"
                    alt="One Swipe"
                    style={{ width: 30 }}
                  />
                  <Typography variant="h6">
                    Deslizar con un dedo: Orbitar
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <img
                    src="gestures/two-swipe.svg"
                    alt="Two Swipe"
                    style={{ width: 30 }}
                  />
                  <Typography variant="h6">
                    Deslizar con dos dedos: Desplazar vista
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <img
                    src="gestures/zoom-in.svg"
                    alt="Scroll"
                    style={{ width: 30 }}
                  />
                  <Typography variant="h6">
                    Pellizcar con dos dedos Acercar/Alejar (Zoom)
                  </Typography>
                </Stack>
              </>
            ) : (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <img
                    src="gestures/left-click.svg"
                    alt="Left Click"
                    style={{ width: 30 }}
                  />
                  <Typography variant="h6">+</Typography>
                  <img src="gestures/360.svg" alt="360" style={{ width: 30 }} />
                  <Typography variant="h6">
                    Clic izquierdo + arrastrar: Orbitar
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <img
                    src="gestures/right-click.svg"
                    alt="Right Click"
                    style={{ width: 30 }}
                  />
                  <Typography variant="h6">+</Typography>
                  <img src="gestures/360.svg" alt="360" style={{ width: 30 }} />
                  <Typography variant="h6">
                    Clic derecho + arrastrar: Desplazar vista
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <img
                    src="gestures/scroll.svg"
                    alt="Scroll"
                    style={{ width: 30 }}
                  />
                  <Typography variant="h6">
                    Rueda del mouse (scroll): Acercar/Alejar
                  </Typography>
                </Stack>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between"}}>
          <FormControlLabel
            control={
              <Checkbox
                // checked={false}
                onChange={handleCheckboxChange}
              />
            }
            label="No volver a mostrar esto"
          />
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default NavigationGestures;
