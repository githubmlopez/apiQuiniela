    // validadores.ts
    export const validators = {

    getDisplayName: (field: string, label?: string) => label || field,

    // 0. Validar que no sea nulo, indefinido o cadena vacía
    isNotNull: (value: any, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return { campo: field, mensaje: `[N]: El campo ${name} es obligatorio` };
        }
        return null;
    },   
    // 1. Para listas cerradas (como tu TIPO_CLIENTE)
    oneOf: (value: any, options: any[], field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value && !options.includes(value)) {
        return { campo: field, mensaje: `[N]: ${name} debe ser uno de: ${options.join(', ')}` };
        }
        return null;
    },

    // 2. Para números (reemplaza lógica manual de parseFloat)
    isNumericRange: (value: any, min: number, max: number, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        const num = parseFloat(value);
        if (value != null && (isNaN(num) || num < min || num > max)) {
        return { campo: field, mensaje: `[N]: ${name} debe ser un número entre ${min} y ${max}` };
        }
        return null;
    },

    // 3. Para formatos muy específicos (Aquí sí usas Regex, pero una sola vez)
    isDateFormat: (value: any, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (value && !regex.test(value)) {
        return { campo: field, mensaje: `[N]: ${name} debe tener formato YYYY-MM-DD` };
        }
        return null;
    },

    // 4. Para tipos de datos básicos
    isBoolean: (value: any, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value !== undefined && value !== null && typeof value !== 'boolean') {
        return { campo: field, mensaje: `[N]: ${name} debe ser true o false` };
        }
        return null;
    },

    // 4. Longitud de cadenas (Strings)  
    length: (value: any, min: number, max: number, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value == null) return null;
        const str = String(value);
        if (str.length < min || str.length > max) {
        return { campo: field, mensaje: `[N]: ${name} debe tener entre ${min} y ${max} caracteres` };
        }
        return null;
    },

    // 5. Longitud de números enteros (Dígitos)
    // Ejemplo: que un código de área no pase de 3 dígitos
    integerLength: (value: any, maxDigits: number, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value == null) return null;
        const digits = Math.abs(parseInt(value)).toString().length;
        if (digits > maxDigits) {
        return { campo: field, mensaje: `[N]: ${name} no puede tener más de ${maxDigits} dígitos` };
        }
        return null;
    },

    // 6. Precisión de decimales (Dígitos totales y decimales)
    // Ejemplo: DECIMAL(10,2) -> total: 10, scale: 2
    isDecimalScale: (value: any, total: number, scale: number, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value == null) return null;
        const str = String(value);
        if (!/^-?\d+(\.\d+)?$/.test(str)) return { campo: field, mensaje: `[N]: ${name} debe ser un número` };

        const [integers, decimals] = str.split('.');
        const integerCount = integers.replace('-', '').length;
        const decimalCount = decimals ? decimals.length : 0;

        if (integerCount + decimalCount > total || decimalCount > scale) {
        return { 
            campo: field, 
            mensaje: `[N]: ${name} excede el formato permitido (Máx: ${total} dígitos, ${scale} decimales)` 
        };
        }
        return null;
    },  

    // 7. Validar si es estrictamente numérico (evita NaN y acepta números en string)
    isNumeric: (value: any, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value == null || value === '') return null; // No valida nulidad (usar isNotNull para eso)
        const regex = /^-?\d+(\.\d+)?$/;
        if (!regex.test(String(value))) {
        return { campo: field, mensaje: `[N]: ${name} debe ser un valor numérico` };
        }
        return null;
    },

    // 8. Validar si es estrictamente texto (opcional, por si quieres evitar números en nombres)
    isAlpha: (value: any, field: string, label?: string) => {
        const name = validators.getDisplayName(field, label);
        if (value == null || value === '') return null;
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regex.test(String(value))) {
        return { campo: field, mensaje: `[N]: ${name} solo debe contener letras` };
        }
        return null;
    },

    // 9. Validar formato de Correo Electrónico
    isEmail: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (value == null || value === '') return null; // No valida obligatoriedad aquí
    
    // Regex estándar para validación de emails
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!regex.test(String(value))) {
      return { 
        campo: field, 
        mensaje: `[N]: ${name} debe ser un correo electrónico válido (ejemplo@dominio.com)` 
      };
    }
    return null;
  },
    };

