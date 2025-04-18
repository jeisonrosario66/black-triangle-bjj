// Importaciones externas
import { signInWithPopup } from "firebase/auth";
import { Box, Card, Typography, Button, Divider } from "@mui/material";

// Importaciones internas
import * as style from "@src/styles/loginUser/styleLoginUser";
import LogoContainer from "@src/components/LogoComponent";
import ButtonClose from "@src/components/ButtonClose";
import { auth, provider } from "@src/hooks/fireBase";
import useUIStore from "@src/store/useCounterStore";

export default function Login() {
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
      const result = await signInWithPopup(authFirebase, provideFirebase);
      const user = result.user; // Información del usuario autenticado
      console.log("Usuario autenticado:", user);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <Box sx={style.containerLogin}>
      {/* Botón para cerrar la ventana */}
      <ButtonClose
        buttonFunction={buttonCloseFunction}
        disabled={false}
      />

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

          {/* Botón para iniciar sesión con Google */}
          <Button onClick={handleGoogleSignIn} sx={style.googleButton}>
            <img src="./google-logo.png" alt="Google" />
            <Typography sx={style.googleText}>
              Iniciar sesión con Google
            </Typography>
          </Button>
        </Box>
      </Card>
    </Box>
  );
}