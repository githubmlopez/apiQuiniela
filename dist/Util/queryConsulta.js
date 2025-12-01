export function prepResponse(query, resultado, tipo) {
    const kCorrecto = 1;
    const kErrorUs = 2;
    const kErrorNeg = 3;
    console.log('✅ Estoy en prepRespone');
    const queryJson = 'FOR JSON PATH';
    const kSql = 'S';
    const kProcedure = 'P';
    let resFormat;
    if (query.includes(queryJson)) {
        resFormat = processSqlServerJsonResult(resultado);
    }
    else {
        resFormat = resultado;
    }
    console.log('✅resultado Format ', resFormat);
    if (tipo === kSql) {
        if (resFormat.length === 0) {
            return { estatus: kCorrecto, data: null, errorUs: null, errorNeg: null };
        }
        else {
            return { estatus: kCorrecto, data: resFormat, errorUs: null, errorNeg: null };
        }
    }
    else {
        if (tipo === kProcedure) {
            const objetoTipado = resultado[0];
            console.log('✅Objeto Tipado ', objetoTipado);
            if (objetoTipado.data) {
                const parsedData = JSON.parse(objetoTipado.data);
                if (Array.isArray(parsedData)) {
                    return { estatus: kCorrecto, data: parsedData, errorUs: null,
                        errorNeg: null };
                }
                else {
                    console.log('✅NO Es un arreglo ');
                    return { estatus: kCorrecto, data: [JSON.parse(objetoTipado.data)], errorUs: null,
                        errorNeg: null };
                }
            }
            else {
                if (objetoTipado.errNeg) {
                    return { estatus: kErrorNeg, data: null, errorUs: objetoTipado.errUs, errorNeg: JSON.parse(objetoTipado.errNeg) };
                }
                else {
                    throw ('No fue posible extraer informacion 1');
                }
            }
        }
        return { estatus: kErrorUs, data: null, errorUs: 'No fue posible extrer informacion 2', errorNeg: null };
    }
}
export function constPredicado(sql, where) {
    let whereClausula = "";
    if (sql.includes("{P}")) {
        const condiciones = where?.map((campo, index) => {
            return `${campo}  $${index + 1} `;
        }) ?? [];
        if (condiciones.length > 0) {
            whereClausula = `WHERE ${condiciones.join(" AND ")}`;
        }
        else {
            whereClausula = "";
        }
        return sql.replace("{P}", whereClausula);
    }
    return sql;
}
// Define los operadores que no deben ir entre comillas
const specialOperators = ['>', '<', 'LIKE', 'IN', '=', 'BETWEEN'];
// Función de utilidad para verificar si el valor contiene un operador especial
function containsSpecialOperator(val) {
    // 1. Verificar si incluye el separador de BETWEEN
    if (val.includes('|')) {
        return true;
    }
    // 2. Convertir a mayúsculas y verificar si comienza con otro operador
    const upperVal = val.toUpperCase().trim();
    for (const op of specialOperators) {
        if (upperVal.startsWith(op)) {
            return true;
        }
    }
    return false;
}
export function formatRepPar(query, repParameters) {
    const kNumero = 'number';
    const kstring = 'string';
    const kmodelo = '$99';
    console.log('✅ Parametros Formateado', repParameters);
    let formattedQuery = query;
    for (const key in repParameters) {
        if (repParameters.hasOwnProperty(key)) {
            console.log('✅ Condicion cumplida ', key);
            const value = repParameters[key];
            const placeholder = key;
            console.log('voy regex ');
            // Crear una nueva expresión regular con el flag 'g' para reemplazar todas las coincidencias
            // Se escapa el '$' ya que tiene un significado especial en expresiones regulares
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            //    
            if (typeof value === kNumero || key === kmodelo) {
                formattedQuery = formattedQuery.replace(regex, String(value));
            }
            else if (typeof value === kstring) {
                // === LÓGICA DE EXCEPCIÓN AÑADIDA AQUÍ ===
                if (containsSpecialOperator(String(value))) {
                    // No encierra en comillas si contiene un operador especial
                    formattedQuery = formattedQuery.replace(regex, String(value));
                }
                else {
                    // Encierra en comillas si es una cadena normal
                    formattedQuery = formattedQuery.replace(regex, `'${value}'`);
                }
            }
            else {
                // Por defecto, encierra otros tipos entre comillas
                formattedQuery = formattedQuery.replace(regex, `'${value}'`);
            }
        }
    }
    //    
    // 2. Handle missing values (replace with ""):
    const placeholders = query.match(/\$\d+/g); // Find all placeholders like $1, $2, etc.
    if (placeholders) {
        // Check if there are any placeholders
        for (const placeholder of placeholders) {
            if (!repParameters.hasOwnProperty(placeholder)) {
                // If the placeholder is NOT in values
                const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                formattedQuery = formattedQuery.replace(regex, '\' \''); // Replace with ""
            }
        }
    }
    return formattedQuery;
}
export function fmtCampos(sql, campos) {
    const camposString = campos ? campos.join(', ') : '*';
    const sqlModificado = sql.replace('{C}', camposString);
    return sqlModificado;
}
export function generarPaginacion(query, orderBy, numReg, skip) {
    console.log('Generando next', orderBy, numReg, skip);
    if (!orderBy || orderBy.length === 0) {
        console.log('no cumplio condiciones');
        return query;
    }
    else {
        const orderByClausula = `ORDER BY ${orderBy.join(", ")}`;
        const offsetFetchClausula = `OFFSET ${skip} ROWS FETCH NEXT ${numReg} ROWS ONLY`;
        const formattedQuery = query.replace("{S}", `${orderByClausula} ${offsetFetchClausula}`);
        return formattedQuery;
    }
}
export function formatQuery(query, parmRemp, campos, where, orderBy, numReg, skip) {
    let queryCamp = ' ';
    if (query.includes('{C}')) {
        queryCamp = fmtCampos(query, campos);
    }
    else {
        queryCamp = query;
    }
    console.log('qc ', queryCamp);
    let querypred = ' ';
    if (query.includes('{P}')) {
        querypred = constPredicado(queryCamp, where);
    }
    else {
        querypred = queryCamp;
    }
    console.log('qp ', querypred);
    let queryNext = ' ';
    if (query.includes('{S}')) {
        queryNext = generarPaginacion(querypred, orderBy, numReg, skip);
    }
    else {
        queryNext = querypred;
    }
    console.log('qp ', queryNext);
    let sqlFmt = ' ';
    if (parmRemp) {
        sqlFmt = formatRepPar(queryNext, parmRemp);
        console.log('fmt ' + sqlFmt);
    }
    else {
        sqlFmt = querypred;
    }
    return sqlFmt;
}
export function processSqlServerJsonResult(sqlQueryResult) {
    if (!sqlQueryResult || sqlQueryResult.length === 0) {
        throw ("Formato de resultado incorrecto");
    }
    let fullJsonString = '';
    let jsonColumnName = '';
    // Determinar el nombre de la columna generada por SQL Server (ej. JSON_F52E2B61-18A1-11d1-B105-00805F49916B)
    // Asumimos que todos los objetos en sqlQueryResult tendrán la misma clave.
    const firstRowKeys = Object.keys(sqlQueryResult[0]);
    if (firstRowKeys.length > 0) {
        jsonColumnName = firstRowKeys[0];
        console.log('✅jsonColumnName ', jsonColumnName);
    }
    else {
        throw ("No se encontraron claves en el resultado de la consulta");
    }
    // Concatenar todas las partes del string JSON
    for (const row of sqlQueryResult) {
        if (row.hasOwnProperty(jsonColumnName)) {
            fullJsonString += row[jsonColumnName];
        }
        else {
            throw (`Una fila no contiene la columna esperada: ${jsonColumnName}`);
        }
        console.log('✅Concatenado  ', fullJsonString);
    }
    // Parsear el string JSON completo a un objeto JavaScript
    // Se tipa explícitamente como '{ data?: any }' para hinting, pero el retorno final es 'any'
    const parsedResult = JSON.parse(fullJsonString);
    console.log('✅Parseado ', fullJsonString);
    // Si tu JSON final tiene una propiedad 'data'
    if (parsedResult && parsedResult.data) {
        if (parsedResult.data.length === 0) {
            return null;
        }
        else {
            return [parsedResult.data]; // Devuelve el contenido de la propiedad 'data'
        }
    }
    else {
        // Si el JSON directamente es el objeto o array que buscamos
        return [parsedResult];
    }
}
export function IncHeader(sql, infHeader) {
    let sqlFmtHeader = sql;
    const jsonHeader = JSON.stringify(infHeader);
    const jsonQheader = `'${jsonHeader}'`;
    const kNomHeader = '@pHeader';
    const jsonQheaderNom = `${kNomHeader} = ${jsonQheader}`;
    if (sql.split(' ').length > 2) {
        sqlFmtHeader = `${sql}, ${jsonQheaderNom}`;
    }
    else {
        sqlFmtHeader = `${sql} ${jsonQheaderNom}`;
    }
    return sqlFmtHeader;
}
