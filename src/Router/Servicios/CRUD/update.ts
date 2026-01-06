import { I_Header} from '../../../Modelos/Interface/index.js';
import { ejecFuncion} from '../../../Util/index.js';
import {updateRecord} from '../index.js';
import { userContext} from '../../../Middle/index.js'

export async function updateRecordService(
    model: any, 
    data: Record<string, any> | Record<string, any>[] | null,
) {
    const header   =  userContext.getStore() as I_Header;
    const contexto = 'Crud/Update (Service)';
    
    // The core logic extracted from the try block
    const resData = await ejecFuncion(
        updateRecord, 
        header, 
        contexto, 
        model, 
        data
    );

    console.log( '✅ Procedimiento update ejecutado con éxito'); 
    return resData;
}