/**
 * Declaración de módulo para archivos PNG.
 * Permite importar imágenes PNG dentro del proyecto TypeScript,
 * resolviéndolas como recursos numéricos compatibles con React Native.
 */
declare module "*.png" {
  const value: number;
  export default value;
}

/**
 * Declaración de módulo para archivos JPG.
 * Habilita la importación de imágenes JPG como assets tipados,
 * necesarios para su uso seguro dentro de componentes y estilos.
 */
declare module "*.jpg" {
  const value: number;
  export default value;
}

/**
 * Declaración de módulo para archivos JPEG.
 * Define el contrato de tipado para recursos JPEG utilizados
 * en la capa de presentación de la aplicación.
 */
declare module "*.jpeg" {
  const value: number;
  export default value;
}

/**
 * Declaración de módulo para archivos WEBP.
 * Permite el uso de imágenes WEBP optimizadas como recursos
 * válidos dentro del ecosistema TypeScript y React Native.
 */
declare module "*.webp" {
  const value: number;
  export default value;
}
