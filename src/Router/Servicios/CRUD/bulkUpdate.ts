import { I_Header} from '../../../Modelos/Interface/index.js';
import { ejecFuncion} from '../../../Util/index.js';
import {bulkUpdateRecords} from '../index.js';
import { userContext} from '../../../Middle/index.js'

export async function bulkUpdateRecordService(
    model: any, 
    data: Record<string, any> | Record<string, any>[] | null
) {
    const header   =  userContext.getStore() as I_Header;
    const contexto = 'Crud/BulkUpdate (Service)';
    
    // The core logic extracted from the try block
    const resData = await ejecFuncion(
        bulkUpdateRecords, 
        header, 
        contexto, 
        model, 
        data
    );

    console.log( '✅ Procedimiento Bulk Update ejecutado con éxito'); 
    return resData;
}