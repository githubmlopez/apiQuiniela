import { envConfig } from '@config/index.js';
import { Cache } from '@ebenezerdon/ts-node-cache';
import { ExecRawQuery} from '@router/index.js';
import { I_InfResponse } from '@modelos/index.js';

const cacheSql      = creaInstCache();
const cacheProc     = creaInstCache();
const cacheDataSql  = creaInstCache();
const cacheDataProc = creaInstCache();
const cachePatron   = creaInstCache();
const cacheLnegra   = creaInstCache();

export async function cargaCache (
) : Promise<void> {

  const kSql   = 'S';
  const kError = 'E';
  const kProc  = 'P';
  
  const qSql   = envConfig.SEL_QUERY  as string;
  const qProc  = envConfig.SEL_PROC   as string;
  const qPat   = envConfig.SEL_PATRON as string;

  const resSql: I_InfResponse= await ExecRawQuery(qSql);
  const objDataS = resSql.data;
  putCache(kSql, cacheSql, objDataS);
  const resProc : I_InfResponse = await ExecRawQuery(qProc)
  const objDataP = resProc.data;
  putCache(kProc, cacheProc, objDataP);  
  const resPatron : I_InfResponse = await ExecRawQuery(qPat)
  const objDataT = resPatron.data;
  putCache(kProc, cachePatron, objDataT);
  
  if (cacheSql.length === 0 || cacheProc.length === 0 || cachePatron.length === 0)  {
    console.log('❌ Error al cargar la memoria');
    throw ('Error al cargar memoria, Array vacio');
  } 
}

export function putCache(infCache: string, cacheMem: any, resultado: Array<Record<string, any>> | null) {
  
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
        timeCache:    item.timeCache,
        bPublico:     item.bPublico,
        bNoDataError: item.bNoDataError,
        msgNoData: item.msgNoData
      });
    } 
    // CASO B: Simple Llave/Valor (Tablas maestras, Errores, etc.)
    else if (item.hasOwnProperty('valor')) {
      console.log('✅ *** guardando llave/valor**', item.llave, item.valor);
      cacheMem.put(item.llave, item.valor);
    }
  });

  console.log(`✅ Memoria [${infCache}] cargada: ${resultado.length} registros.`);
}

function creaInstCache() : any {
  const memCache = new Cache();
  return memCache;
}


// Nueva función para guardar resultados dinámicamente
export function putCacheData(
  tipo: 'DS' | 'DP', 
  key: string, 
  valor: any, 
  ttl: number
): void {

const ttlMilisegundos = ttl;
const esInfinito = !ttlMilisegundos || ttlMilisegundos <= 0;

console.log(' *************** milisegundos ', ttlMilisegundos);
console.log(' 🕒 ¿Es infinito?:', esInfinito);

switch (tipo) {
    case 'DS':
        if (esInfinito) {
            cacheDataSql.put(key, valor); // Versión sobrecargada (Infinito)
        } else {
            cacheDataSql.put(key, valor, ttlMilisegundos); // Versión con tiempo
        }
        break;

    case 'DP':
        if (esInfinito) {
            cacheDataProc.put(key, valor);
        } else {
            cacheDataProc.put(key, valor, ttlMilisegundos);
        }
        break;

    default:
        console.error(`❌ Intento de guardado en tipo de caché inválido: ${tipo}`);
}
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

export async function BorraCache(tipo: 'M' | 'P', id: string): Promise<void> {
    const kPatron = 'DT';
    const kSql    = 'DS';
    const kProc   = 'DP';
    const kBorraTodo = 'BORRA';

    const llavePatron = `${tipo.trim()}_${id.trim()}`;
    const instCache = GetCache(kPatron);
    const meta: any = instCache.get(llavePatron);

    // 1. SI NO EXISTE META, NO HACEMOS NADA
    if (!meta) {
        // Simplemente salimos. No hace falta retornar nada por ser Promise<void>
        return; 
    }

    // 2. CASO ESPECIAL: BORRADO TOTAL
    if (meta === kBorraTodo) {
        console.warn('⚠️⚠️⚠️ Ejecutando borrado TOTAL de caché');
        GetCache(kSql).clear();
        GetCache(kProc).clear();
        return; 
    }

    // 3. FLUJO NORMAL: Si llegamos aquí, sabemos que meta existe y no es "CLEAR"
    console.warn('⚠️ Solicitando Borrado de información específica:', meta, llavePatron);

    await BorrarCachePatron(kSql, meta);
    await BorrarCachePatron(kProc, meta);
}

export function GetCache(tipo: string) : any | null  {
  const kSql    = 'S';
  const kProc   = 'P';
  const kDataS  = 'DS';
  const kDataP  = 'DP';
  const kDataT  = 'DT';
  const kLnegra = 'L';

//console.log('✅ Buscando instancia con tipo', tipo);
switch (tipo) {
    case kSql:
      return cacheSql;
     
    case kProc:
      return cacheProc;
      
    case kDataS:
      return cacheDataSql;
      
    case kDataP:
      return cacheDataProc;

    case kDataT:
      return cachePatron;

    case kLnegra:
      return cacheLnegra;
      
    default:
      console.warn(`⚠️ Tipo de caché no reconocido: ${tipo}`);
      return null;
  }
}
