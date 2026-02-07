import { View, ScrollView, useWindowDimensions } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  Surface,
  Text,
  Divider,
  Chip,
  List,
  useTheme,
} from "react-native-paper";

import { NodeViewData, NodeTaxonomy } from "@bt/shared/packages/context";
import { capitalizeFirstLetter } from "@bt/shared/packages/utils/capitalizeFirstLetter";
import { useNodeTaxonomy, useTabsByIds } from "@mobileSrc/hooks";
import { VideoPlayer } from "@mobileSrc/components/video/VideoPlayer";

type VideoDetailRouteParams = {
  VideoDetail: {
    nodeRoute: NodeViewData;
    firestoreRuta: string;
  };
};

/**
 * Pantalla de detalle de video.
 * Presenta el contenido completo de un nodo de video, incluyendo reproducción,
 * taxonomía asociada (tags) y descripción estructurada, resolviendo dinámicamente
 * la metadata desde Firestore según la ruta de navegación.
 *
 * @returns {JSX.Element} Vista de detalle del video seleccionado.
 */
export default function VideoDetailScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const route = useRoute<RouteProp<VideoDetailRouteParams, "VideoDetail">>();
  const { nodeRoute, firestoreRuta } = route.params;

  /* ---------------- layout ---------------- */
  const horizontalPadding = 32;
  const videoWidth = width - horizontalPadding;
  const videoHeight = Math.round((videoWidth * 9) / 16);

  /* ---------------- taxonomy ---------------- */
  const firestoreRutas = [firestoreRuta];

  const taxonomy: NodeTaxonomy | null = useNodeTaxonomy(
    nodeRoute.id,
    firestoreRutas
  );

  const resolvedTabs = useTabsByIds(taxonomy?.tab_ids);

  /* ---------------- video ---------------- */
  const hlsUrl = `https://vz-5c4f13a6-92d.b-cdn.net/${nodeRoute.videoid}/playlist.m3u8`;


  /* ---------------- render ---------------- */
  return (
    <Surface style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* TITLE */}
        <Text variant="headlineSmall">
          {capitalizeFirstLetter(nodeRoute.name)}
        </Text>

        <Divider style={{ marginVertical: 12 }} />

        {/* VIDEO */}
        <VideoPlayer url={hlsUrl} />

        {/* TAGS */}
        {resolvedTabs.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {resolvedTabs.map((tab) => (
              <Chip key={tab.id} icon="tag-outline" compact>
                {capitalizeFirstLetter(tab.title_es ?? tab.label)}
              </Chip>
            ))}
          </View>
        )}

        {/* DESCRIPTION */}
        {nodeRoute.description?.summary && (
          <>
            <Text variant="titleMedium">Descripción</Text>

            <Text variant="bodyMedium" style={{ marginVertical: 8 }}>
              {nodeRoute.description.summary}
            </Text>

            {nodeRoute.description.points?.length > 0 && (
              <List.Section>
                {nodeRoute.description.points.map((point, index) => (
                  <List.Item
                    key={`${index}-${point}`}
                    title={point}
                    left={(props) => (
                      <List.Icon {...props} icon="arrow-right" />
                    )}
                  />
                ))}
              </List.Section>
            )}
          </>
        )}
      </ScrollView>
    </Surface>
  );
}
