import {
  Box,
  Divider,
  Typography,
  Container,
  Paper,
  LinearProgress,
  Button,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import { useTheme } from "@mui/material/styles";
import * as style from "@src/styles/screens/styleHomeScreenWeb";

import { shape } from "@bt/shared/design-system/index";
import { pickRandom } from "@bt/shared/hooks/index";
import { testSystems, testRoutes } from "@bt/shared/context/configShared";
import { AppBarNewHeader } from "@src/components/index";

/**
 * Pantalla principal web de inicio de la aplicación.
 * Presenta un resumen del progreso del usuario, rutas de aprendizaje recomendadas
 * y accesos rápidos para explorar sistemas, actuando como punto de entrada al flujo educativo.
 *
 * @returns {JSX.Element} Vista principal de inicio para entorno web.
 */
export default function HomeScreenWeb() {
  const theme = useTheme();

  const randomSystems = pickRandom(testSystems, 3);
  const randomRoutes = pickRandom(testRoutes, 2);

  return (
    <Box sx={style.boxContainer}>
      <AppBarNewHeader />
      {/* CONTENIDO */}
      <Container maxWidth="lg">
        {/* ===== Progreso actual ===== */}
        <Box sx={style.sectionStyle}>
          <Typography variant="body1" gutterBottom sx={style.cardTitleStyle}>
            Continúa tu progreso
          </Typography>

          <Divider sx={style.dividerStyle} />

          <Paper elevation={1} sx={style.cardStyle}>
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
          </Paper>
        </Box>

        {/* ===== Rutas recomendadas ===== */}
        <Box sx={style.sectionStyle}>
          <Typography variant="body1" gutterBottom sx={style.cardTitleStyle}>
            Rutas de Aprendizaje Recomendadas
          </Typography>

          <Divider sx={style.dividerStyle} />

          <Box sx={style.containerCardRow}>
            {randomRoutes.map((item) => (
              <Paper key={item.title} sx={style.cardColumn}>
                <Paper
                  elevation={1}
                  sx={{
                    borderTopLeftRadius: shape.borderRadius.sm,
                    borderTopRightRadius: shape.borderRadius.sm,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    padding: 1,
                  }}
                >
                  <Typography sx={style.cardTitleStyle} variant="subtitle1">
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{fontSize:"0.7rem", color: theme.palette.text.secondary }}
                  >
                    Nivel · {item.level}
                  </Typography>
                </Paper>

                <Paper elevation={1}>
                  <Paper
                    style={{
                      borderStartEndRadius: 0,
                      borderStartStartRadius: 0,
                      borderEndStartRadius: shape.borderRadius.sm,
                      borderEndEndRadius: shape.borderRadius.sm,
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
                  </Paper>
                </Paper>
              </Paper>
            ))}
          </Box>

          <Box
            sx={{
              mt: 3,
              mb: 4,
              ml: "auto",
              mr: "auto",
              maxWidth: 230,
            }}
          >
            <Button
              fullWidth
              endIcon={<ArrowForwardIosIcon />}
              variant="contained"
              sx={{
                backgroundColor: theme.palette.surfaceVariant,
                color: theme.palette.text.primary,
                fontSize: "0.7rem",
              }}
            >
              VER TODAS LAS RUTAS
            </Button>
          </Box>
        </Box>

        {/* ===== Explora Sistemas ===== */}
        <Box sx={style.sectionStyle}>
          <Typography gutterBottom variant="body1" sx={style.cardTitleStyle}>
            Explorar Sistemas
          </Typography>
          <Divider sx={style.dividerStyle} />
          <Box sx={style.containerCardRow}>
            {randomSystems.map((item) => (
              <Paper key={item.title} elevation={1}>
                <Button
                  sx={style.cardExplorerButtom}
                  fullWidth
                  onClick={() => console.log("Explorar sistema " + item.title)}
                >
                  {item.title}
                </Button>
              </Paper>
            ))}
          </Box>

          <Box sx={style.cardExplorerButtomCentered}>
            <Button
              fullWidth
              endIcon={<ArrowForwardIosIcon />}
              variant="contained"
              sx={{
                backgroundColor: theme.palette.surfaceVariant,
                color: theme.palette.text.primary,
                fontSize: "0.7rem",
              }}
            >
              EXPLORAR TODOS LOS SISTEMAS
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
