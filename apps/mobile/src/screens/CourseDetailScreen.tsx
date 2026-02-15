import { useState, useEffect, useMemo } from "react";
import { View, FlatList } from "react-native";
import {
  Surface,
  Text,
  Card,
  ActivityIndicator,
  useTheme,
  List,
  Divider,
  TouchableRipple,
} from "react-native-paper";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDocs, collection } from "firebase/firestore";

import { SystemCardUI, NodeOptionFirestore } from "@bt/shared/packages/context";
import { getDataNodesShared } from "@bt/shared/packages/services/firebaseServiceShared";
import { capitalizeFirstLetter } from "@bt/shared/packages/utils/capitalizeFirstLetter";
import { database } from "@mobileSrc/hooks/index";

type CourseDetailRouteParams = {
  CourseDetail: {
    system: SystemCardUI;
  };
};
type ExplorerStackParamList = {
  VideoDetail: { nodeRoute: NodeOptionFirestore; firestoreRuta: string };
};

/**
 * Pantalla de detalle de un sistema de aprendizaje.
 * Se encarga de cargar y presentar la información completa de un sistema seleccionado,
 * incluyendo sus metadatos y el listado ordenado de nodos (módulos) asociados,
 * integrándose con la navegación para acceder al detalle de cada video.
 *
 * @returns {JSX.Element} Vista principal de detalle del sistema con su contenido navegable.
 */
export default function CourseDetailScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ExplorerStackParamList>>();
  const route = useRoute<RouteProp<CourseDetailRouteParams, "CourseDetail">>();
  const { system } = route.params;
  const [modules, setModules] = useState<NodeOptionFirestore[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const firestoreRuta = system.valueNodes;

  useEffect(() => {
    let mounted = true;
    const loadNodes = async () => {
      try {
        const data = await getDataNodesShared(
          [firestoreRuta],
          getDocs,
          collection,
          database,
          "es",
        );

        if (!mounted) return;
        setModules(data);
      } catch (error) {
        console.error("Error cargando nodos del sistema:", error);
      } finally {
        if (mounted) setLoadingModules(false);
      }
    };

    loadNodes();

    return () => {
      mounted = false;
    };
  }, [firestoreRuta]);

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => Number(a.id) - Number(b.id));

  },
    [modules]
  )

  return (
    <Surface
      style={{ flex: 1, padding: 16, backgroundColor: colors.background }}
    >
      {loadingModules ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            animating={true}
            color={colors.primary}
            size={"large"}
          />
        </View>
      ) : (
        <FlatList
          data={expanded ? orderedModules : []}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={(
            <>
              <Card>
                <Card.Cover source={{ uri: system.coverUrl }} />
              </Card>

              <Text variant="headlineSmall" style={{ marginTop: 16 }}>
                {capitalizeFirstLetter(system.name)}
              </Text>

              <Text>{capitalizeFirstLetter(system.description)}</Text>

              <Divider />

              <List.Section
                title={`${capitalizeFirstLetter(system.setSystem)} · ${modules.length} Videos`}
              >
                <List.Accordion
                  title="Contenido del sistema"
                  expanded={expanded}
                  onPress={() => setExpanded(!expanded)}
                  left={(props) => <List.Icon {...props} icon="graph-outline" />}
                >
                  <View />
                </List.Accordion>

              </List.Section>
            </>
          )}
          renderItem={({ item, index }) => (
            <TouchableRipple
              onPress={() =>
                navigation.navigate("VideoDetail", {
                  nodeRoute: item,
                  firestoreRuta: firestoreRuta
                })
              }
              borderless
              rippleColor={`${colors.secondary}33`}
            >
              <View>
                <List.Item
                  title={item.name}
                  left={() => <Text>{index + 1}.</Text>}
                />
                <Divider />
              </View>
            </TouchableRipple>
          )}
        />
      )}
    </Surface>
  );
}
