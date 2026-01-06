import { I_Header} from '../../../Modelos/Interface/index.js';
import { ejecFuncion} from '../../../Util/index.js';
import {bulkCreateRecords} from '../index.js';
import { userContext} from '../../../Middle/index.js'

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