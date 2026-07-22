import { I_ResProcedure, I_InfResponse, I_Header  } from '@modelos/index.js';
import { KeyValueObject } from '@modelos/index.js';

export function formatQuery (
query : string,
parmRemp : KeyValueObject,
campos? : string[],
where? : string[],
orderBy? : string[],
numReg? : number,
skip? : number) : string {

  let queryCamp = ' ';
  if (query.includes('{C}')) {
    queryCamp = fmtCampos(query, campos);
  } else {
    queryCamp = query;
  }  
  console.log('qc ', queryCamp );

  let querypred = ' '
  if (query.includes('{P}')) {
    querypred = constPredicado(queryCamp, where)
  } else {
    querypred = queryCamp;
  }
  console.log('qp ', querypred );

  let queryNext = ' '
  if (query.includes('{S}')) {
    queryNext = generarPaginacion(querypred, orderBy, numReg, skip)
  } else {
    queryNext = querypred;
  }
  console.log('qp ', queryNext );


  let sqlFmt = ' '
  if (parmRemp)  {
    sqlFmt = formatRepPar(queryNext, parmRemp);
    console.log('fmt ' + sqlFmt);
  } else {
    sqlFmt = querypred;  
  }

  return sqlFmt;
}


export function prepResponse(query : string, resultado : any, tipo : string) : I_InfResponse {
    const kCorrecto = 1;
    const kErrorUs  = 2;
    const kErrorNeg = 3; 
    console.log ('✅ Estoy en prepRespone');
    const queryJson = 'FOR JSON PATH';
    const kSql = 'S';
    const kProcedure = 'P';
    let  resFormat;
    if (query.includes(queryJson)) {
        resFormat = processSqlServerJsonResult(resultado); 
      } else {
        resFormat = resultado
      }
      console.log('✅resultado Format ', resFormat);
      if (tipo === kSql) {
        if (resFormat.length === 0 || null) {
          return {estatus: kCorrecto, data : null, errorUs: null, errorNeg : null};
        } 
        else {
          return {estatus: kCorrecto, data : resFormat, errorUs: null, errorNeg : null};
        }
      } else {
        if (tipo === kProcedure) {
          const objetoTipado: I_ResProcedure = resultado[0] as I_ResProcedure;
          console.log('✅Objeto Tipado ', objetoTipado);
          if (objetoTipado.data) {
            const parsedData = JSON.parse(objetoTipado.data);
            if (Array.isArray(parsedData)) {
              return {estatus: kCorrecto, data : parsedData, errorUs : null, errorNeg :null};
            } else {
              console.log('✅NO Es un arreglo ');
              return {estatus: kCorrecto, data : [JSON.parse(objetoTipado.data)], errorUs : null,
              errorNeg :null};
            }
          } else {
            if (objetoTipado.errorNeg) {
            console.log('✅Tiene errores de negocio ', objetoTipado.errorNeg);  
            return {estatus: kErrorNeg, data : null, errorUs : objetoTipado.errorUs, errorNeg : JSON.parse(objetoTipado.errorNeg)};
            } else {
            console.log('✅No tiene ni data ni errorneg ', objetoTipado.errorUs);  
              return {estatus: kErrorUs, data : null, errorUs : objetoTipado.errorUs, errorNeg : null};
            }
          }
        }
        return {estatus: kErrorUs, data : null, errorUs : 'No fue posible extrer informacion', errorNeg : null};
    }
}

export function constPredicado(sql : string, where:  string[] | null | undefined): string  {
    let whereClausula = "";

    if (sql.includes("{P}")) {
        const condiciones: string[] = where?.map((campo, index) => {
            return `${campo}  $${index + 1} `;
        }) ?? [];

        if (condiciones.length > 0) {
            whereClausula = `WHERE ${condiciones.join(" AND ")}`;
        } else {
            whereClausula = "";
        }

        return sql.replace("{P}", whereClausula);
    }

    return sql; 
} 

// Define los operadores que no deben ir entre comillas
const specialOperators = ['>', '<', 'LIKE', 'IN', '=', 'BETWEEN'];

// Función de utilidad para verificar si el valor contiene un operador especial
function containsSpecialOperator(val: string): boolean {
    // 1. Limpieza y preparación
    const upperVal = val.toUpperCase().trim();

    // 2. Evaluación de la lista de operadores
    for (const op of specialOperators) {
        // Caso A: El valor es exactamente el operador (poco común pero posible)
        if (upperVal === op) {
            return true;
        }

        // Caso B: El valor comienza con el operador seguido de un espacio 
        // (Ejemplo: "IN (1,2,3)" o "LIKE '%MARIO%'")
        if (upperVal.startsWith(op + ' ') || upperVal.startsWith(op + '(')) {
            return true;
        }
        
        // Caso C: Operadores de comparación pegados (Ejemplo: ">10" o "<5")
        // Solo aplica para operadores matemáticos de un solo carácter
        if (['>', '<', '='].includes(op) && upperVal.startsWith(op) && !isNaN(Number(upperVal.substring(1).trim()))) {
            return true;
        }
    }

    return false;
}

