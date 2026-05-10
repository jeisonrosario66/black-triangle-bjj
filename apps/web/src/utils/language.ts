export type AppLanguage = "es" | "en";

const LANGUAGE_STORAGE_KEY = "languageApp";

export const normalizeAppLanguage = (
  value?: string | null,
): AppLanguage => (value?.toLowerCase().startsWith("en") ? "en" : "es");

export const getPreferredAppLanguage = (): AppLanguage => {
  if (typeof window === "undefined") {
    return "es";
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (storedLanguage) {
    return normalizeAppLanguage(storedLanguage);
  }

  return normalizeAppLanguage(window.navigator.language);
};
