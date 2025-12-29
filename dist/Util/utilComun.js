import { logger } from './index.js';
import { getInstancia } from '../index.js';
import { crearObjetoEvento, createExcepcion } from '../index.js';
import { ExecProcedure } from '../index.js';
const kErrorSistema = 3;
const kDesarrollo = 'D';
export async function ejecFuncion(fn, header, contexto, ...args) {
    const kFolioEvento = 'EVENT';
    const kProcComun = 9999;
    const kUsuarioComun = 'Dummy';
    const kAplicComun = 'Dummy';
    const sequelize = await getInstancia();
    try {
        return await fn(...args); //.catch((error : any)  => { throw (error) });
    }
    catch (error) {
        console.log('✅ Objeto error I', error);
        const opciones = {
            ID_PROCESO: header.idProceso ?? kProcComun,
            F_EVENTO: new Date(),
            ID_EVENTO: await obtenFolio(kFolioEvento, sequelize, header),
            CVE_APLICACION: header.cveAplicacion ?? kAplicComun,
            CVE_USUARIO: header.cveUsuario ?? kUsuarioComun
        };
        const evento = await crearObjetoEvento(error, opciones, contexto);
        console.log('✅ Llamando crar excepcion');
        await createExcepcion(evento, logger, sequelize);
        const reponse = { estatus: kErrorSistema, data: null, errorUs: evento.DESC_ERROR, errorNeg: null };
        console.log('✅ Respuesta correcta Crea Excepcion', reponse);
        logger.error('Error ', evento);
        throw (evento.DESC_ERROR);
    }
    return neverReturns();
}
function neverReturns() {
    throw new Error("Internal error: ejecutarConContext debería haber lanzado una excepción.");
}
export async function obtenFolio(clave, sequelize, header) {
    const resProc = await ExecProcedure('1', { '$1': clave }, header);
    console.log('✅ Obten folio', resProc);
    return await obtResDataEscalar(resProc);
}
export async function obtResDataEscalar(objeto) {
    if (objeto.data) {
        return objeto.data[0].ESCALAR;
    }
}
export function creaHeadEsq(cveAplicacion) {
    const header = {
        idProceso: 9999,
        cveAplicacion: cveAplicacion,
        cveUsuario: 'guest',
        cveIdioma: 'ES',
        cvePerfil: 'guest'
    };
    return header;
}
export function consoleLog(mensaje, opcion) {
    if (process.env.CVE_AMBIENTE = kDesarrollo) {
        console.log(mensaje, opcion);
    }
}
