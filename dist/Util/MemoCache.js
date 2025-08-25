import { envConfig } from '../index.js';
import { Cache } from '@ebenezerdon/ts-node-cache';
import { ExecRawQuery } from '../index.js';
import { getInstancia } from '../index.js';
const cacheSql = creaInstCache();
const cacheError = creaInstCache();
const cacheProc = creaInstCache();
export async function cargaCache() {
    const sequelize = await getInstancia();
    const kSql = 'S';
    const kError = 'E';
    const kProc = 'P';
    const qSql = envConfig.SEL_QUERY;
    const qError = envConfig.SEL_ERROR;
    const qProc = envConfig.SEL_PROC;
    const resSql = await ExecRawQuery(qSql);
    const objDataS = resSql.data;
    putCache(kSql, cacheSql, objDataS);
    const resError = await ExecRawQuery(qError);
    const objDataE = resError.data;
    putCache(kError, cacheError, objDataE);
    const resProc = await ExecRawQuery(qProc);
    const objDataP = resProc.data;
    putCache(kProc, cacheProc, objDataP);
    if (cacheSql.length === 0 || cacheError.length === 0 || cacheProc.length === 0) {
        console.log('❌ Error al cargar la memoria');
        throw ('Error al cargar memoria, Array vacio');
    }
}
function putCache(infCache, cacheMem, resultado) {
    //  console.log(resultado);
    if (cacheMem instanceof Cache) {
        console.log('✅ La instancia en memoria es correcta');
    }
    else {
        console.log('❌ No es una instancia de Cache', cacheMem);
        throw ('Error al cargar Memoria Cache');
    }
    if (resultado)
        resultado.forEach((item) => {
            cacheMem.put(item.llave, item.valor);
        });
}
function creaInstCache() {
    const memCache = new Cache();
    return memCache;
}
export function ObtMemoCache(cache, key) {
    const kSql = 'S';
    const kError = 'E';
    const kProc = 'P';
    if (cache === kSql) {
        return cacheSql.get(key);
    }
    else {
        if (cache === kError) {
            return cacheError.get(key);
        }
        else {
            if (cache == kProc) {
                return cacheProc.get(key);
            }
            else {
                return null;
            }
        }
    }
}
