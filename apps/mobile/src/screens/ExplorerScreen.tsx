import { useState, useEffect, useMemo } from "react";
import { View, FlatList } from "react-native";
import {
  Surface,
  Text,
  Divider,
  Chip,
  Card,
  useTheme,
  ActivityIndicator,
  TouchableRipple,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDocs, collection } from "firebase/firestore";

import { getSystemshared } from "@bt/shared/packages/services/firebaseServiceShared";
import { database } from "@mobileSrc/hooks/index";
import { MetaItem } from "@mobileSrc/components/index";
import { createExplorerStyles } from "@mobileStyles/index";

import { SystemCardOption, SystemCardUI } from "@bt/shared/packages/context";
import { capitalizeFirstLetter } from "@bt/shared/packages/utils/capitalizeFirstLetter";
import { shape } from "@bt/shared/packages/design-system";

type ExplorerStackParamList = {
  CourseDetail: { system: SystemCardUI };
};

/**
 * Pantalla principal de exploración de sistemas.
 * Orquesta la carga, filtrado y visualización de los sistemas disponibles,
 * permitiendo al usuario navegar por categorías (tags) y acceder al detalle
 * de cada sistema mediante la navegación de la aplicación.
 *
 * @returns {JSX.Element} Vista de exploración con listado filtrable de sistemas.
 */
export default function ExplorerScreen() {
  const { colors } = useTheme();
  const styles = createExplorerStyles(colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<ExplorerStackParamList>>();

  const [nivelSeleccionado, setNivelSeleccionado] = useState<string>();
  const [systems, setSystems] = useState<SystemCardUI[]>([]);
  const [tagNavigation, setTagNavigation] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSystems = async () => {
      try {
        const data = await getSystemshared(getDocs, collection, database);

        const systemsWithExtras = data.flatMap(
          (group: { name: string; systems: SystemCardOption[] }) =>
            group.systems.map((system) => ({
              ...system,
              setSystem: group.name,
              autor: system.instructor,
              coverUrl: system.coverUrl || "https://picsum.photos/1500/800",
            }))
        );

        setSystems(systemsWithExtras);
        setTagNavigation(data.map((s) => s.name));
      } catch (error) {
        console.error("Error cargando sistemas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSystems();
  }, []);

  const systemsFiltrados = useMemo(() => {
    if (!nivelSeleccionado) return systems;
    return systems.filter((s) => s.setSystem === nivelSeleccionado);
  }, [systems, nivelSeleccionado]);

  if (loading) {
    return (
      <Surface style={styles.screen}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.screen}>
      <FlatList
        data={systemsFiltrados}
        keyExtractor={(item) => item.valueNodes}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListHeaderComponent={
          <>
            <View style={styles.containerChips}>
              {tagNavigation.map((tag) => (
                <Chip
                  key={tag}
                  elevation={2}
                  selected={nivelSeleccionado === tag}
                  selectedColor={colors.primary}
                  rippleColor={`${colors.primary}33`}
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: shape.borderRadius.xs,
                  }}
                  compact
                  onPress={() =>
                    setNivelSeleccionado(
                      nivelSeleccionado === tag ? undefined : tag
                    )
                  }
                >
                  {tag}
                </Chip>
              ))}
            </View>

            <Text variant="titleSmall">Explorar Sistemas</Text>
            <Divider bold style={styles.divider} />
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.containerCardSystem}>
            <TouchableRipple
              borderless
              rippleColor={`${colors.primary}33`}
              onPress={() =>
                navigation.navigate("CourseDetail", { system: item })
              }
            >
              <Card.Cover
                resizeMode="contain"
                style={styles.cardCover}
                source={{ uri: item.coverUrl }}
              />
            </TouchableRipple>

            <Text variant="titleLarge">{item.label}</Text>

            <View style={styles.metadatosContainer}>
              <MetaItem
                icon="label-outline"
                text={capitalizeFirstLetter(item.setSystem)}
              />
              <MetaItem
                icon="account-heart-outline"
                text={item.instructor}
              />
            </View>
          </Card>
        )}
      />
    </Surface>
  );
}
