/**
 * Botón de inicio de sesión mediante Google con Firebase Auth.
 * Renderiza un botón estilizado que inicia sesión usando Google.
 *
 * @param {LoginButtonProps} props Propiedades del componente, incluyendo la etiqueta del botón.
 * @returns {JSX.Element} Botón de inicio de sesión con Google.
 */
import { Button, Typography } from "@mui/material";
import * as style from "@src/styles/loginUser/styleLoginUser";
import React from "react";
import { useSession } from "@src/hooks/index";

type LoginButtonProps = {
  label: string;
};

const LoginButton: React.FC<LoginButtonProps> = ({ label }) => {
  const { login, isLoading } = useSession();

  return (
    <Button onClick={() => void login()} sx={style.googleButton} disabled={isLoading}>
      <img src="./google-logo.png" alt="Google" />
      <Typography sx={style.googleText}>{label}</Typography>
    </Button>
  );
};

export default LoginButton;
