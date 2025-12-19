import { I_Header} from '../../../Modelos/Interface/index.js';
import { ejecFuncion} from '../../../Util/index.js';
import {createRecord} from '../index.js';
import { userContext} from '../../../Middle/index.js'

export async function createRecordService(
    model: any, 
    data: Record<string, any> | Record<string, any>[] | null
) {
    const header   =  userContext.getStore() as I_Header;
    const contexto = 'Crud/Create (Service)';
    console.log( '✅ Header ', header); 
    
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

