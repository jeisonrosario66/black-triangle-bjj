/**
 * Punto de entrada principal de la aplicación móvil.
 * Inicializa el entorno de React Native y registra el componente raíz
 * para su ejecución tanto en Expo Go como en builds nativos.
 *
 * Su responsabilidad es asegurar que la aplicación se monte correctamente
 * en el runtime de Expo, delegando la lógica principal al componente App.
 */
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
