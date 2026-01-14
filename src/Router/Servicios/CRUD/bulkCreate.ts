import { I_Header} from '@modelos/index.js';
import { ejecFuncion} from '@util/index.js';
import {bulkCreateRecords} from '@router/index.js';
import { userContext} from '@middle/index.js'

export async function bulkCreateRecordService(
    model: any, 
    data: Record<string, any> | Record<string, any>[] | null
) {
    const header   =  userContext.getStore() as I_Header;
    const contexto = 'Crud/BulkCreate (Service)';

    // The core logic extracted from the try block
    const resData = await ejecFuncion(
        bulkCreateRecords, 
        header, 
        contexto, 
        model, 
        data
    );

    console.log( '✅ Procedimiento Bulk create ejecutado con éxito'); 
    return resData;
}