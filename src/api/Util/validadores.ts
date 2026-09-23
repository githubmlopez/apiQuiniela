const vacio = (v: any) => v === null || v === undefined || v === '';

// ---------- Enteros por tipo SQL ----------
type TipoInt = 'tinyint' | 'smallint' | 'int' | 'bigint';

const RANGOS_INT: Record<TipoInt, { min: bigint; max: bigint }> = {
  tinyint:  { min: BigInt(0),           max: BigInt(255) },
  smallint: { min: BigInt(-32768),      max: BigInt(32767) },
  int:      { min: BigInt(-2147483648), max: BigInt(2147483647) },
  bigint:   { min: BigInt('-9223372036854775808'), max: BigInt('9223372036854775807') },
};

// ---------- Fechas ----------
type FechaLimite = string | Date | null | undefined;
type LimiteFecha = FechaLimite | (() => FechaLimite); // función = se evalúa en cada validación (ej. () => new Date())

// YYYY-MM-DD  o  YYYY-MM-DD[ T]HH:mm[:ss[.f{1,7}]][Z|±HH:mm]
const RE_FECHA_HORA =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,7}))?)?(Z|[+-]\d{2}:\d{2})?)?$/;

/** Devuelve el timestamp (ms) o null si no es una fecha/hora real. */
const aTimestamp = (v: any, exigirHora = false): number | null => {
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v !== 'string') return null;

  const m = RE_FECHA_HORA.exec(v.trim());
  if (!m) return null;
  if (exigirHora && m[4] === undefined) return null;

  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const h = m[4] ? Number(m[4]) : 0;
  const mi = m[5] ? Number(m[5]) : 0;
  const s = m[6] ? Number(m[6]) : 0;
  if (h > 23 || mi > 59 || s > 59) return null;

  // Date.UTC trata los años 0-99 como 1900-1999; el chequeo de abajo los rechaza (irrelevante en la práctica)
  const base = Date.UTC(y, mo - 1, d, h, mi, s);
  const f = new Date(base);
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== mo - 1 || f.getUTCDate() !== d) return null;

  // JS solo maneja milisegundos: se truncan los decimales extra (datetime2 llega a 7)
  const ms = m[7] ? Number(m[7].padEnd(3, '0').slice(0, 3)) : 0;
  let t = base + ms;

  const off = m[8];
  if (off && off !== 'Z') {
    const signo = off[0] === '-' ? -1 : 1;
    const oh = Number(off.slice(1, 3)), om = Number(off.slice(4, 6));
    if (oh > 23 || om > 59) return null;
    t -= signo * (oh * 60 + om) * 60000;
  }
  return t;
};

const fmtFecha = (f: string | Date): string => {
  if (typeof f === 'string') return f;
  const iso = f.toISOString();
  return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso.replace('T', ' ').slice(0, 19);
};

const resolverLimite = (l: LimiteFecha | (() => FechaLimite)) => {
  const v = typeof l === 'function' ? l() : l;
  if (v === null || v === undefined) return null;
  const ts = aTimestamp(v);
  // Un límite inválido es error del programador, no del usuario: que falle fuerte
  if (ts === null) throw new Error(`Límite de fecha inválido en isDateRange: ${String(v)}`);
  return { ts, texto: fmtFecha(v) };
};

// ---------- Números ----------
const aNumero = (v: any): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) return Number(v.trim());
  return null;
};

