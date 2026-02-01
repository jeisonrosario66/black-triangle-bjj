import { useState } from "react";
import {
  Divider,
  useTheme,
  Appbar,
  Avatar,
  TouchableRipple,
} from "react-native-paper";
import { Image } from "react-native";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";

import { projectName, isLogin, userIniciales } from "../../../../../shared/packages/context/index";
import { logoPrincipal } from "../../../../../shared/packages/assets/index";
import { MenuHeader } from "./MenuHeader";
import { createstylesHeader } from "../../styles/index";

/**
 * Encabezado personalizado para las pantallas con navegación por pestañas.
 * Proporciona una barra superior coherente con la identidad visual del proyecto,
 * gestionando la visualización del menú de usuario y el estado de autenticación.
 *
 * @param {BottomTabHeaderProps} props - Propiedades de navegación y ruta provistas por el tab navigator.
 * @returns {JSX.Element} Encabezado renderizado para la vista activa.
 */
export function TabHeader({ route, navigation }: BottomTabHeaderProps) {
  const { colors } = useTheme();
  const stylesHeader = createstylesHeader(colors);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      {/* ===== HEADER ===== */}
      <Appbar.Header style={stylesHeader.header}>
        <Image
          source={logoPrincipal}
          style={stylesHeader.logo}
          resizeMode="contain"
        />
        <Appbar.Content title={projectName} />
        {isLogin ? (
          <TouchableRipple onPress={() => setMenuVisible(true)}>
            <Avatar.Text
              style={{ marginRight: 20 }}
              size={35}
              label={userIniciales}
            />
          </TouchableRipple>
        ) : (
          <Appbar.Action
            icon="account-circle"
            size={35}
            color={colors.primary}
            onPress={() => setMenuVisible(true)}
          />
        )}
      </Appbar.Header>
      <Divider bold />
      <MenuHeader visible={menuVisible} setVisible={setMenuVisible} />
    </>
  );
}
