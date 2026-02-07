import { StyleSheet } from "react-native";
import { shape } from "@bt/shared/packages/design-system/index";
const globalStyleBorder = shape.borderRadius.sm;

/**
 * Fábrica de estilos para la pantalla Explorer.
 * Centraliza la definición de estilos visuales dependientes del tema,
 * permitiendo generar un conjunto consistente de estilos dinámicos
 * en función de la paleta de colores activa.
 *
 * @param {any} colors - Paleta de colores proveniente del tema actual.
 * @returns {object} Objeto de estilos creado mediante StyleSheet.create.
 */
export const createExplorerStyles = (colors: any) =>
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

    containerChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },

    containerCardSystem: {
      backgroundColor: colors.surface,
      padding: 10,
      borderRadius: globalStyleBorder,
      marginBottom: 25,
    },
    cardCover: {
      height: 200,
      borderRadius: globalStyleBorder,
    },
    cardPlayIcon: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 70,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
    },
    metadatosContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },

  });
