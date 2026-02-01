import { PaperProvider, Icon } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import {
  HomeScreen,
  ExplorerScreen,
  SettingsScreen,
} from "./src/screens/index";
import { TabHeader } from "./src/components/index";
import { paperTheme } from "./theme/index";

const Tab = createBottomTabNavigator();

/**
 * Componente raíz de la aplicación móvil.
 * Define la estructura global de navegación, aplica el tema visual y
 * configura el layout principal basado en tabs inferiores.
 *
 * Su responsabilidad es orquestar los proveedores globales (tema y navegación)
 * y declarar las pantallas principales accesibles desde el tab navigator.
 *
 * @returns {JSX.Element} Árbol raíz de la aplicación con navegación y tema aplicados.
 */
export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            header: (props) => <TabHeader {...props} />,
          }}
        >
          <Tab.Screen
            name="Inicio"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Icon source="home-outline" size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Explorer"
            component={ExplorerScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Icon source="graph-outline" size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Icon source="cog-outline" size={22} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
