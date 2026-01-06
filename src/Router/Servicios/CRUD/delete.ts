import { I_Header} from '../../../Modelos/Interface/index.js';
import { ejecFuncion} from '../../../Util/index.js';
import {deleteRecord} from '../index.js';
import { userContext} from '../../../Middle/index.js'

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