const extractVideoId = (urlOrId: string): string | null => {
  const urlRegex =
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = urlRegex.exec(urlOrId);
  if (match) return match[1];

  // Si es exactamente un ID (11 caracteres)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;

  return null;
};

export default extractVideoId;
