/**
 * Configuración principal de Babel para el proyecto móvil.
 * Define los presets y plugins necesarios para habilitar Expo, React Native
 * y la resolución de módulos mediante alias personalizados.
 *
 * Su responsabilidad es centralizar la configuración de compilación
 * y garantizar que Babel procese correctamente TypeScript, JSX y
 * dependencias específicas del entorno React Native.
 *
 * @param {object} api - API de Babel utilizada para controlar el cache y el ciclo de compilación.
 * @returns {object} Objeto de configuración de Babel con presets y plugins activos.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".json"],
          alias: {
            "@bt/shared": "../../shared",
            "@mobileSrc": "./src",
            "@mobileStyles": "./src/styles",
            "@mobileTheme": "./src/theme",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
