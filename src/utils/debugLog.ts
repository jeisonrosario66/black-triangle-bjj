type LogLevel = "info" | "warn" | "error" | "debug";

// Determina si el entorno es de desarrollo (true si no es producción)
const isDev = process.env.NODE_ENV !== "production";

// Estilos CSS personalizados para cada tipo de log
const levelStyles: Record<LogLevel, string> = {
  info: "color: blue; font-weight: bold;",       // Azul para info
  warn: "color: orange; font-weight: bold;",     // Naranja para advertencias
  error: "color: red; font-weight: bold;",       // Rojo para errores
  debug: "color: gray; font-style: italic;",     // Gris e itálica para debug
};

/**
 * Muestra logs en consola con estilos personalizados, solo en modo desarrollo.
 *
 * @param level - Nivel del log (info, warn, error, debug)
 * @param args - Argumentos a mostrar en el log (puede ser texto, objetos, etc.)
 *
 * Ejemplo:
 *    debugLog("warn", "Este campo está vacío");
 */
export function debugLog(level: LogLevel = "debug", ...args: unknown[]) {
  // Si no estamos en desarrollo, no muestra nada
  if (!isDev) return;

  // Obtiene el estilo correspondiente al nivel
  const style = levelStyles[level] ?? "";

  // Prefijo con el nivel en mayúsculas y formato para aplicar estilo
  const prefix = `%c[${level.toUpperCase()}]`;

  // Muestra en consola con el estilo aplicado
  console.log(prefix, style, ...args);
}
