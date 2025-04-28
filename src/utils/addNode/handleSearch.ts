import axios from "axios";

const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

const formatYouTubeDuration = (duration: string): string[] => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return ["00:00", "0"];

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  const pad = (num: number) => num.toString().padStart(2, "0");

  const timeStringHours = `${hours}:${pad(minutes)}:${pad(seconds)}`; 
  const timeStringMinutes = `${minutes}:${pad(seconds)}`; 
  const secondsTotal = String(hours * 3600 + minutes * 60 + seconds);

  if (hours > 0) {
    return [timeStringHours, secondsTotal];
  } else {
    return [timeStringMinutes, secondsTotal] 
  }
};

const formatViews = (views: number): string => {
  if (views >= 1_000_000_000) {
    return (views / 1_000_000_000).toFixed(1) + " B"; // Mil millones
  } else if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1) + " M"; // Millones
  } else if (views >= 1_000) {
    return (views / 1_000).toFixed(1) + " K"; // Miles
  } else {
    return views.toString(); // Menos de mil
  }
};

const formatVideoUploadDate = (publishedAt: string): string => {
  const publishedDate = new Date(publishedAt);
  const currentDate = new Date();

  const diffInSeconds = Math.floor(
    (currentDate.getTime() - publishedDate.getTime()) / 1000
  );
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears >= 1) {
    return `${diffInYears} año${diffInYears > 1 ? "s" : ""}`;
  } else if (diffInMonths >= 1) {
    return `${diffInMonths} mes${diffInMonths > 1 ? "es" : ""}`;
  } else if (diffInDays >= 1) {
    return `${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
  } else if (diffInHours >= 1) {
    return `${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
  } else if (diffInMinutes >= 1) {
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`;
  } else {
    return `${diffInSeconds} segundo${diffInSeconds > 1 ? "s" : ""}`;
  }
};
// Tipo para representar un resultado de búsqueda de YouTube
interface YouTubeVideo {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
    channelTitle: string;
  };
}

// Función que realiza la búsqueda y obtiene los detalles de los videos
const handleSearch = async (
  query: string,
  setResults: React.Dispatch<React.SetStateAction<YouTubeVideo[]>>
) => {
  if (!query) return;

  try {
    // Paso 1: Realizar una llamada para obtener la lista de videos

    const searchResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: query,
          key: apiKey,
          type: "video",
          maxResults: 10,
        },
      }
    );

    // Obtener los IDs de los videos
    const videoIds = searchResponse.data.items.map(
      (item: any) => item.id.videoId
    );

    // Paso 2: Obtener todos los detalles de los videos y los canales en una sola llamada
    const videoDetailsResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,contentDetails,statistics",
          id: videoIds.join(","),
          key: apiKey,
        },
      }
    );

    // Paso 3: Procesar los resultados para incluir la miniatura del canal y otras informaciones
    const videoDetails = videoDetailsResponse.data.items.map((video: any) => {
      const durationFormatted = formatYouTubeDuration(
        video.contentDetails.duration
      )[0];
      const secondsTotal = formatYouTubeDuration(
        video.contentDetails.duration
      )[1];
      const viewCountFormatted = formatViews(video.statistics.viewCount);
      const publishedAtFormatted = formatVideoUploadDate(
        video.snippet.publishedAt
      );
      return {
        videoId: video.id,
        videoTitle: video.snippet.title,
        publishedAt: publishedAtFormatted,
        viewCount: viewCountFormatted,
        duration: durationFormatted,
        secondsTotal: secondsTotal,
        channelTitle: video.snippet.channelTitle,
        videoThumbnailUrl: video.snippet.thumbnails.high.url,
      };
    });

    // Establecer los resultados completos
    setResults(videoDetails);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error buscando en YouTube:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.error?.message || error.message,
        errors: error.response?.data?.error?.errors,
      });
    } else {
      console.error("Error inesperado:", error);
    }
  }
};

export default handleSearch;
