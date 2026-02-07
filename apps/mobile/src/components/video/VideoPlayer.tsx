import { View, useWindowDimensions } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

type VideoPlayerProps = {
    url: string;
    autoPlay?: boolean;
    aspectRatio?: number;
};

/**
 * Componente de reproducción de video adaptable.
 * Encapsula la lógica de inicialización y renderizado del reproductor de video,
 * ajustando dinámicamente sus dimensiones según el ancho de la pantalla
 * y manteniendo una relación de aspecto configurable.
 *
 * @param {VideoPlayerProps} props - Propiedades de configuración del reproductor.
 * @returns {JSX.Element} Vista del reproductor de video responsive.
 */
export function VideoPlayer({
    url,
    aspectRatio = 16 / 9,
}: VideoPlayerProps) {
    const { width } = useWindowDimensions();

    const horizontalPadding = 32;
    const videoWidth = width - horizontalPadding;
    const videoHeight = Math.round(videoWidth / aspectRatio);

    const player = useVideoPlayer(url, (instance) => {
        instance.loop = false;
        instance.play();
    });

    return (
        <View
            style={{
                width: videoWidth,
                height: videoHeight,
                backgroundColor: "#000",
                borderRadius: 8,
                overflow: "hidden",
                alignSelf: "center",
            }}
        >
            <VideoView
                player={player}
                style={{ width: "100%", height: "100%" }}
                allowsPictureInPicture
            />
        </View>
    );
}
