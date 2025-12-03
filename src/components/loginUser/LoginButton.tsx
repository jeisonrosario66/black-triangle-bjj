/**
 * Botón de inicio de sesión mediante Auth0.
 * Renderiza un botón estilizado que inicia sesión usando Google.
 *
 * @param {LoginButtonProps} props Propiedades del componente, incluyendo la etiqueta del botón.
 * @returns {JSX.Element} Botón de inicio de sesión con redirección Auth0.
 */
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Typography } from "@mui/material";
import * as style from "@src/styles/loginUser/styleLoginUser";
import React from "react";

type LoginButtonProps = {
  label: string;
};

const LoginButton: React.FC<LoginButtonProps> = ({ label }) => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Button onClick={() => loginWithRedirect()} sx={style.googleButton}>
      <img src="./google-logo.png" alt="Google" />
      <Typography sx={style.googleText}>{label}</Typography>
    </Button>
  );
};

export default LoginButton;
