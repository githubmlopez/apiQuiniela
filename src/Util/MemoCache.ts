import { envConfig } from '../index.js';
import { Cache } from '@ebenezerdon/ts-node-cache';
import { ExecRawQuery} from '../index.js';
import { I_InfResponse } from '../index.js';
import { getInstancia } from '../index.js';
import { Sequelize} from 'sequelize';

const cacheSql      = creaInstCache();
const cacheError    = creaInstCache();
const cacheProc     = creaInstCache();
const cacheDataSql  = creaInstCache();
const cacheDataProc = creaInstCache();

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
console.log('✅ Buscando con tipo', tipo);
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

export function limpiarCacheDinamico(tipo: 'DS' | 'DP', id: number): void {
  // 1. Determinar qué instancia vamos a limpiar
  const instancia = (tipo === 'DS') ? cacheDataSql : cacheDataProc;
  
  // 2. Obtener todas las llaves de esa instancia
  const keys = instancia.getKeys();
  
  // 3. Construir el prefijo de búsqueda (G_ + ID + _)
  // El guion bajo final es importante para evitar que el ID 1 borre al 10, 11, etc.
  const prefijoBusqueda = `G_${id}_`;

  let cont = 0;
  keys.forEach((key: string) => {
    if (key.startsWith(prefijoBusqueda)) {
      instancia.del(key);
      cont++;
    }
  });

  if (cont > 0) {
    console.log(`🧹 [Caché ${tipo}] Se eliminaron ${cont} entradas para el ID: ${id}`);
  }
}

export function invalidarCachePorPatron(tipo: 'DS' | 'DP', patron: string) {
  
  const kCacheSql  = 'DS';
  
  const instancia = (tipo === kCacheSql) ? cacheDataSql : cacheDataProc;
    
    // Tipamos explícitamente como string[] para evitar el error ts(7006)
    const todasLasLlaves: string[] = instancia.keys();
    let contadorBorrado = 0;

    // Definimos que 'key' es un string
    todasLasLlaves.forEach((key: string) => {
        if (key.includes(patron)) {
            instancia.del(key);
            contadorBorrado++;
            console.log(`🗑️ [Invalidación ${tipo}] Llave eliminada: ${key}`);
        }
    });

    if (contadorBorrado > 0) {
        console.log(`✅ Proceso terminado: Se eliminaron ${contadorBorrado} entradas.`);
    }
}
