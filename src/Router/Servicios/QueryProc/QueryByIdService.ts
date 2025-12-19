import { I_Header, KeyValueObject} from '../../../Modelos/Interface/index.js';
import { ejecFuncion} from '../../../Util/index.js';
import {ExecRawQueryById} from '../index.js';
import { userContext} from '../../../Middle/index.js'

export async function QueryByIdService(
    idQuery : string,
    parmRemp : KeyValueObject,
    campos : string[],
    where : string[],
    orderBy : string[],
    numReg : number,
    skip : number) {

    const header   =  userContext.getStore() as I_Header;
    const contexto = 'Query/By Id (Service)';
    console.log( '✅ Header ', header); 
    
    // The core logic extracted from the try block
    const resData = await ejecFuncion(
        ExecRawQueryById, 
        header, 
        contexto,
        idQuery, 
        parmRemp,
        campos,
        where,
        orderBy,
        numReg,
        skip
    
    );

    console.log( '✅ Consulta ejecutada con éxito'); 
    return resData;
}