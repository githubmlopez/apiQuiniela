import { Sequelize, Model, Transaction, ValidationError} from 'sequelize';
import { I_InfResponse } from '../../index.js';
import { getInstancia } from '../../index.js';

const kCorrecto = 1;
const kErrorNeg = 3;

interface I_OperaResult {
    estatus: number;
    validationErrors?: string[] | null; 
}

// Estas definiciones solo se especifican como parte documental sobre las firma de 
// los diferentes metodos que se enviaran como callbacks
type CreateOp = (model: typeof Model, data: any, options?:
{ transaction?: Transaction }) => Promise<I_InfResponse>;
type UpdateOp = (model: typeof Model, data: any, options?:
{ transaction?: Transaction }) => Promise<I_InfResponse>;
type DeleteOp = (model: typeof Model, data: any, options?:
{ transaction?: Transaction }) => Promise<I_InfResponse>;
type BulkCreateOp = (model: typeof Model, dataArray: any[], options?:
{ transaction?: Transaction }) => Promise<I_InfResponse>;
type BulkUpdateOp = (model: typeof Model, dataArray: any[], options?:
{ transaction?: Transaction }) => Promise<I_InfResponse>;

// Function to generate the where clause for findOne based on primary keys
function buildPKWhereClause<T extends object>(model: any, data: T): any {
  console.log('✅ Model', model)
  const primaryKeyAttributes = model.primaryKeyAttributes;
  console.log('✅ pk ** ' + JSON.stringify(primaryKeyAttributes), data);
  const whereClause: any = {};

  primaryKeyAttributes.forEach((key: any) => {
    if (data[key as keyof T] !== undefined) {
      whereClause[key] = data[key as keyof T];
    } else {
      throw(`No existe valor para llave primaria  ${key} `);
    }
  });

  return whereClause;
}

export async function findOneByPrimaryKey<M extends Model>(
  model: { findOne: (options: any) => Promise<M | null> },
  data: Partial<M>, // Using Partial<M> as we might only have PK values
  options? : { transaction?: Transaction } 
): Promise<any> 
{
  const whereClause = buildPKWhereClause(model, data);
  console.log('WHERE ** ' + JSON.stringify(whereClause));
  
  const resultado = await model.findOne({ where: whereClause, ...options });

  const numReg = 1;

  return {estatus : kCorrecto, data : [resultado], errorUs: null, errorNeg : null};
}

export async function createRecord (
  model: typeof Model,
  data: any,
  opciones?: { transaction?: Transaction } 
): Promise<I_InfResponse> {
  console.log(data);
  console.log(model.primaryKeyAttributes);
  const existingRecord : I_InfResponse = await findOneByPrimaryKey(model, data); 

  if (existingRecord && existingRecord.data && existingRecord.data.length > 0 && existingRecord.data[0]?.dataValues) {
    throw ('Registro ya existe ' + model.name);
   } else {
    const resultado : I_OperaResult = await obtResultado(
    async (model: any, data: any, opciones?: { transaction?: Transaction }) => {
      const instance = await model.create(data, opciones);
      return instance; 
    },
    model, 
    data,  
    opciones 
  );
  const resData : any  = obtContadorReg (resultado.validationErrors);
  return {estatus : resultado.estatus,
  data : resData,
  errorUs: null,
  errorNeg : resultado.validationErrors as string[] | null};
  }
}

export async function updateRecord (
  model: typeof Model,
  data: any,
  opciones?: { transaction?: Transaction } 
): Promise<I_InfResponse> {
  console.log('✅ Procesando elemento U ', model, data);
  console.log(model.primaryKeyAttributes);
  const existingRecord : I_InfResponse = await findOneByPrimaryKey(model, data, opciones); 
  if (existingRecord && existingRecord.data && existingRecord.data.length > 0 && existingRecord.data[0]?.dataValues) {
    const whereClause = buildPKWhereClause (model, data);
    const resultado : I_OperaResult = await obtResultado (
    async (model: any, data: any, opciones?: { transaction?: Transaction }) => {
      const instance = await model.update(data, {
      where: whereClause, ...opciones  // Utiliza la variable whereClause directamente
      });
      return instance; 
    },
    model, 
    data,  
    opciones 
  );
  const resData : any  = obtContadorReg (resultado.validationErrors);
  return {estatus : kCorrecto, data : resData, errorUs: null, errorNeg : resultado.validationErrors as string[] | null};
  } else { 
    throw ('Registro no existe ' + model.name);
  } 
}

