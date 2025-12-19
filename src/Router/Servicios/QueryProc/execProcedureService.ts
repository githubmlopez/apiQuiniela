import { I_Header, KeyValueObject} from '../../../Modelos/Interface/index.js';
import { ejecFuncion} from '../../../Util/index.js';
import { ExecProcedure } from '../index.js';
import { userContext} from '../../../Middle/index.js'

export async function execProcedureService(
    idProcedure: string,
    parmRemp : KeyValueObject) {

    const header   =  userContext.getStore() as I_Header;
    const contexto = 'Procedure / Exec (Service)';
    console.log( '✅ Header ', header); 
    
    // The core logic extracted from the try block
    const resData = await ejecFuncion(
        ExecProcedure, 
        header, 
        contexto,
        idProcedure, 
        parmRemp,
        header
    );

    console.log( '✅ Procedure ejecutado con éxito'); 
    return resData;
}