export function formatRepPar(query: string, repParameters: KeyValueObject): string {
  const kNumero: string = 'number';
  const kstring: string = 'string';
  const kmodelo: string = '$99';
  
  let formattedQuery = query;

  for (const key in repParameters) {
    if (repParameters.hasOwnProperty(key)) {
      const value: string | number = repParameters[key];
      const valStr = String(value);
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

      // 1. CASO NÚMERO O MODELO ($99)
      // Se inserta el valor tal cual (sin comillas)
      if (typeof value === kNumero || key === kmodelo) {
        formattedQuery = formattedQuery.replace(regex, valStr);
      } 
      
      // 2. CASO STRING
      else if (typeof value === kstring) {
        // Si ya trae un operador (IN, LIKE, >, <, =), no ponemos comillas
        if (containsSpecialOperator(valStr)) {
          formattedQuery = formattedQuery.replace(regex, valStr);
        } else {
          // Si es un texto plano, le ponemos comillas simples
          formattedQuery = formattedQuery.replace(regex, `'${valStr}'`);
        }
      } 
      
      // 3. CUALQUIER OTRO TIPO (Seguridad)
      else {
        formattedQuery = formattedQuery.replace(regex, `'${valStr}'`);
      }
    }
  }

  // Limpieza de marcadores no enviados (reemplazo por espacio con comillas)
  const placeholders = query.match(/\$\d+/g);
  if (placeholders) {
    for (const placeholder of placeholders) {
      if (!repParameters.hasOwnProperty(placeholder)) {
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        formattedQuery = formattedQuery.replace(regex, "' '");
      }
    }
  }

  return formattedQuery;
}

export function fmtCampos(sql: string, campos: string[] | null | undefined): string {
      const camposString = campos ? campos.join(', ') : '*';
      const sqlModificado = sql.replace('{C}', camposString);
      return sqlModificado;
}

export function generarPaginacion(
  query: string,
  orderBy: string[] | null | undefined,
  numReg: number | null | undefined,
  skip: number | null | undefined
): string {
  console.log('Generando next', orderBy, numReg, skip);
  if (!orderBy || orderBy.length === 0) {
      console.log('no cumplio condiciones');  
      return query
      } else {     
      const orderByClausula = `ORDER BY ${orderBy.join(", ")}`;
      const offsetFetchClausula = `OFFSET ${skip} ROWS FETCH NEXT ${numReg} ROWS ONLY`;
      const formattedQuery = query.replace("{S}", `${orderByClausula} ${offsetFetchClausula}`);
      return formattedQuery;
      }
}

export function processSqlServerJsonResult(sqlQueryResult: any): Array<Record<string, any>> | null {
    if (!sqlQueryResult || sqlQueryResult.length === 0) {
        throw("Formato de resultado incorrecto");
    }

    let fullJsonString: string = '';
    let jsonColumnName: string = '';

    // Determinar el nombre de la columna generada por SQL Server (ej. JSON_F52E2B61-18A1-11d1-B105-00805F49916B)
    // Asumimos que todos los objetos en sqlQueryResult tendrán la misma clave.
    const firstRowKeys = Object.keys(sqlQueryResult[0]);
    if (firstRowKeys.length > 0) {
        jsonColumnName = firstRowKeys[0];
        console.log('✅jsonColumnName ', jsonColumnName);
    } else {
        throw("No se encontraron claves en el resultado de la consulta");

    }

    // Concatenar todas las partes del string JSON
    for (const row of sqlQueryResult) {
        if (row.hasOwnProperty(jsonColumnName)) {
            fullJsonString += row[jsonColumnName];
        } else {
            throw(`Una fila no contiene la columna esperada: ${jsonColumnName}`);
        }
        console.log('✅Concatenado  ', fullJsonString);
    }
    
    // Parsear el string JSON completo a un objeto JavaScript
    // Se tipa explícitamente como '{ data?: any }' para hinting, pero el retorno final es 'any'
    const parsedResult: { data?: any } = JSON.parse(fullJsonString);
    console.log('✅Parseado ', parsedResult);

    // Si tu JSON final tiene una propiedad 'data'
    if (parsedResult && parsedResult.data) {
        if (parsedResult.data.length === 0) {
        return null;
        } else {
        return [parsedResult.data]; // Devuelve el contenido de la propiedad 'data'
        }
    } else {
    // Si el JSON directamente es el objeto o array que buscamos
        return [parsedResult];
    }
}

export function IncHeader (sql : string, infHeader : I_Header) : string {
  let sqlFmtHeader = sql;
  const jsonHeader : string = JSON.stringify(infHeader);
  const jsonQheader = `'${jsonHeader}'`
  const kNomHeader = '@pHeader';
  const jsonQheaderNom = `${kNomHeader} = ${jsonQheader}`;
  if (sql.split(' ').length > 2) {
    sqlFmtHeader = `${sql}, ${jsonQheaderNom}`;
  } else {
    sqlFmtHeader = `${sql} ${jsonQheaderNom}`;
  } 
  return sqlFmtHeader;
}

//const resRquest : I_InfResponse = prepResponse(query, resultado, tipo) as I_InfResponse;

export function verificaResult (resRquest : I_InfResponse, bNoDataError : boolean, msgNoData : string) : string | null {
  let msgUsuario = null; 
  if (resRquest.data === null && bNoDataError) {
    msgUsuario = msgNoData;
}
  return msgUsuario
}