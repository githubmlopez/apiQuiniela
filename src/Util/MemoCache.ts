import { envConfig } from '../index.js';
import { Cache } from '@ebenezerdon/ts-node-cache';
import { ExecRawQuery} from '../index.js';
import { I_InfResponse } from '../index.js';
import { getInstancia } from '../index.js';
import { Sequelize} from 'sequelize';

const cacheSql = creaInstCache();
const cacheError = creaInstCache();
const cacheProc  = creaInstCache();

export async function cargaCache (
) : Promise<void> {

  const sequelize : Sequelize = await getInstancia();

  const kSql   = 'S';
  const kError = 'E';
  const kProc  = 'P';
  
  const qSql   = envConfig.SEL_QUERY as string;
  const qError = envConfig.SEL_ERROR as string;
  const qProc  = envConfig.SEL_PROC as string;

  const resSql: I_InfResponse= await ExecRawQuery(qSql);
  const objDataS = resSql.data;
  putCache(kSql, cacheSql, objDataS);
  const resError : I_InfResponse = await ExecRawQuery(qError)
  const objDataE = resError.data;
  putCache(kError, cacheError, objDataE);
  const resProc : I_InfResponse = await ExecRawQuery(qProc)
  const objDataP = resProc.data;
  putCache(kProc, cacheProc, objDataP);  
  
  if (cacheSql.length === 0 || cacheError.length === 0 || cacheProc.length === 0)  {
    console.log('❌ Error al cargar la memoria');
    throw ('Error al cargar memoria, Array vacio');
  } 
}

function putCache(infCache: string, cacheMem : any, resultado : 
Array<Record<string, any>> | null) {
  
//  console.log(resultado);
  if (cacheMem instanceof Cache) { console.log('✅ La instancia en memoria es correcta')}
  else {
    console.log('❌ No es una instancia de Cache', cacheMem);
    throw('Error al cargar Memoria Cache');
  }
  if (resultado)
    resultado.forEach((item) => {
    cacheMem.put(item.llave, item.valor);
  })
}


function creaInstCache() : any {
  const memCache = new Cache();
  return memCache;
}

export function
ObtMemoCache(cache: string, key : string) : string | null  {
  const kSql   = 'S';
  const kError = 'E';
  const kProc  = 'P';

  if (cache === kSql) {
     return cacheSql.get(key);
  } else {
    if (cache === kError) {
      return cacheError.get(key);   
  } else {
    if (cache == kProc) {
      return cacheProc.get(key);       
    } else {
      return null;
    }
  }
  }
}