export const validators = {

  getDisplayName: (field: string, label?: string) => label || field,

  // 0. No nulo, indefinido, cadena vacía ni NaN
  isNotNull: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'number' && Number.isNaN(value))
    ) {
      return { campo: field, mensaje: `[N]: El campo ${name} es obligatorio` };
    }
    return null;
  },

  // 1. Listas cerradas
  oneOf: (value: any, options: any[], field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    if (!options.includes(value)) {
      return { campo: field, mensaje: `[N]: ${name} debe ser uno de: ${options.join(', ')}` };
    }
    return null;
  },

  // 2. Rango numérico
  isNumericRange: (value: any, min: number, max: number, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    const invalido = { campo: field, mensaje: `[N]: ${name} debe ser un número entre ${min} y ${max}` };
    if (typeof value === 'string' && value.trim() === '') return invalido;
    if (typeof value !== 'number' && typeof value !== 'string') return invalido;
    const num = Number(value); // estricto: "12abc" -> NaN
    if (!Number.isFinite(num) || num < min || num > max) return invalido;
    return null;
  },

  // 3. Fecha YYYY-MM-DD (acepta también objetos Date válidos)
  isDateFormat: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    const invalido = { campo: field, mensaje: `[N]: ${name} debe tener formato YYYY-MM-DD` };

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? invalido : null;
    }

    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    if (!m) return invalido;

    // Verifica que la fecha exista (rechaza 2026-13-45 o 2026-02-30)
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const f = new Date(Date.UTC(y, mo - 1, d));
    const existe =
      f.getUTCFullYear() === y && f.getUTCMonth() === mo - 1 && f.getUTCDate() === d;
    return existe ? null : invalido;
  },

  // 4. Booleano estricto (la obligatoriedad se valida con isNotNull)
  isBoolean: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (value !== undefined && value !== null && typeof value !== 'boolean') {
      return { campo: field, mensaje: `[N]: ${name} debe ser true o false` };
    }
    return null;
  },

  // 5. Longitud de cadenas
  length: (value: any, min: number, max: number, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (value == null) return null;
    const str = String(value);
    if (str.length < min || str.length > max) {
      return { campo: field, mensaje: `[N]: ${name} debe tener entre ${min} y ${max} caracteres` };
    }
    return null;
  },

  // 6. Longitud de enteros (dígitos). Trabaja sobre el string para no perder precisión
  integerLength: (value: any, maxDigits: number, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    const str = String(value).trim();
    if (!/^-?\d+$/.test(str)) {
      return { campo: field, mensaje: `[N]: ${name} debe ser un número entero` };
    }
    const digits = str.replace('-', '').replace(/^0+(?=\d)/, '').length;
    if (digits > maxDigits) {
      return { campo: field, mensaje: `[N]: ${name} no puede tener más de ${maxDigits} dígitos` };
    }
    return null;
  },

  // 7. Precisión decimal: DECIMAL(total, scale)
  isDecimalScale: (value: any, total: number, scale: number, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    const str = String(value).trim();
    if (!/^-?\d+(\.\d+)?$/.test(str)) {
      return { campo: field, mensaje: `[N]: ${name} debe ser un número` };
    }

    const [entera, decimal = ''] = str.replace('-', '').split('.');
    const enteros = entera.replace(/^0+/, '').length; // "0.5" cuenta 0 enteros
    const decimales = decimal.length;

    if (enteros > total - scale || decimales > scale) {
      return {
        campo: field,
        mensaje: `[N]: ${name} excede el formato permitido (Máx: ${total} dígitos, ${scale} decimales)`
      };
    }
    return null;
  },

  // 8. Numérico estricto (acepta números en string, evita NaN)
  isNumeric: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    if (!/^-?\d+(\.\d+)?$/.test(String(value))) {
      return { campo: field, mensaje: `[N]: ${name} debe ser un valor numérico` };
    }
    return null;
  },

  // 9. Solo letras (acepta acentos, ü, ñ y separadores comunes en nombres)
  isAlpha: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    // Grupos de letras separados por un solo espacio, apóstrofo o guion
    const regex = /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u;
    if (!regex.test(String(value))) {
      return { campo: field, mensaje: `[N]: ${name} solo debe contener letras` };
    }
    return null;
  },

  // 10. Correo electrónico
  isEmail: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    const str = String(value);
    // Sin puntos al inicio/final/consecutivos en la parte local
    const regex =
      /^[a-zA-Z0-9%+_-]+(\.[a-zA-Z0-9%+_-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    if (str.length > 254 || !regex.test(str)) {
      return {
        campo: field,
        mensaje: `[N]: ${name} debe ser un correo electrónico válido (ejemplo@dominio.com)`
      };
    }
    return null;
  },

  // Nuevos métodos pendientes de ir validando 21/09/2026

  // Entero con el rango exacto del tipo SQL. Para bigint envía el valor como string
  // (un number fuera de ±9007199254740991 ya perdió precisión y se rechaza).
  isIntType: (value: any, tipo: TipoInt, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;

    const { min, max } = RANGOS_INT[tipo];
    const invalido = {
      campo: field,
      mensaje: `[N]: ${name} debe ser un entero entre ${min} y ${max}`
    };

    let str: string;
    if (typeof value === 'bigint') {
      str = value.toString();
    } else if (typeof value === 'number') {
      if (!Number.isSafeInteger(value)) return invalido;
      str = String(value);
    } else if (typeof value === 'string') {
      str = value.trim();
    } else {
      return invalido;
    }

    if (!/^-?\d+$/.test(str)) return invalido;
    const n = BigInt(str);
    return n < min || n > max ? invalido : null;
  },

  // datetime2: acepta Date válido o string 'YYYY-MM-DD HH:mm[:ss[.fffffff]]' (con 'T' y zona opcionales)
  isDateTime: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    if (aTimestamp(value, true) === null) {
      return {
        campo: field,
        mensaje: `[N]: ${name} debe tener formato YYYY-MM-DD HH:mm:ss[.fff]`
      };
    }
    return null;
  },

  // Rango de fechas (date o datetime2). min/max opcionales: null = sin límite.
  // Pueden ser string, Date o una función que los devuelva.
  isDateRange: (value: any, min: LimiteFecha | (() => FechaLimite), max: LimiteFecha | (() => FechaLimite), field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;

    const t = aTimestamp(value);
    if (t === null) {
      return { campo: field, mensaje: `[N]: ${name} debe ser una fecha válida (YYYY-MM-DD)` };
    }

    const lo = resolverLimite(min);
    const hi = resolverLimite(max);
    const fuera = (lo !== null && t < lo.ts) || (hi !== null && t > hi.ts);
    if (!fuera) return null;

    const mensaje =
      lo && hi ? `${name} debe estar entre ${lo.texto} y ${hi.texto}` :
      lo       ? `${name} debe ser igual o posterior a ${lo.texto}` :
                 `${name} debe ser igual o anterior a ${hi!.texto}`;
    return { campo: field, mensaje: `[N]: ${mensaje}` };
  },

  // Mayor que cero
  isPositive: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    const n = aNumero(value);
    if (n === null) return { campo: field, mensaje: `[N]: ${name} debe ser un valor numérico` };
    if (n <= 0) return { campo: field, mensaje: `[N]: ${name} debe ser mayor que cero` };
    return null;
  },

  // Cero o mayor
  isNonNegative: (value: any, field: string, label?: string) => {
    const name = validators.getDisplayName(field, label);
    if (vacio(value)) return null;
    const n = aNumero(value);
    if (n === null) return { campo: field, mensaje: `[N]: ${name} debe ser un valor numérico` };
    if (n < 0) return { campo: field, mensaje: `[N]: ${name} no puede ser negativo` };
    return null;
  },

};

