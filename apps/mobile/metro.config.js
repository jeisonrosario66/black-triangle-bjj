const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, "../../shared");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sharedRoot];

config.resolver.extraNodeModules = {
  "@bt/shared": sharedRoot,
};

/**
 * Configuración personalizada de Metro bundler para el proyecto Expo.
 * Extiende la configuración por defecto para habilitar el uso de un
 * paquete compartido fuera del directorio raíz del proyecto.
 *
 * Su responsabilidad es permitir la resolución correcta de módulos
 * compartidos y asegurar que Metro observe cambios en el workspace común.
 *
 * @returns {object} Objeto de configuración de Metro utilizado por Expo.
 */
module.exports = config;
