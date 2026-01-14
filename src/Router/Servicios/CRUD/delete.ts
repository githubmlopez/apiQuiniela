import { I_Header} from '@modelos/index.js';
import { ejecFuncion} from '@util/index.js';
import {deleteRecord} from '@router/index.js';
import { userContext} from '@middle/index.js'

export async function deleteRecordService(
    model: any, 
    data: Record<string, any> | Record<string, any>[] | null
) {
    const header   =  userContext.getStore() as I_Header;
    const contexto = 'Crud/Delete (Service)';
    
    // The core logic extracted from the try block
    const resData = await ejecFuncion(
        deleteRecord, 
        header, 
        contexto, 
        model, 
        data
    );

    console.log( '✅ Procedimiento delete ejecutado con éxito'); 
    return resData;
}