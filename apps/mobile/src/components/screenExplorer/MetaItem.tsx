import { View } from "react-native";
import { Text, Icon } from "react-native-paper";

type MetaItemProps = {
  icon: string;
  text: string;
};

/**
 * Componente de presentación para mostrar metadatos con icono.
 * Encapsula la visualización consistente de pares icono–texto utilizados
 * como información secundaria dentro de tarjetas, listas o vistas de detalle,
 * manteniendo uniformidad visual en la UI del proyecto.
 *
 * @param {MetaItemProps} props - Propiedades que definen el icono y el texto a mostrar.
 * @returns {JSX.Element} Elemento visual de metadato con icono y texto.
 */
export const MetaItem = ({ icon, text }: MetaItemProps) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Icon source={icon} size={18} />
    <Text style={{ marginLeft: 6 }}>{text}</Text>
  </View>
);