export async function DeleteRecord (
  model: typeof Model,
  data: any,
  opciones?: { transaction?: Transaction } 
): Promise<I_InfResponse> {
  console.log(data);
  console.log(model.primaryKeyAttributes);
  const existingRecord = await findOneByPrimaryKey(model, data); 
  if (existingRecord && existingRecord.data && existingRecord.data.length > 0 && existingRecord.data[0]?.dataValues) {
    const resultado : I_OperaResult = await obtResultado(
    async (existingRecord, opciones?: { transaction?: Transaction }) => {
      const instance = await existingRecord.data[0].destroy();
      return instance; 
    },
    existingRecord,  
    opciones 
  );
  const resData : any  = obtContadorReg (resultado.validationErrors);
  return {estatus : kCorrecto, data : resData, errorUs: null, errorNeg : resultado.validationErrors as string[] | null};
  } else {
  throw ('Registro no existe ' + model.name);
}
}

export async function bulkCreateRecords(
  model: typeof Model,
  data: any,
  opciones?: { transaction?: Transaction }
): Promise<I_InfResponse> {
  const sequelize : Sequelize = await getInstancia();  
  const transactionContext = opciones?.transaction || await sequelize.transaction();
  const resultado : I_OperaResult = await obtResultado(
    async (model, data, opciones? : { transaction?: Transaction }) => {
      const instance = await model.bulkCreate(data);
      return instance; 
    },
    model,  
    data,
    { transaction: transactionContext } 
  );
  const resData : any  = obtContadorReg (resultado.validationErrors);
  return {estatus : kCorrecto, data : resData, errorUs: null, errorNeg : resultado.validationErrors as string[] | null};
}

export async function bulkUpdateRecords(
  model: typeof Model,
  dataArray: any
): Promise<I_InfResponse> { 

  // Validación básica del arreglo de entrada
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw ('No existen datos a actualizar');
  }
  const sequelizeInstance: Sequelize = await getInstancia();
  let errorNegocio : string[]=[];
  let finalErrorNeg: string[] | null = null;
  return await sequelizeInstance.transaction(async (t: Transaction) => {
      for (const elemento of dataArray) {
       
              console.log('✅ Procesando elemento *', elemento);

      const resultado : I_InfResponse = await updateRecord(model, elemento, { transaction: t });
                    console.log('✅ Reg Actualizado ', resultado);
      if (resultado.errorNeg) {
       errorNegocio = [...errorNegocio, ...resultado.errorNeg]; 
      } 
      }
      if (errorNegocio) {
        finalErrorNeg = errorNegocio.length > 0 ? errorNegocio : null;
      }
      console.log('✅ Bulk Modify correcto');
      const resData : any  = obtContadorReg (errorNegocio, dataArray);
      console.log('✅ Retorno ', resData, finalErrorNeg);
      return {estatus: finalErrorNeg ? kErrorNeg : kCorrecto,
      data : resData, errorUs : null, errorNeg : finalErrorNeg };
  });
}

export async function obtResultado (
operacionCallback: (...args: any[]) => Promise<any>, 
    ...args: any[] 
): Promise<I_OperaResult> {
try {
  const kCorrecto = 1;
  const resultado = await operacionCallback(...args);
  return { estatus: kCorrecto, validationErrors: null }; 
} catch (error) {
  const errorNeg : I_OperaResult = armaErrorNeg(error);
  return errorNeg;
}

}

export function armaErrorNeg (error : any) : I_OperaResult {
  if (error instanceof ValidationError) {
    console.log('✅Error capturado por armaErrorNeg:', error);
    const kNegPrefix = '[N]:';
    const validationErrors : string[] = [];
    let soloNegocio = true;
    error.errors.forEach(err => {

    if (err.message && err.message.startsWith(kNegPrefix)) {
      console.log(`✅- Campo: ${err.path}, Mensaje: ${err.message}, Tipo: ${err.validatorKey}`);
      validationErrors.push(err.message.substring(kNegPrefix.length).trim());
      } else {
        soloNegocio = false;
      }
    });

    if(soloNegocio) {
      console.log('✅Solo errores de Negocio');
      return { estatus: kErrorNeg, validationErrors: validationErrors };
      } else {
      console.log('✅Errores de sistema');  
      throw error; // Prpagación del error para rutina principal de excepciones
      }
    
    }  else {
    throw error; // Prpagación del error para rutina principal de excepciones
    }
}
// [{contador : contador}]
export function obtContadorReg (valError : string[] | null | undefined, data? : any) : Record<string, number>[] | null {
  let resData : Record<string, number>[] | null;
  if (data) {
    console.log('✅ Entre a dada lenght', data);
    resData = [{contador : data.length}];
  } else
    resData = [{contador : 1}];;

  if (valError) {
    if (valError.length > 0) {
      resData = null;
    }
  }
  return resData;
}

