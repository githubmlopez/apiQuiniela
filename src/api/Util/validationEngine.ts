// validationEngine.ts

interface ValidationRule {
  campo: string;
  label: string;
  // Permitimos que valide el campo solo o que reciba la instancia completa para casos complejos
  exec: (instance: any, campo: string, label: string) => { campo: string; mensaje: string } | null;
  dependencias?: string[]; // Campos extra que, si cambian, disparan esta validación
}

export const runValidationEngine = async (
  instance: any, 
  rules: ValidationRule[], 
  construirErroresValidacion: Function,
  options: any = {} // <--- Recibimos las opciones del Hook aquí
) => {
  const errores: { campo: string; mensaje: string }[] = [];
  const changedFields = instance.changed() || [];
  
  // 1. LA LÍNEA NUEVA: 
  // Ahora el motor no adivina. Si en el .update() mandaste esta bandera, 
  // el motor sabe que es un Update. Si no, asume que es Inserción.
  const soloCambios = options.validateOnlyChanged === true;

  console.log(`--- [MOTOR] ---`);
  console.log(`Modo: ${soloCambios ? 'ACTUALIZACIÓN (Parcial)' : 'INSERCIÓN (Total)'}`);
  console.log(`Campos detectados como cambiados:`, changedFields);

  const shouldValidate = (rule: ValidationRule) => {
    // MODO INSERCIÓN: Validamos todo (incluyendo el NOMBRE que no viene en el JSON)
    if (!soloCambios) return true;

    // MODO ACTUALIZACIÓN: Solo validamos lo enviado en el JSON
    const campoCambio = changedFields.includes(rule.campo);
    const dependenciaCambio = rule.dependencias?.some(dep => changedFields.includes(dep)) ?? false;
    
    return campoCambio || dependenciaCambio;
  };

  // 2. Ejecución del ciclo de reglas
  for (const rule of rules) {
    if (shouldValidate(rule)) {
      const error = rule.exec(instance, rule.campo, rule.label);
      if (error) {
        errores.push(error);
      }
    }
  }

  // 3. Lanzar errores si existen
  if (errores.length > 0) {
    throw construirErroresValidacion(errores, instance);
  }
};

/* Propuesta de sustitución AI 21/09/2026E
// validationEngine.ts

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

export interface ValidationRule {
  -- Nombre del atributo en el modelo (ej: 'NOMBRE', 'SIT_USUARIO') 
  campo: string;
  label: string;
  -- Devuelve { campo, mensaje } si falla, o null si la validación es exitosa 
  exec: (instance: any, campo: string, label: string) => ErrorValidacion | null;
  -- Otros campos que, si participan en la operación, disparan esta regla también 
  dependencias?: string[];
}

const DEBUG = process.env.VALIDATION_DEBUG === 'true';

export const runValidationEngine = async (
  instance: any,
  rules: ValidationRule[],
  // Ajusta el tipo a la firma real de tu función
  construirErroresValidacion: (errores: ErrorValidacion[], instance: any) => unknown,
  options: any = {}
): Promise<void> => {
  // Sequelize v6 calcula skip a partir de options.fields:
  //  - create / save de registro nuevo: skip = []            -> se valida todo
  //  - update / save de registro existente: skip = no cambiados
  //  - Model.update estático: skip = campos ausentes de los valores enviados
  //  - instance.validate() directo: skip = []                -> se valida todo
  const skip: string[] = Array.isArray(options.skip) ? options.skip : [];
  const activo = (campo: string) => !skip.includes(campo);

  const shouldValidate = (rule: ValidationRule) =>
    activo(rule.campo) || (rule.dependencias?.some(activo) ?? false);

  const errores: ErrorValidacion[] = [];
  const ejecutadas: string[] = [];

  for (const rule of rules) {
    if (!shouldValidate(rule)) continue;
    ejecutadas.push(rule.campo);
    const error = rule.exec(instance, rule.campo, rule.label);
    if (error) errores.push(error);
  }

  if (DEBUG) {
    console.debug('[MOTOR]', instance.constructor?.name, {
      nuevo: instance.isNewRecord,
      reglasEjecutadas: ejecutadas,
      errores: errores.length,
    });
  }

  if (errores.length > 0) {
    throw construirErroresValidacion(errores, instance);
  }
};
*/
