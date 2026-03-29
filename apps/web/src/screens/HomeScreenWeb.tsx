import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { useMemo } from "react";
import * as style from "@src/styles/screens/styleHomeScreenWeb";

import { testRoutes, testSystems } from "@bt/shared/context/configShared";
import { shape } from "@bt/shared/design-system/index";
import { pickRandom } from "@bt/shared/hooks/index";
import {
  AppBarNewHeader,
  PageContainer,
  SectionHeader,
  SimpleGrid,
} from "@src/components/index";

type RouteItem = (typeof testRoutes)[number];
type SystemItem = (typeof testSystems)[number];

/**
 * Pantalla principal web de inicio de la aplicación.
 * Presenta un resumen del progreso del usuario, rutas de aprendizaje recomendadas
 * y accesos rápidos para explorar sistemas, actuando como punto de entrada al flujo educativo.
 *
 * @returns {JSX.Element} Vista principal de inicio para entorno web.
 */
export default function HomeScreenWeb() {
  const theme = useTheme();

  const randomSystems = useMemo(
    () => pickRandom(testSystems, 3) as SystemItem[],
    [],
  );
  const randomRoutes = useMemo(
    () => pickRandom(testRoutes, 2) as RouteItem[],
    [],
  );

  return (
    <Box sx={style.page}>
      <AppBarNewHeader />
      <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
        <Stack spacing={{ xs: 4, md: 6 }}>
          {/* ===== Progreso actual ===== */}
          <Box>
            <SectionHeader title="Continúa tu progreso" />
            <Card sx={style.progressCard}>
              <CardContent sx={style.progressContent}>
                <Typography variant="subtitle1" gutterBottom>
                  Analizando “Curso Actual”
                </Typography>

                <Typography variant="body2" sx={style.cardLabelStyle}>
                  Clase 4 de 10 · 40%
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={40}
                  sx={style.progressBar}
                />

                <Button
                  sx={style.cardBottomStyle}
                  variant="outlined"
                  onClick={() => console.log("Seguir viendo funcion")}
                >
                  Seguir viendo
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* ===== Rutas recomendadas ===== */}
          <Box>
            <SectionHeader
              title="Rutas de Aprendizaje Recomendadas"
              action={
                <Button
                  endIcon={<ArrowForwardIosIcon />}
                  variant="outlined"
                  size="small"
                  sx={style.sectionAction}
                >
                  Ver todas
                </Button>
              }
            />

            <SimpleGrid columns={{ xs: 1, md: 2 }} gap={2}>
              {randomRoutes.map((item) => (
                <Card key={item.title} sx={style.routeCard}>
                  <CardContent sx={style.routeHeader}>
                    <Typography sx={style.cardTitleStyle} variant="subtitle1">
                      {item.title}
                    </Typography>
                    <Typography sx={style.routeMeta}>
                      Nivel · {item.level}
                    </Typography>
                  </CardContent>

                  <Box
                    sx={{
                      borderStartEndRadius: 0,
                      borderStartStartRadius: 0,
                      borderEndStartRadius: shape.borderRadius.md,
                      borderEndEndRadius: shape.borderRadius.md,
                      backgroundColor: theme.palette.surfaceVariant,
                    }}
                  >
                    <Button
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      onClick={() => console.log("Ir a la ruta " + item.title)}
                      sx={style.cardRouteButtom}
                    >
                      {item.lessons} Lecciones
                    </Button>
                  </Box>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* ===== Explora Sistemas ===== */}
          <Box>
            <SectionHeader
              title="Explorar Sistemas"
              action={
                <Button
                  endIcon={<ArrowForwardIosIcon />}
                  variant="outlined"
                  size="small"
                  sx={style.sectionAction}
                >
                  Ver todos
                </Button>
              }
            />

            <SimpleGrid columns={{ xs: 1, md: 3 }} gap={2}>
              {randomSystems.map((item) => (
                <Card key={item.title} sx={style.systemCard}>
                  <Button
                    sx={style.cardExplorerButtom}
                    fullWidth
                    onClick={() =>
                      console.log("Explorar sistema " + item.title)
                    }
                  >
                    {item.title}
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </Stack>
      </PageContainer>
    </Box>
  );
}
