export const parseCacheArray = (key: string): string[] => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    // Si viene como JSON válido → úsalo directo
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed))
      return parsed.filter((x) => typeof x === "string");

    // Si viene como string tipo "['a', 'b']" → convertirlo
    return raw
      .replace(/[\[\]']+/g, "") // elimina corchetes y comillas simples
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    // fallback simple si JSON.parse falla
    return raw
      .replace(/[\[\]']+/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
};
