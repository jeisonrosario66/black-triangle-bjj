/**
 * Selecciona un subconjunto aleatorio de elementos únicos desde un arreglo dado.
 * Su responsabilidad es proveer datos variados de forma no determinística para
 * secciones dinámicas de la aplicación (por ejemplo, recomendaciones o exploración),
 * garantizando que no se exceda el tamaño del arreglo original.
 *
 * @param {T[]} array - Arreglo fuente del cual se extraerán los elementos.
 * @param {number} count - Cantidad máxima de elementos a retornar.
 * @returns {T[]} Arreglo con elementos seleccionados aleatoriamente.
 */
export default function pickRandom<T>(array: T[], count: number): T[] {
  if (!array || array.length === 0) return [];

  const safeCount = Math.min(count, array.length);

  return [...array]
    .sort(() => Math.random() - 0.5)
    .slice(0, safeCount);
}
