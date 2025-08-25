import { QueryTypes } from 'sequelize';
import { ObtMemoCache } from '../../index.js';
import { getInstancia } from '../../index.js';
import { prepResponse, formatQuery, formatRepPar, IncHeader } from '../../index.js';
export async function ExecRawQueryById(idQuery, parmRemp, campos, where, orderBy, numReg, skip) {
    // Obtener query de memoria cache
    const kSql = 'S';
    const query = ObtMemoCache(kSql, idQuery);
    console.log('✅ Query', idQuery, query);
    // Construir sentencia SELECT a partir de los parametros proporcionados
    const sqlFmt = formatQuery(query, parmRemp, campos, where, orderBy, numReg, skip);
    const resultado = await ExecQuery(kSql, sqlFmt);
    console.log('✅resultado ', resultado);
    return resultado;
    // return {data : resultado, errorUs: null, errorNeg : null};
}
export async function ExecRawQuery(query) {
    const kSql = 'S';
    const resultado = await ExecQuery(kSql, query);
    return resultado;
}
export async function ExecProcedure(idProcedure, parmRemp, header) {
    const kProcedure = 'P';
    const query = ObtMemoCache(kProcedure, idProcedure);
    console.log(query);
    let sqlFmt = ' ';
    if (parmRemp !== null) {
        sqlFmt = formatRepPar(query, parmRemp);
    }
    else {
        const sqlFmt = query;
    }
    console.log('fmt ' + sqlFmt);
    const sqlFmtHeader = IncHeader(sqlFmt, header);
    const resultado = await ExecQuery(kProcedure, sqlFmtHeader);
    console.log('✅Res Procedure ', resultado);
    return resultado;
}
async function ExecQuery(tipo, query) {
    const sequelize = await getInstancia();
    console.log('✅ Ejecucion ExecQuery ', query);
    const resultado = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
    });
    console.log('✅resultado Orig ', resultado);
    // Lllamado a funcion que determina y construye el response   
    const resRquest = prepResponse(query, resultado, tipo);
    console.log('✅ prepResponse ok', resultado);
    return resRquest;
}
