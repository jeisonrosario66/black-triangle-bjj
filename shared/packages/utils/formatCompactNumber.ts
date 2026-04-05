/**
 * Formatea valores numéricos grandes en notación compacta.
 * Ejemplos: 1200 -> 1.2K, 3400000 -> 3.4M
 */
export const formatCompactNumber = (value?: number | null, locale = "en") => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
};
