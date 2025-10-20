// i18n.tsx — Configura i18next para React con traducciones estáticas
// sonarjs-ignore S7763: prefer explicit import/export style
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { cacheUser } from "@src/context/index";

// Archivos JSON con las traducciones
import { translationEN, translationES } from "@src/locales/index";

type TranslationResources = {
  en: { translation: typeof translationEN };
  es: { translation: typeof translationES };
};

const resources: TranslationResources = {
  en: { translation: translationEN },
  es: { translation: translationES },
};

i18n
  .use(initReactI18next)            // Conecta i18next con React
  // .use(LanguageDetector)         // Habilitar detección de idioma del usuario
  .init({
    resources,                     // Define los recursos de traducción
    fallbackLng: cacheUser.languageDefault,  // Idioma por defecto si no hay traducción
    debug: false,                   // Activa logs para depuración
    interpolation: {
      escapeValue: false,          // React ya maneja el escape de texto
    },
  });

// sonarjs-ignore S7763: prefer explicit import/export style
export default i18n; // Exporta la instancia configurada
