import { I_Header} from '@modelos/index.js';
import {createRecord} from '@router/index.js';
import { userContext} from '@middle/index.js'
import { ejecFuncion, creaHeadEsq} from '@util/index.js';

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

