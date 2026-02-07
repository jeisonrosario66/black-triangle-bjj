import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ExplorerScreen,
  CourseDetailScreen,
  VideoDetailScreen,
} from "@mobileSrc/screens/index";

const Stack = createNativeStackNavigator();

/**
 * Stack de navegación principal del flujo Explorer.
 * Orquesta la navegación jerárquica entre la pantalla de exploración,
 * el detalle de cursos y el detalle de videos dentro de la app móvil.
 *
 * @returns {JSX.Element} Navegador nativo con las pantallas del módulo Explorer.
 */
export function ExplorerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExplorerHome"
        component={ExplorerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VideoDetail"
        component={VideoDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
