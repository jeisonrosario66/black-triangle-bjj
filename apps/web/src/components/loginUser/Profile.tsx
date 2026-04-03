import {
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSession } from "@src/hooks/index";

/**
 * Componente que muestra el estado del usuario autenticado.
 * Renderiza el nombre y avatar del usuario cuando la sesión está activa.
 *
 * @returns {JSX.Element} Interfaz de estado del usuario.
 */
export default function UserStatus() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useSession();

  if (isLoading) return <p>{t("components.profile.loading")}</p>;

  if (!isAuthenticated) return <p>{t("components.profile.notLoggedIn")}</p>;

  return (
    <Box>
      <Typography>
        {t("components.profile.greeting", { name: user?.name ?? "User" })}
      </Typography>
      <Avatar
        alt={user?.name ?? "User"}
        src={user?.picture ?? undefined}
      />
    </Box>
  );
}
