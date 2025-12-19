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