import { envConfig } from '@config/index.js';
import { Cache } from '@ebenezerdon/ts-node-cache';
import { ExecRawQuery} from '@router/index.js';
import { I_InfResponse } from '@modelos/index.js';

const cacheSql      = creaInstCache();
const cacheError    = creaInstCache();
const cacheProc     = creaInstCache();
const cacheDataSql  = creaInstCache();
const cacheDataProc = creaInstCache();
const cachePatron   = creaInstCache();

export async function cargaCache (
) : Promise<void> {

  const kSql   = 'S';
  const kError = 'E';
  const kProc  = 'P';
  
  const qSql   = envConfig.SEL_QUERY  as string;
  const qError = envConfig.SEL_ERROR  as string;
  const qProc  = envConfig.SEL_PROC   as string;
  const qPat   = envConfig.SEL_PATRON as string;

  const resSql: I_InfResponse= await ExecRawQuery(qSql);
  const objDataS = resSql.data;
  putCache(kSql, cacheSql, objDataS);
  const resError : I_InfResponse = await ExecRawQuery(qError)
  const objDataE = resError.data;
  putCache(kError, cacheError, objDataE);
  const resProc : I_InfResponse = await ExecRawQuery(qProc)
  const objDataP = resProc.data;
  putCache(kProc, cacheProc, objDataP);  
  const resPatron : I_InfResponse = await ExecRawQuery(qPat)
  const objDataT = resPatron.data;
  putCache(kProc, cachePatron, objDataT);
  
  if (cacheSql.length === 0 || cacheError.length === 0 || cacheProc.length === 0 || cachePatron.length === 0)  {
    console.log('❌ Error al cargar la memoria');
    throw ('Error al cargar memoria, Array vacio');
  } 
}
/*
function putCache(infCache: string, cacheMem: any, resultado: Array<Record<string, any>> | null) {
  
  if (!(cacheMem instanceof Cache)) {
    throw('Error al cargar Memoria Cache');
  }

  if (resultado) {
    resultado.forEach((item) => {
      // Si el item tiene 'sql', asumimos que es una configuración de Query o Proc
      if (item.sql !== undefined) {
        cacheMem.put(item.llave, {
          sql:          item.sql,
          bCacheable:   item.bCacheable,
          llaveConfig:  item.llaveConfig,
          timeCache:    item.timeCache
        });
      } else {
        // Si no, es un caso simple como el de Errores (llave/valor)
        cacheMem.put(item.llave, item.valor);
      }
    });
    console.log(`✅ Memoria [${infCache}] cargada: ${resultado.length} registros.`);
  }
}
*/

function putCache(infCache: string, cacheMem: any, resultado: Array<Record<string, any>> | null) {
  
  if (!(cacheMem instanceof Cache)) {
    throw new Error('Error al cargar Memoria Cache: Instancia inválida');
  }

  if (!resultado || resultado.length === 0) {
    console.warn(`⚠️ [${infCache}] No hay datos para cargar.`);
    return;
  }

  resultado.forEach((item) => {
    // Validamos que al menos exista la propiedad 'llave'
    if (item.llave === undefined) return;

    // CASO A: Configuración compleja (Queries/Procs)
    // Verificamos si existe 'sql' para identificar este tipo de objeto
    if (item.hasOwnProperty('sql')) {
      cacheMem.put(item.llave, {
        sql:         item.sql,
        bCacheable:   item.bCacheable,
        llaveConfig:  item.llaveConfig,
        timeCache:    item.timeCache
      });
    } 
    // CASO B: Simple Llave/Valor (Tablas maestras, Errores, etc.)
    else if (item.hasOwnProperty('valor')) {
      console.log(' *** guardando llave **', item.llave, item.valor)
      cacheMem.put(item.llave, item.valor);
    }
  });

  console.log(`✅ Memoria [${infCache}] cargada: ${resultado.length} registros.`);
}

function creaInstCache() : any {
  const memCache = new Cache();
  return memCache;
}

export function
ObtMemoCache(tipo: string, key : string) : any | null  {
  const kSql    = 'S';
  const kError  = 'E';
  const kProc   = 'P';
  const kDataS  = 'DS';
  const kDataP  = 'DP';
  const kDataT  = 'DT';

console.log('✅ Buscando con tipo', tipo,key);
switch (tipo) {
    case kSql:
      return cacheSql.get(key);
      
    case kError:
      return cacheError.get(key);
      
    case kProc:
      return cacheProc.get(key);
      
    case kDataS:
      return cacheDataSql.get(key);
      
    case kDataP:
      return cacheDataProc.get(key);

    case kDataT:
      return cachePatron.get(key);
      
    default:
      console.warn(`⚠️ Tipo de caché no reconocido: ${tipo}`);
      return null;
  }
}

// Nueva función para guardar resultados dinámicamente
export function putCacheData(
  tipo: 'DS' | 'DP', 
  key: string, 
  valor: any, 
  ttl: number = 60
): void {
   console.log('Datos put : ', tipo,key, valor,ttl);
  
  const ttlMilisegundos = (Number(ttl) || 300) * 1000;

  switch (tipo) {
    case 'DS':
      cacheDataSql.put(key, valor, ttlMilisegundos);
      break;

    case 'DP':
      cacheDataProc.put(key, valor, ttlMilisegundos);
      break;

    default:
      console.error(`❌ Intento de guardado en tipo de caché inválido: ${tipo}`);
  }
  console.log(`📊 Total de llaves en cacheDataSql: ${cacheDataSql.keys().length}`);
  console.log(`🔑 Llaves actuales:`, cacheDataSql.keys());
}


export async function BorrarCachePatron(tipo: 'DS' | 'DP', patronesInput: string) : Promise<void> {
  const kCacheSql = 'DS';
  const instancia = (tipo === kCacheSql) ? cacheDataSql : cacheDataProc;
  
  // 1. Convertimos el string de patrones en un arreglo limpio
  // Usamos trim() para ignorar espacios accidentales como "patron1, patron2"
  const listaPatrones = patronesInput.split(',').map(p => p.trim()).filter(p => p !== '');

  const todasLasLlaves: string[] = instancia.keys();
  let contadorBorrado = 0;

  todasLasLlaves.forEach((key: string) => {
    // 2. Verificamos si la llave contiene alguno de los patrones proporcionados
    // .some() devuelve true en cuanto encuentra la primera coincidencia
    const coincide = listaPatrones.some(patron => key.includes(patron));

    if (coincide) {
      instancia.del(key);
      contadorBorrado++;
      console.log(`🗑️ [Invalidación ${tipo}] Llave eliminada: ${key}`);
    }
  });

  if (contadorBorrado > 0) {
    console.log(`✅ Proceso terminado: Se eliminaron ${contadorBorrado} entradas usando [${listaPatrones.join(', ')}].`);
  } else {
    console.log(`ℹ️ No se encontraron llaves que coincidan con los patrones.`);
  }
}

export async function BorraCache(tipo : 'M' | 'P',id: string) : Promise<void> {
    const kPatron = 'DT';

    const llavePatron = tipo + id.replace(/\s+/g, '');
    const kSql        = 'DS';
    const kProc       = 'DP';

    const meta: any = ObtMemoCache(kPatron, llavePatron);
    console.warn('⚠️ Solicitando Borrado de informacion', llavePatron, meta);

    if (meta) {
      await BorrarCachePatron (kSql, meta);
      await BorrarCachePatron (kProc, meta);
    }
}

