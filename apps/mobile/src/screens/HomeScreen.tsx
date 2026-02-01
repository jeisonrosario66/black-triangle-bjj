import {
  Surface,
  Button,
  useTheme,
  Text,
  ProgressBar,
  Divider,
  Icon,
  TouchableRipple,
  Card,
} from "react-native-paper";
import { View } from "react-native";

import { createHomeStyles } from "../styles/index";
import { pickRandom } from "../../../../shared/packages/hooks/index";
import { testSystems, testRoutes } from "../../../../shared/packages/context/index";

/**
 * Pantalla principal de inicio de la aplicación móvil.
 * Centraliza el acceso al progreso actual del usuario, rutas de aprendizaje recomendadas
 * y sistemas disponibles para exploración, actuando como punto de entrada funcional.
 *
 * @returns {JSX.Element} Vista principal del home con secciones de progreso, rutas y sistemas.
 */
export default function HomeScreen() {
  const { colors } = useTheme();
  const stylesHomeScreen = createHomeStyles(colors);
  const randomSystems = pickRandom(testSystems, 3);
  const randomRoutes = pickRandom(testRoutes, 2);

  return (
    <Surface style={stylesHomeScreen.screen}>
      {/* ===== Progreso actual ===== */}
      <View style={stylesHomeScreen.section}>
        <Text variant="titleMedium">Continúa tu progreso</Text>
        <Divider bold style={stylesHomeScreen.divider} />

        <Surface elevation={1} style={stylesHomeScreen.card}>
          <Text variant="titleSmall" style={stylesHomeScreen.cardTitle}>
            Analizando “Curso Actual”
          </Text>

          <Text variant="labelMedium" style={stylesHomeScreen.cardLabel}>
            Clase 4 de 10 · 40%
          </Text>

          <ProgressBar progress={0.4} style={stylesHomeScreen.progress} />

          <Button
            onPress={() => console.log("Seguir viendo funcion")}
            mode="outlined"
            rippleColor={colors.primary}
            style={stylesHomeScreen.cardBottom}
          >
            Seguir viendo
          </Button>
        </Surface>
      </View>

      {/* ===== Rutas recomendadas ===== */}
      <View style={stylesHomeScreen.section}>
        <Text variant="titleMedium">Rutas de Aprendizaje Recomendadas</Text>
        <Divider bold style={stylesHomeScreen.divider} />

        <Surface style={stylesHomeScreen.row}>
          {randomRoutes.map((item) => (
            <Surface key={item.title} style={stylesHomeScreen.column}>
              <Surface
                elevation={1}
                style={[
                  stylesHomeScreen.cardTop,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text variant="titleSmall" style={stylesHomeScreen.cardTitle}>
                  {item.title}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Nivel · {item.level}
                </Text>
              </Surface>

              <Card style={stylesHomeScreen.cardBottom}>
                <TouchableRipple
                  rippleColor={colors.primary}
                  borderless={true}
                  onPress={() => {
                    console.log("Ir a la ruta " + item.title);
                  }}
                  style={stylesHomeScreen.touchableStyle}
                >
                  <View style={stylesHomeScreen.cardRow}>
                    <Icon source="play" size={20} />
                    <Text variant="labelLarge">{item.lessons} Lecciones</Text>
                  </View>
                </TouchableRipple>
              </Card>
            </Surface>
          ))}
        </Surface>

        <Card
          style={[
            stylesHomeScreen.cardBottom,
            stylesHomeScreen.cardBottomPrincipal,
          ]}
        >
          <TouchableRipple
            onPress={() => {
              console.log("Ver todas las rutas");
            }}
            borderless={true}
            rippleColor={colors.primary}
          >
            <View style={stylesHomeScreen.cardRowCentered}>
              <Text variant="labelLarge">VER TODAS LAS RUTAS</Text>
              <Icon source="chevron-right" size={20} />
            </View>
          </TouchableRipple>
        </Card>
      </View>

      {/* ===== Explora Sistemas ===== */}
      <View style={stylesHomeScreen.section}>
        <Text variant="titleMedium">Explorar Sistemas</Text>
        <Divider bold style={stylesHomeScreen.divider} />

        <Surface style={stylesHomeScreen.row}>
          {randomSystems.map((item) => (
            <Surface
              key={item.title}
              style={stylesHomeScreen.fondoPuntual}
              elevation={1}
            >
              <Card style={stylesHomeScreen.borderPuntual}>
                <TouchableRipple
                  rippleColor={colors.primary}
                  borderless={true}
                  onPress={() => {
                    console.log("Explorar sistema " + item.title);
                  }}
                >
                  <View style={stylesHomeScreen.exploreItemStyle}>
                    <Text variant="labelLarge">{item.title}</Text>
                  </View>
                </TouchableRipple>
              </Card>
            </Surface>
          ))}
        </Surface>

        <Card
          style={[
            stylesHomeScreen.cardBottom,
            stylesHomeScreen.cardBottomPrincipal,
          ]}
        >
          <TouchableRipple
            onPress={() => {
              console.log("Explorar todos los sistemas");
            }}
            borderless={true}
            rippleColor={colors.primary}
          >
            <View style={stylesHomeScreen.cardRowCentered}>
              <Text variant="labelLarge">EXPLORAR TODOS LOS SISTEMAS</Text>
              <Icon source="chevron-right" size={20} />
            </View>
          </TouchableRipple>
        </Card>
      </View>
    </Surface>
  );
}
