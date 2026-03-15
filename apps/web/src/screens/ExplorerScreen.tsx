import { SystemCardOption, SystemCardUI } from "@bt/shared/context";
import { getSystemshared } from "@bt/shared/services/firebaseServiceShared";
import { capitalizeFirstLetter } from "@bt/shared/utils/capitalizeFirstLetter";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import PersonPinOutlinedIcon from "@mui/icons-material/PersonPinOutlined";
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { routeList } from "@src/context/configGlobal";
import { database } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleExplorerScreen";
import * as loadingStyle from "@src/styles/screens/styleLoading";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Pantalla de exploración de sistemas en entorno web.
 * Orquesta la carga de sistemas desde Firestore mediante servicios compartidos,
 * gestiona el filtrado por categoría (setSystem) y permite la navegación hacia
 * la vista de detalle del curso correspondiente.
 *
 * @returns {JSX.Element} Vista de listado de sistemas con filtros y navegación a detalle.
 */
export default function ExplorerScreen() {
  const navigate = useNavigate();

  const [nivelSeleccionado, setNivelSeleccionado] = useState<string>();
  const [systems, setSystems] = useState<SystemCardUI[]>([]);
  const [tagNavigation, setTagNavigation] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSystems = async () => {
      try {
        const data = await getSystemshared(getDocs, collection, database);
        const systemsWithExtras = data.flatMap(
          (group: { name: string; systems: SystemCardOption[] }) =>
            group.systems.map((system) => ({
              ...system,
              setSystem: group.name,
              coverUrl: `https://picsum.photos/1500/800?random=${Math.random()}`,
              name: system.name,
            })),
        );
        setSystems(systemsWithExtras);
        setTagNavigation(data.map((s) => s.name));
      } catch (error) {
        console.error("Error cargando sistemas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSystems();
  }, []);

  const systemsFiltrados = useMemo(() => {
    if (!nivelSeleccionado) return systems;
    return systems.filter((s) => s.setSystem === nivelSeleccionado);
  }, [systems, nivelSeleccionado]);

  if (loading) {
    return (
      <Box sx={loadingStyle.loading}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={styles.screen}>
      {/* Chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
        {tagNavigation.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            clickable
            color={nivelSeleccionado === tag ? "primary" : "default"}
            onClick={() =>
              setNivelSeleccionado(nivelSeleccionado === tag ? undefined : tag)
            }
          />
        ))}
      </Stack>

      <Typography variant="h6">Explorar Sistemas</Typography>
      <Divider sx={{ my: 2 }} />

      {/* Cards */}
      <Stack spacing={3}>
        {systemsFiltrados.map((item) => (
          <Card key={item.valueNodes} elevation={3}>
            <CardActionArea
              onClick={() =>
                navigate(
                  routeList.courseDetailScreen.replace(
                    ":systemName",
                    item.label + "-" + item.coach.replace(/ /g, "_"),
                  ),
                  {
                    state: {
                      system: item,
                      urlLocal: item.label + "-" + item.coach.replace(/ /g, "_"),
                    },
                  },
                )
              }
            >
                <CardMedia
                  component="img"
                  image={item.coverUrl}
                  sx={{ height: 300, objectFit: "contain" }}
                />
            </CardActionArea>

            <Box sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                {item.name}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  <LabelOutlinedIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", mr: 0.5 }}
                  />
                  {capitalizeFirstLetter(item.setSystem)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <PersonPinOutlinedIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", mr: 0.5 }}
                  />
                  {capitalizeFirstLetter(item.coach)}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
