import { Text, View, Button } from "react-native";
import { database } from "@mobileSrc/hooks/index";
import { getSystemshared } from "@bt/shared/packages/services/firebaseServiceShared";

import { getDocs, collection } from "firebase/firestore";
/**
 * Pantalla de configuración de la aplicación.
 * Proporciona el punto de entrada para la gestión de ajustes y preferencias del usuario.
 *
 * @returns {JSX.Element} Vista base de la pantalla de configuración.
 */
export default function SettingsScreen() {
  return (
    <View>
      <Text>Settings Screen!</Text>
      <Button title="Test Firebase" onPress={() => console.log(database)} />
      <Button
        title="Test getSystem"
        onPress={() => {
          getSystemshared(getDocs, collection, database).then((result) => {
            console.log("getSystem result:", result);
          });
        }}
      />
    </View>
  );
}
