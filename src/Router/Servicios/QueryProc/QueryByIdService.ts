import { I_Header, KeyValueObject, I_InfResponse} from '@modelos/index.js';
import { ejecFuncion} from '@util/index.js';
import {ExecRawQueryById} from '@router/index.js';
import { userContext} from '@middle/index.js'
import { envConfig} from '@config/index.js';
import { verificarCacheDinamico, guardarCacheDinamico} from './index.js';

export async function QueryByIdService(
    idQuery: string,
    parmRemp: KeyValueObject,
    campos: string[],
    where: string[],
    orderBy: string[],
    numReg: number,
    skip: number
) {
    const header = userContext.getStore() as I_Header;
    const contexto = 'Query/By Id (Service)';
    const infQuery = 'DS';
    
    // 1. Interruptor Maestro (Variable de Ambiente)
    // Asumimos que envConfig ya trae el valor de MEM_CACHE
    const usarCache = envConfig.MEM_CACHE;

    // 2. Intento de recuperación de memoria (SOLO si el interruptor está ON)
    if (usarCache) {
        console.log('✅ Se buscara en memoria cache ');
        const resCached = verificarCacheDinamico(infQuery, idQuery, parmRemp);
        if (resCached) {
            console.log('✅ Respondiendo con Memoria cache ');
            return resCached;
        }   
    }

    // 3. Ejecución normal (DB)
    // Esta parte siempre se ejecuta si la caché está apagada o si no se encontró el dato
    const resData: I_InfResponse = await ejecFuncion(
        ExecRawQueryById, 
        header, 
        contexto,
        idQuery, 
        parmRemp,
        campos,
        where,
        orderBy,
        numReg,
        skip
    );

    // 4. Intento de guardado en memoria (SOLO si el interruptor está ON)
    if (usarCache) {
        console.log('✅ Guardando cache en memoria ');
        guardarCacheDinamico(infQuery, idQuery, parmRemp, resData);
    }

    console.log(`✅ Consulta ejecutada con éxito (${usarCache ? 'Cache/DB' : 'DB Directo'})`); 

    return resData;

} 