/**
 * Vista principal de inicio de sesión.
 * Renderiza la ventana de acceso con opciones de login y un botón para cerrarla.
 *
 * @returns {JSX.Element} Interfaz de inicio de sesión.
 */
import { Box, Card, Typography, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ButtonClose, LogoContainer, LoginButton } from "@src/components/index";
import { useUIStore } from "@src/store/index";
import { routeList } from "@src/context/index";

import * as style from "@src/styles/loginUser/styleLoginUser";

const textHardcoded = "components.loginUser.";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const buttonCloseFunction = () => {
    useUIStore.setState({ isLoginWindowActive: false });
    navigate(routeList.root);
  };

  return (
    <Box sx={style.containerLogin}>
      <Box sx={style.headerLogin}>
        <LogoContainer />
        <ButtonClose buttonFunction={buttonCloseFunction} disabled={false} />
      </Box>

      <Box sx={{ margin: "auto" }}>
        <Card elevation={10} sx={style.cardLogin}>
          <Typography sx={style.title}>{t(textHardcoded + "title")}</Typography>

          <Box>
            <Divider
              sx={{ width: "100%", my: "1em", mx: "auto" }}
              orientation="horizontal"
              variant="middle"
            />

            <LoginButton label={t(textHardcoded + "loginGoogle")} />
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
