import winston, { format, transports } from 'winston';
console.log('** entre a logger');
const logFormat = format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.printf(({ level, message, timestamp, meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (level === 'error' &&
        meta &&
        typeof meta === 'object' &&
        meta !== null) {
        const evento = meta;
        logMessage += ` - ID Proceso: ${evento.ID_PROCESO}`;
        logMessage += `, F. Evento: ${evento.F_EVENTO ? evento.F_EVENTO.toISOString() : ''}`;
        logMessage += `, ID Evento: ${evento.ID_EVENTO}`;
        logMessage += `, Tipo Evento: ${evento.CVE_TIPO_EVENTO}`;
        logMessage += `, Cve Aplicacion: ${evento.CVE_APLICACION}`;
        logMessage += `, Cve Usuario: ${evento.CVE_USUARIO}`;
        logMessage += evento.DESC_ERROR
            ? `, Desc. Error: ${evento.DESC_ERROR}`
            : '';
        logMessage += evento.MSG_ERROR
            ? `, Msg. Error: ${evento.MSG_ERROR}`
            : '';
        logMessage +=
            evento.ERROR_NUMBER_D !== null
                ? `, Error Num: ${evento.ERROR_NUMBER_D}`
                : '';
        logMessage +=
            evento.ERROR_SEVERITY_D !== null
                ? `, Severidad: ${evento.ERROR_SEVERITY_D}`
                : '';
        logMessage +=
            evento.ERROR_STATE_D !== null
                ? `, Estado: ${evento.ERROR_STATE_D}`
                : '';
        logMessage += evento.ERROR_PROCEDURE_D
            ? `, Procedimiento: ${evento.ERROR_PROCEDURE_D}`
            : '';
        logMessage +=
            evento.ERROR_LINE_D !== null
                ? `, Línea: ${evento.ERROR_LINE_D}`
                : '';
        logMessage += evento.ERROR_MESSAGE_D
            ? `, Msg. Detalle: ${evento.ERROR_MESSAGE_D}`
            : '';
    }
    else {
        if (meta && Object.keys(meta).length > 0) {
            logMessage += ` - Meta: ${JSON.stringify(meta)}`;
        }
    }
    return logMessage;
}));
console.log(logFormat);
export const logger = winston.createLogger({
    level: 'info', // Nivel general del logger
    format: logFormat, // Formato de texto para la consola
    transports: [
        new transports.Console(),
        new transports.File({
            filename: './logs/nflquin.log',
            format: format.json(), // Formato JSON para el archivo
        }),
    ],
});
