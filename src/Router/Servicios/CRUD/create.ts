import { I_Header} from '../../../Modelos/Interface/index.js';
import {createRecord} from '../index.js';
import { userContext} from '../../../Middle/index.js'
import { ejecFuncion, creaHeadEsq} from '../../../Util/index.js';

export async function createRecordService(
    model: any, 
    data: Record<string, any> | Record<string, any>[] | null
) {
    const contexto = 'Crud/Create (Service)';
    let header   =  userContext.getStore() as I_Header;

    if(!header) {
        const cveAplicacion = 'CreateRec';
        header   =  creaHeadEsq (cveAplicacion) 
    }

    console.log( '✅ Header 1', header); 
    console.log( '✅ data', data); 
    
    // The core logic extracted from the try block
    const resData = await ejecFuncion(
        createRecord, 
        header, 
        contexto, 
        model, 
        data
    );

    console.log( '✅ Procedimiento create ejecutado con éxito'); 
    return resData;
}

