/**
 * Convierte una cadena almacenada en localStorage en un arreglo de cadenas.
 * Intenta analizar primero como JSON; si falla, limpia manualmente el texto
 * y separa los elementos por comas.
 * @param key - Clave del elemento almacenado en localStorage.
 * @returns Un arreglo de cadenas válidas.
 */
export const parseCacheArray = (key: string): string[] => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed))
      return parsed.filter((x) => typeof x === "string");

    return (
      raw
        // sonarjs-ignore S6535: escaping kept for explicitnes
        .replace(/[\[\]']+/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  } catch {
    return (
      raw
        // sonarjs-ignore S6535: escaping kept for explicitnes
        .replace(/[\[\]']+/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
};
