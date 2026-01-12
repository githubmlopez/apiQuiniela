import { I_InfResponse } from '../../../Modelos/Interface/Configuracion/index.js';
import { ObtMemoCache } from '../../../Util/MemoCache.js';
import { KeyValueObject} from '../.././../Modelos/Interface/Configuracion/index.js';
import { putCacheData} from '../.././../index.js';

export function verificarCacheDinamico(
    tipo: 'DS' | 'DP', 
    id: string, 
    parmRemp: KeyValueObject
): I_InfResponse | null {
    // 1. Obtener Metadatos (S para Query, P para Proc)
    const tipoMeta = (tipo === 'DS') ? 'S' : 'P';
    const meta: any = ObtMemoCache(tipoMeta, id);
    console.log('✅ Verificando memoria cache ', meta)
    // 2. ¿Es candidato a caché?
    if (meta && meta.bCacheable) {
        console.log('✅ Voy a armado de llave');
        // 3. Armar la llave dinámica: G_ID_VALORES
        const campos = meta.llaveConfig ? meta.llaveConfig.split(',') : [];
        const valores = campos.map((c: string) => parmRemp[c.trim()] ?? 'NULL');
        const llaveData = `G_${id}_${valores.join('_')}`;
        console.log('✅ llave : ', llaveData);

        // 4. Buscar en la instancia de DATOS (DS o DP)
        console.log('✅ Busco en memoria ', tipo, llaveData);
        const datosEnMemoria = ObtMemoCache(tipo, llaveData);

        if (datosEnMemoria) {
            console.log(`⚡ [Cache Hit] Identificador: ${llaveData}`);
            return {
                estatus: 1,
                data: datosEnMemoria,
                errorUs: null,
                errorNeg: null
            };
        }
    }
    return null; // Cache Miss o No cacheable
}

/**
 * Guarda el resultado en la instancia correspondiente si el ID es cacheable.
 */
export function guardarCacheDinamico(
    tipo: 'DS' | 'DP',
    id: string,
    parmRemp: KeyValueObject,
    resData: I_InfResponse
): void {
    const tipoMeta = (tipo === 'DS') ? 'S' : 'P';
    const meta: any = ObtMemoCache(tipoMeta, id);
    console.log('✅ Obtengo Meta : ', meta);

    if (meta && meta.bCacheable && resData.estatus && resData.data) {
        const campos = meta.llaveConfig ? meta.llaveConfig.split(',') : [];
        const valores = campos.map((c: string) => parmRemp[c.trim()] ?? 'NULL');
        const llaveData = `G_${id}_${valores.join('_')}`;
        
        // Guardamos con el TTL configurado
        console.log('✅ Procedo a guardar en cache : ', llaveData, resData.data);
        putCacheData(tipo, llaveData, resData.data, meta.timeCache || 60);
    }
}

