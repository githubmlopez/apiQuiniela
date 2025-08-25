import { logger } from './index.js';
import { Sequelize} from 'sequelize';
import { getInstancia } from '../index.js';
import { I_InfResponse, I_FC_TAREA_EVENTO, I_Header } from '../index.js';
import { crearObjetoEvento, createExcepcion } from '../index.js';
import { I_CreaObjetoEvento, ExecProcedure} from '../index.js';

const kErrorSistema = 3;
const kDesarrollo = 'D';

export async function ejecFuncion<T extends (...args: any[]) => any>(
  fn: T,
  header : I_Header,
  contexto: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
  const kFolioEvento : string = 'EVENT';
  const kProcComun = 9999;
  const kUsuarioComun = 'Dummy';
  const kAplicComun = 'Dummy';
  const sequelize : Sequelize = await getInstancia();
  try {
    return await fn(...args) //.catch((error : any)  => { throw (error) });
  } catch (error: any) {
    console.log('✅ Objeto error I', error);
    const opciones : I_CreaObjetoEvento = {
    ID_PROCESO: header.idProceso ?? kProcComun,
    F_EVENTO: new Date(),
    ID_EVENTO: await obtenFolio(kFolioEvento, sequelize, header) as number,
    CVE_APLICACION : header.cveAplicacion ?? kAplicComun,
    CVE_USUARIO : header.cveUsuario ?? kUsuarioComun
    }
    const evento : I_FC_TAREA_EVENTO = await crearObjetoEvento(error, opciones, contexto);
    console.log('✅ Llamando crar excepcion');
    await createExcepcion(evento, logger, sequelize);
    const reponse : I_InfResponse ={estatus: kErrorSistema, data : null , errorUs: evento.DESC_ERROR, errorNeg : null};
    console.log('✅ Respuesta correcta Crea Excepcion', reponse);
    logger.error('Error ', evento);

    throw (evento.DESC_ERROR);
  }
  return neverReturns();
}

function neverReturns(): never {
  throw new Error("Internal error: ejecutarConContext debería haber lanzado una excepción.");
}

export async function obtenFolio(clave:string, sequelize : Sequelize, header : I_Header): Promise<number | string> {
  const resProc: any = await ExecProcedure('1', 
  {'$1' : clave}, header);
  
  console.log('✅ Obten folio', resProc);

  return await obtResDataEscalar(resProc);
}

export async function obtResDataEscalar (objeto : I_InfResponse) {
  if (objeto.data) {
  return objeto.data[0].ESCALAR; 
}
}

export function creaHeadEsq() {
    const header : I_Header = {
    idProceso  : 9999,
    cveAplicacion : 'dummy',
    cveUsuario : 'admin',
    cveIdioma  : 'ES',
    cvePerfil  : 'dummy'
    
  }
  return header;
}

export function consoleLog (mensaje : string, opcion : any) {
  if (process.env.CVE_AMBIENTE = kDesarrollo) {
    console.log(mensaje, opcion);
  }

}




