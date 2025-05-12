import { signInWithPopup } from "firebase/auth";
import { Box, Card, Typography, Button, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";

import { ButtonClose, LogoContainer } from "@src/components/index";
import { auth, provider } from "@src/hooks/index";
import { useUIStore } from "@src/store/index";

import * as style from "@src/styles/loginUser/styleLoginUser";

const textHardcoded = "components.loginUser.";

export default function Login() {
  const { t } = useTranslation();
  
  // Referencias a Firebase Auth y el proveedor de Google
  const provideFirebase = provider;
  const authFirebase = auth;

  // Función para cerrar la ventana de inicio de sesión
  const buttonCloseFunction = () => {
    useUIStore.setState({ isLoginWindowActive: false });
  };

  // Función para manejar el inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      // Abre el popup de inicio de sesión con Google
      await signInWithPopup(authFirebase, provideFirebase);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <Box sx={style.containerLogin}>
      {/* Botón para cerrar la ventana */}
      <ButtonClose buttonFunction={buttonCloseFunction} disabled={false} />

      {/* Logo de la aplicación */}
      <LogoContainer />

      {/* Tarjeta de inicio de sesión */}
      <Card elevation={10} sx={style.cardLogin}>
        <Typography sx={style.title}>Login</Typography>

        <Box>
          {/* Línea divisoria */}
          <Divider
            sx={{ width: "100%", my: "1em", mx: "auto" }}
            orientation="horizontal"
            variant="middle"
          />

          <Button onClick={handleGoogleSignIn} sx={style.googleButton}>
            <img src="./google-logo.png" alt="Google" />
            <Typography sx={style.googleText}>
              {t(textHardcoded+"loginGoogle")}
            </Typography>
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
