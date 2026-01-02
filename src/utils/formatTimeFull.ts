/**
 * Formatea una duración en segundos a una representación de tiempo completa.
 * Convierte un valor numérico en segundos a una cadena con formato HH:MM:SS o MM:SS según corresponda.
 *
 * @param {number} seconds Cantidad total de segundos a formatear.
 * @returns {string} Cadena de tiempo formateada en horas, minutos y segundos.
 */
const formatTimeFull = (seconds : number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) 
        parts.push(hrs.toString());
    
    parts.push(mins.toString().padStart(2, "0"));
    parts.push(secs.toString().padStart(2, "0"));

    return parts.join(":");
};

export default formatTimeFull;

