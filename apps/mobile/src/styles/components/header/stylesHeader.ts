import { StyleSheet } from "react-native";

/**
 * Genera los estilos del encabezado de la aplicación móvil.
 * Centraliza la definición visual del header y sus elementos asociados,
 * permitiendo adaptar colores dinámicamente según el tema activo.
 *
 * @param {any} colors - Paleta de colores proveniente del tema actual.
 * @returns {object} Objeto de estilos creado mediante StyleSheet.
 */
export const createstylesHeader = (colors: any) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.surface,
    },
    logo: {
      width: 28,
      height: 28,
      marginRight: 8,
      marginLeft: 8,
    },
    modal: {
      position: "absolute",
      top: 56,
      right: 16,
      width: 200,
    },
    menuContent: {
      gap: 16,
    },  
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 1,
    },
    label: {
      marginLeft: 12,
    },
    divider: {
      marginVertical: 8,
    },
    badge: {
      position: "absolute",
      top: 2,
      left: 32,
    },
  });
