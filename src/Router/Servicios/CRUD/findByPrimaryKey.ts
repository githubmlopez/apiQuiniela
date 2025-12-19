import { Model, Transaction} from 'sequelize';
import { I_Header} from '../../../Modelos/Interface/index.js';
import { userContext} from '../../../Middle/index.js'

export async function findOneByKeyService<M extends Model, T = Partial<M>>(
    model: typeof Model & (new () => M), 
    data: Partial<M>, 
    options?: { transaction?: Transaction }
): Promise<T | null> // <- ¡Promete devolver T (objeto plano) o null!
{
    const header   =  userContext.getStore() as I_Header;
    const whereClause = buildPKWhereClause(model, data);
    console.log('WHERE ** ' + JSON.stringify(whereClause));
    
    // Ejecutar findOne con raw: true para obtener el objeto plano T
    const resultado = await model.findOne({ 
        where: whereClause, 
        raw: true, // <-- DEBE ESTAR AQUÍ
        ...options 
    });

    console.log('✅ Resultado **', resultado);

    // Como usamos 'raw: true', el resultado ya es un objeto plano, 
    // lo aseguramos con la aserción 'as T | null'
    return resultado as T | null;
}

export function buildPKWhereClause<T extends object>(model: any, data: T): any {
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
