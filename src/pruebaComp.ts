
/*import { Sequelize, Model, Error, QueryTypes  } from 'sequelize';
import { cargaCache, cargaModelos} from './index.js';
import { ExecRawQueryById, ExecRawQuery, ExecProcedure } from './index.js';
import { createRecord, buscaUsuario } from './index.js';
import { ejecFuncion, setupGlobalError} from './index.js'
import { getInstancia} from './index.js';
import { I_InfResponse, I_InfRequest, I_FC_SEG_USUARIO} from './index.js';

import { hash, verify } from 'argon2';


// Carga tablas de errores y querys a memoria 
const infRequest : I_InfRequest = {

    idProceso  : 1
}

// Estas funciones tienen su porpio manejo de errores internamente 
await setupGlobalError(infRequest)
const contMem = 'Carga inf a Memoria';
await ejecFuncion (cargaCache, infRequest, contMem) 
const contModel = 'Carga inf a Memoria';
await ejecFuncion (cargaModelos, infRequest, contModel) 

/*
const resSql: I_InfResponse= await ExecRawQueryById('12', sequelize, 
{'$1' : 1, '$2' : '10'}
)
console.log(' * ', resSql);

const resProc: any = await ExecProcedure('9', sequelize, 
{'$1' : 1, '$2' : '10'}
)
console.log(' ** ', resProc);

const resRow: any = await ExecRawQuery('SELECT * FROM Q_QUINIELA', sequelize); 
console.log(' *** ', resRow);

const data : any = {
ID_QUINIELA : 9999,
TIT_QUINIELA : 'QUINIELA PRUEBA',
TIPO_DEPORTE : 'FA',
COSTO_QUINIELA : 1000,
SITUACION : 'A'};
const modelo = 'Q_QUINIELA';
const model : any = sequelize.models[modelo];
const resCreate : any = await createRecord (data, model)
console.log(resCreate);

const nomModelo = 'Q_QUINIELA';
const model : any = sequelize.models[modelo];

const dataM: any = {
ID_QUINIELA : 99999,
TIT_QUINIELA : 'MODIFICADA QUINIELA',
COSTO_QUINIELA : 99999,
SITUACION : 'A'};
const resUpdate : any = await updateRecord(dataM, model);
console.log(resUpdate); 

const dataB : any = [{
ID_QUINIELA : 9999,
TIT_QUINIELA : 'QUINIELA PRUEBA 9',
TIPO_DEPORTE : 'FA',
COSTO_QUINIELA : 1000,
SITUACION : 'A'},
{
ID_QUINIELA : 88888,
TIT_QUINIELA : 'QUINIELA PRUEBA 8',
TIPO_DEPORTE : 'FA',
COSTO_QUINIELA : 1000,
SITUACION : 'A'},
{
ID_QUINIELA : 77777,
TIT_QUINIELA : 'QUINIELA PRUEBA 7 ',
TIPO_DEPORTE : 'FA',
COSTO_QUINIELA : 1000,
SITUACION : 'A'},
{
ID_QUINIELA : 77777,
TIT_QUINIELA : 'QUINIELA PRUEBA 6 ',
TIPO_DEPORTE : 'FA',
COSTO_QUINIELA : 1000,
SITUACION : 'A'}

];

const resBulk : any  = await bulkCreateRecords(dataB, model, sequelize)
console.log(resBulk);


const dataD : any = {
ID_QUINIELA : 99999}

const resDelete : any  = await DeleteRecord(dataD, model)
console.log(resDelete);

export async function ejecFuncion<T extends (...args: any[]) => any>(
  fn: T,
  infReq : I_InfRequest,
  logger : Logger,
  sequelize : Sequelize, 
  contexto: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
  try {
    return await fn(...args).catch((error : any)  => { throw (error) });
  } catch (error: any) {
    const opciones : I_CreaObjetoEvento = {
    ID_ENTIDAD: infReq.idEntidad,
    ID_PROCESO: infReq.idProceso,
    F_EVENTO: infReq.fEvento,
    ID_EVENTO: obtenFolio(kFolioEvento)
    }
    const evento : I_FC_TAREA_EVENTO = await crearObjetoEvento(error, opciones);

    await createExcepcion(evento, logger, sequelize);
    const reponse : I_InfResponse ={data : null , errorUs: evento.DESC_ERROR, errorNeg : null};
    throw (contexto);
  }
  return neverReturns();
}

export interface I_InfRequest {
  idEntidad  : number;
  idProceso  : number;
  fEvento    : Date;
  cveUsuario : string;
  cveIdioma  : string;
}

*/
/*
     const req_body = {
     infRequestP : {
     idEntidad  : 1,
     idProceso  : 1,
     },
     datRequest : {
      CVE_USUARIO : 'rojeda',
      APELLIDO_PATERNO : 'Ojeda',
      APELLIDO_MATERNO : 'Zatarain',
      NOMBRE : 'Raul',
      PASSWORD : 'PaSwOrD',
      B_BLOQUEADO : true,
      SIT_USUARIO : 'A'
     }

     } 
     const sequelize : Sequelize = await getInstancia();
     const { infRequestP, datRequest} = req_body;
     const infReq : I_InfRequest = infRequestP;
     const infUsuario : I_FC_SEG_USUARIO = datRequest;

     const contexto = 'Registro de Usuario'
     const nomModelo = 'FC_SEG_USUARIO';
     const model : any = sequelize.models[nomModelo];
     const resData = await ejecFuncion
     (buscaUsuario, infReq, contexto, infReq, contexto, model, datRequest) 
     if (!resData) {
        const hashedPassword = await hash(infUsuario.PASSWORD);
        infUsuario.PASSWORD = hashedPassword;
        const resData =   
        await ejecFuncion
        (createRecord, infReq, contexto, infUsuario, model) 
        } else {
        throw ('El usuario ya existe');
     }
 
*/



