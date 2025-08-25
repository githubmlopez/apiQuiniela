import { getInstancia } from '../index.js';
import { logger } from './index.js';
import { crearObjetoEvento, createExcepcion, obtenFolio, creaHeadEsq } from '../index.js';
// Utilizado para manejo de Promesas (asincrono) con error
const kFolioEvento = 'EVENT';
const header = creaHeadEsq();
export async function setupGlobalError() {
    const sequelize = await getInstancia();
    process.on('unhandledRejection', async (reason, promise) => {
        let mensaje = 'unhandledRejection: ';
        if (typeof reason === 'object' && reason !== null && reason.code) {
            mensaje = mensaje + `Error code: ${reason.code}`;
        }
        const error = new Error(mensaje);
        await regExcep(mensaje);
        process.exit(1);
    });
    // Utilizado para manejo de procesos sincronos con error
    process.on('uncaughtException', async (err, origin) => {
        let mensaje = 'uncaughtException: ';
        if (err instanceof Error) {
            mensaje = mensaje + ' ' + err.message;
        }
        else {
            if (typeof (err) === 'string') {
                mensaje = mensaje + ' ' + err;
            }
            else {
                if (err.code) {
                    mensaje = mensaje + ` Code ${err.code}`;
                }
                else {
                    mensaje = mensaje + 'Error no reportado';
                }
            }
        }
        const error = new Error(mensaje);
        await regExcep(mensaje);
        process.exit(1);
    });
    async function regExcep(mensaje) {
        const kProcComun = 9999;
        const kUsuarioComun = 'Dummy';
        const kAplicComun = 'Dummy';
        const opciones = {
            ID_PROCESO: kProcComun,
            F_EVENTO: new Date(),
            ID_EVENTO: await obtenFolio(kFolioEvento, sequelize, header),
            CVE_APLICACION: kAplicComun,
            CVE_USUARIO: kUsuarioComun
        };
        console.log('regExcep ** ' + mensaje);
        const error = new Error(mensaje);
        const contexto = mensaje;
        const evento = await crearObjetoEvento(error, opciones, contexto);
        console.log('❌unhandledRejection o uncaughtException ' + JSON.stringify(evento));
        await createExcepcion(evento, logger, sequelize);
        logger.error('unhandledRejection o uncaughtException Error', evento);
    }
}
