import { Sequelize, QueryTypes } from 'sequelize';
import { KeyValueObject } from '../../index.js';
import { ObtMemoCache } from '../../index.js';
import { I_InfResponse, I_Header} from '../../index.js';
import { getInstancia } from '../../index.js';
import { prepResponse, formatQuery, formatRepPar, IncHeader } from '../../index.js';

interface SqlQueryResultRow {
    [key: string]: string; // La clave es el nombre de la columna generada, el valor es una parte del string JSON
}

export async function ExecRawQueryById(
idQuery  : string,
parmRemp : KeyValueObject,
campos? : string[],
where? : string[],
orderBy? : string[],
numReg? : number,
skip? : number
)  : Promise<I_InfResponse>{

// Obtener query de memoria cache

  const kSql = 'S';
  const query : any = ObtMemoCache(kSql, idQuery);
  console.log('✅ Query', idQuery, query)

// Construir sentencia SELECT a partir de los parametros proporcionados

  const sqlFmt = formatQuery (query, parmRemp, campos, where, orderBy, numReg, skip);
  const resultado : I_InfResponse = await ExecQuery(kSql, sqlFmt);
  console.log('✅resultado ', resultado);
  return resultado;
  // return {data : resultado, errorUs: null, errorNeg : null};
     
  }

  export async function ExecRawQuery(
  query  : string, 
  ) : Promise<I_InfResponse>{
  const kSql = 'S';
  const resultado = await ExecQuery(kSql, query)

  return resultado as I_InfResponse;

}

export async function ExecProcedure(
  idProcedure  : string,
  parmRemp : KeyValueObject,
  header : I_Header
  )  : Promise<I_InfResponse>{
      const kProcedure = 'P';
      const query : any = ObtMemoCache(kProcedure, idProcedure); 
      console.log(query);
      let sqlFmt = ' '
      if (parmRemp !== null)  {
       sqlFmt = formatRepPar(query, parmRemp);
      } else {
       const sqlFmt = query;  
      }
      console.log('fmt ' + sqlFmt);

      const sqlFmtHeader = IncHeader (sqlFmt, header);
 
      const resultado : I_InfResponse = await ExecQuery(kProcedure, sqlFmtHeader) as I_InfResponse;

      console.log('✅Res Procedure ', resultado); 
 
      return resultado;
  
  } 

async function ExecQuery(
tipo : string,
query  : string
) : Promise<I_InfResponse>{
  const sequelize : Sequelize = await getInstancia();  
  console.log('✅ Ejecucion ExecQuery ', query); 
  const resultado = await sequelize.query(query, {
  type: QueryTypes.SELECT,
  raw: true}) 
  
  console.log('✅resultado Orig ', resultado);

  // Lllamado a funcion que determina y construye el response   

  const resRquest : I_InfResponse = prepResponse(query, resultado, tipo) as I_InfResponse;
  console.log ('✅ prepResponse ok', resRquest);

  return resRquest;

}

