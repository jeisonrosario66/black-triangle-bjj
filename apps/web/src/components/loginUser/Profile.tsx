import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Avatar,
  Typography,
} from "@mui/material";

/**
 * Componente que muestra el estado del usuario autenticado.
 * Renderiza el nombre y avatar del usuario cuando la sesión está activa.
 *
 * @returns {JSX.Element} Interfaz de estado del usuario.
 */
export default function UserStatus() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p>Loading...</p>;

  if (!isAuthenticated) return <p>No estás logeado</p>;

  return (
    <Box>
      <Typography>
        Hola, {user?.name}
      </Typography>
      <Avatar
        alt={user?.name ?? "User"}
        src={user?.picture ?? undefined}
      />
    </Box>
  );
}
