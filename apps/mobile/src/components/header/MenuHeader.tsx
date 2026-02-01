import {
  useTheme,
  Portal,
  Card,
  Text,
  Avatar,
  Divider,
  TouchableRipple,
  Badge,
  Modal,
} from "react-native-paper";
import { ViewStyle, View } from "react-native";

import { isLogin, userIniciales, userName } from "@bt/shared/packages/context/index";
import { createstylesHeader } from "@mobileStyles/index";

type MenuHeaderProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

/**
 * Componente de menú contextual del encabezado en la aplicación móvil.
 * Renderiza un menú flotante con acciones relacionadas al perfil del usuario,
 * notificaciones, configuración y cierre de sesión, adaptando su contenido
 * dinámicamente según el estado de autenticación.
 *
 * Su responsabilidad es centralizar las acciones secundarias del header
 * en un contenedor modal controlado externamente, manteniendo coherencia
 * visual y de comportamiento dentro de la navegación móvil.
 *
 * @param {MenuHeaderProps} props - Controla la visibilidad del menú y su cierre.
 * @returns {JSX.Element} Menú flotante contextual del encabezado.
 */
export function MenuHeader(props: MenuHeaderProps) {
  const { colors } = useTheme();
  const stylesHeader = createstylesHeader(colors);
  return (
    <>
      {/* ===== MENU FLOTANTE ===== */}
      <Portal>
        <Modal
          visible={props.visible}
          onDismiss={() => props.setVisible(false)}
          contentContainerStyle={stylesHeader.modal as ViewStyle}
        >
          <Card>
            <Card.Content style={stylesHeader.menuContent}>
              {/* PERFIL */}
              <TouchableRipple borderless onPress={() => props.setVisible(false)}>
                <View style={stylesHeader.row}>
                  {isLogin ? (
                    <Avatar.Text size={32} label={userIniciales} />
                  ) : (
                    <Avatar.Icon size={32} icon="login" />
                  )}
                  <Text variant="labelLarge" style={stylesHeader.label}>
                    {isLogin ? userName : "Perfil"}
                  </Text>
                </View>
              </TouchableRipple>

              {isLogin && (
                <>
                  {/* NOTIFICACIONES */}
                  <TouchableRipple borderless onPress={() => props.setVisible(false)}>
                    <View style={stylesHeader.row}>
                      <Badge size={8} style={stylesHeader.badge as ViewStyle} />
                      <Avatar.Icon size={32} icon="bell-outline" />
                      <Text variant="labelLarge" style={stylesHeader.label}>
                        Notificaciones
                      </Text>
                    </View>
                  </TouchableRipple>
                </>
              )}

              {/* CONFIGURACIÓN */}
              <TouchableRipple borderless onPress={() => props.setVisible(false)}>
                <View style={stylesHeader.row}>
                  <Avatar.Icon size={32} icon="cog-outline" />
                  <Text variant="labelLarge" style={stylesHeader.label}>
                    Configuración
                  </Text>
                </View>
              </TouchableRipple>

              {isLogin && (
                <>
                  <Divider style={stylesHeader.divider} />

                  {/* LOGOUT */}
                  <TouchableRipple borderless onPress={() => props.setVisible(false)}>
                    <View style={stylesHeader.row}>
                      <Avatar.Icon
                        size={32}
                        icon="logout"
                        color={colors.error}
                      />
                      <Text
                        variant="labelLarge"
                        style={[stylesHeader.label, { color: colors.error }]}
                      >
                        Cerrar sesión
                      </Text>
                    </View>
                  </TouchableRipple>
                </>
              )}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </>
  );
}
