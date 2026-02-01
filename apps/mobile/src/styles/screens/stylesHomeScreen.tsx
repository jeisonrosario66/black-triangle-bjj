import { StyleSheet } from "react-native";
import { shape } from "@bt/shared/packages/design-system/index";
const globalStyleBorder = shape.borderRadius.sm;

/**
 * Genera los estilos visuales de la pantalla principal (Home).
 * Centraliza la definición de layout, tarjetas y secciones del Home,
 * permitiendo adaptar dinámicamente la apariencia según la paleta de colores
 * activa del tema y el design system compartido.
 *
 * @param {any} colors - Paleta de colores obtenida desde el tema activo.
 * @returns {object} Objeto de estilos creado mediante StyleSheet para HomeScreen.
 */
export const createHomeStyles = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    section: {
      marginBottom: 32,
      shadowColor: "transparent",
    },
    divider: {
      marginVertical: 10,
    },
    card: {
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: globalStyleBorder,
    },
    cardTitle: {
      marginBottom: 4,
    },
    cardLabel: {
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    progress: {
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      shadowColor: "transparent",
      backgroundColor: "transparent",
    },
    column: {
      width: "48%",
      backgroundColor: "transparent",
    },
    cardTop: {
      padding: 8,
      borderTopLeftRadius: globalStyleBorder,
      borderTopRightRadius: globalStyleBorder,
    },
    cardBottom: {
      borderRadius: globalStyleBorder,
    },
    cardBottomPrincipal: {
      backgroundColor: colors.surfaceVariant,
      marginTop: 16,
      alignSelf: "center",
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 8,
      backgroundColor: colors.surfaceVariant,
      borderBottomRightRadius: globalStyleBorder,
      borderBottomLeftRadius: globalStyleBorder,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    cardRowCentered: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      gap: 8,
      shadowColor: "transparent",
    },
    touchableStyle: {
      width: "100%",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    exploreItemStyle: {
      flexDirection: "row",
      alignItems: "center",
      padding: 5,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: globalStyleBorder,
      backgroundColor: colors.surfaceVariant,
    },
    borderPuntual: {
      borderRadius: globalStyleBorder,
    },
    fondoPuntual: {
      backgroundColor: "transparent",
    },
  });
