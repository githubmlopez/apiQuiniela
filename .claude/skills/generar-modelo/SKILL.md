---
name: generar-modelo
description: Genera o actualiza un modelo Sequelize de lib_comun a partir de specs/<CARPETA>/<TABLA>.json (definición de la tabla) y specs/<CARPETA>/<TABLA>.csv (hooks de validación, defaults y campos no editables). Escribe <TABLA>.gen.ts (siempre se sobrescribe) y crea <TABLA>.manual.ts solo si no existe. Usar cuando el usuario pida crear o actualizar el esquema, los hooks o las validaciones de un modelo, o invoque /generar-modelo <CARPETA>/<TABLA>.
---

# Generar modelo

Argumento: `<CARPETA>/<TABLA>` (ej. `ADCONDOM/CI_CUENTA_X_PAGAR`).

| Entrada | Genera |
|---|---|
| `specs/<CARPETA>/<TABLA>.json` | La definición (`sequelize.define`) — pasos 1 a 6 |
| `specs/<CARPETA>/<TABLA>.csv` | Los hooks `beforeValidate` y `beforeUpdate` — pasos 7 a 13 |

Salida, en `src/api/Modelos/Modelo/<CARPETA>/`:

| Archivo | Quién lo escribe | Al regenerar |
|---|---|---|
| `<TABLA>.gen.ts` | El skill | Se **sobrescribe completo**. Nunca se edita a mano. |
| `<TABLA>.manual.ts` | El usuario | **Nunca se toca.** El skill solo lo crea si no existe (paso 9). |

El JSON es obligatorio (detente y pídelo si no existe). El CSV es opcional (paso 6).

---------------------------------------------------------------------------------------------------------

# Parte A. Definición del modelo (JSON)

El modelo solo se usa para insert, update y delete. Del JSON únicamente importan las columnas,
la llave primaria y los índices únicos. **No** se generan relaciones (`belongsTo`, `hasMany`,
`references`) ni índices no únicos.

## 1. Formato del JSON

```json
{
  "table_name": "CI_CUENTA_X_PAGAR",
  "schema": "dbo",
  "hasTriggers": false,
  "columns": [
    { "name": "CVE_EMPRESA", "data_type": "varchar(4)", "is_nullable": false }
  ],
  "foreign_keys": [ ... ],
  "indexes": [
    {
      "index_name": "PK_CI_CUENTA_X_PAGAR",
      "is_unique": true,
      "is_primary_key": true,
      "columns": [ { "value": "CVE_EMPRESA" }, { "value": "UUID" } ]
    }
  ]
}
```

- `default_value` en una columna (p. ej. `"('SP')"`, el DEFAULT de la BD): no se genera en Sequelize; el valor en
  inserción lo da el `DEFAULT` del CSV. Si la columna no acepta nulos, trae `default_value` y el CSV no tiene
  `DEFAULT`, avisa: la validación `isNotNull` rechazaría la inserción antes de que la BD aplique su default.
- `foreign_keys`: se ignora.
- Índices con `is_unique: false`: se ignoran.
- El usuario exporta el JSON desde el schema en una sola línea. Si viene así, dale formato
  (una columna por línea, alineado) sin cambiar el contenido, y verifica que siga siendo el mismo JSON.

## 2. Conversión de tipos (`data_type` → Sequelize)

| `data_type` en SQL Server | Línea `type:` generada |
|---|---|
| `varchar(n)`, `nvarchar(n)`, `char(n)`, `nchar(n)` | `DataTypes.STRING (n),` |
| `varchar(max)`, `nvarchar(max)`, `text` | `DataTypes.TEXT  ,` |
| `int`, `smallint`, `tinyint` | `DataTypes.INTEGER  ,` |
| `bigint` | `DataTypes.BIGINT  ,` |
| `numeric(p,s)`, `decimal(p,s)` | `DataTypes.DECIMAL (p, s),` |
| `date` | `DataTypes.DATEONLY  ,` |
| `datetime`, `datetime2`, `smalldatetime` | `DataTypes.DATE  ,` |
| `bit` | `DataTypes.BOOLEAN  ,` |

Respeta el espaciado exacto de la tabla (espacio antes del paréntesis; dos espacios antes de la coma
cuando no hay paréntesis). Si aparece un tipo que no está en la tabla, **pregunta** al usuario cómo
mapearlo antes de generar.

## 3. Reglas por columna

Una entrada por columna, en el orden del JSON:

- `allowNull` = `is_nullable`.
- `primaryKey: true` si la columna está en el índice con `is_primary_key: true`.
- `unique: true,` si la columna es la **única** columna de un índice con `is_unique: true`
  que no es la PK. (Los índices únicos de varias columnas solo van en `indexes`.)

## 4. Plantilla de la definición

Reproduce exactamente este formato (indentación de 3 espacios, comas incluidas):

```ts
// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize'

export async function def_<TABLA>(sequelize: any) {
   // La constante se define porque es necesaria en HOOKS
   const <TABLA> = sequelize.define(
   '<TABLA>',
   {
      COLUMNA_PK : {
         type: DataTypes.STRING (4),
         allowNull: false,
         primaryKey: true
      },
      COLUMNA_UNICA : {
         type: DataTypes.INTEGER  ,
         allowNull: false,
         unique: true,
      },
      COLUMNA_NORMAL : {
         type: DataTypes.DATEONLY  ,
         allowNull: true,
      },
   },
   {
      modelName: '<TABLA>',
      tableName: '<TABLA>',
      schema: '<schema>',
      timestamps: false,
      hasTrigger: false,  // OPCIÓN DE SEQUELIZE: tabla con triggers (INSERT/UPDATE con OUTPUT ... INTO @tmp)
      llavesCalculadas: ['COLUMNA_PK'],  // PROPIEDAD PERSONALIZADA : partes de la PK que asigna el back
      indexes: [ {
         name : '<PK index_name>',
         unique : true,
         fields : [
                'COLUMNA_PK',
         ]
      },
      {
         name : '<index_name único>',
         unique : true,
         fields : [
                'COLUMNA_UNICA',
         ]
      }
      ]
   }
   );

// ----------------------------------------------
```

- `indexes`: primero la PK y después los índices únicos, en el orden del JSON, con su `index_name` real.
- `hasTrigger` (opción nativa de Sequelize, en singular): se toma del atributo `hasTriggers` del JSON (así lo
  exporta el usuario). Con `true`, Sequelize hace los INSERT/UPDATE con `OUTPUT ... INTO @tmp`, que SQL Server
  permite en tablas con triggers. Si el JSON no lo trae: si el `.gen.ts` ya existe, conserva su valor; si es nuevo,
  `false`. En ambos casos avisa que falta en el JSON. **No** generes la propiedad antigua `hasTriggers` (en plural):
  se retiró junto con el parche de `obtResultado` (2026-10-07).
- `llavesCalculadas`: columnas de la **PK** que asigna el back y que, por lo tanto, pueden faltar en el alta.
  Una columna de la PK entra si en el CSV tiene `DEFAULT` (cualquier valor o token) o `MANUAL = SI`; columnas que no
  son de la PK nunca entran. En el orden del JSON; si ninguna califica, `llavesCalculadas: [],`. Sin CSV, `[]`.
  `createRecord` la usa así: con la PK completa busca duplicados; si falta una parte calculada, omite la búsqueda
  (el hook la asigna); si falta una parte no calculada, responde `Falta la llave primaria: <COLUMNA>`.
  Los modelos que no declaran la propiedad (anteriores al generador) exigen la PK completa en el alta.

## 5. Escribir y registrar

**Antes de escribir**, si el `.gen.ts` ya existe, compara con lo que vas a generar y muéstrale al usuario
las diferencias (columnas agregadas/eliminadas, tipos, nulos, PK, índices, reglas, DEFAULT, noEditables).
Si no hay diferencias, dilo y no escribas.

**Modelo antiguo de un solo archivo:** si existe `<TABLA>.ts` (sin `.gen`), es la estructura anterior.
Avisa al usuario y, con su visto bueno, migra:
1. Pasa el contenido de cada zona `// >>> MANUAL <CAMPO>` … `// <<< MANUAL <CAMPO>` a la función
   `asignar.<CAMPO>` del `.manual.ts`. Hooks escritos a mano que no encajen: muéstralos y pregunta.
2. Borra `<TABLA>.ts` y cambia en `index.ts` `'./<TABLA>.js'` por `'./<TABLA>.gen.js'`.

**Registro (modelo nuevo):**
1. `src/api/Modelos/Modelo/<CARPETA>/index.ts`: agrega `export * from './<TABLA>.gen.js';`.
   El `.manual.ts` **no** se exporta.
2. `src/api/Util/cargaModelos.ts`: agrega `def_<TABLA>` al destructuring y `await def_<TABLA>(sequelize);`
   en la función de la carpeta (`COMUN` → `cargarModelosComunes`, `NFLQUIN` → `cargarModelosQuiniela`,
   `ADCONDOM` → `cargarModelosCondom`). Si la carpeta no está en la lista, pregunta.

## 6. Sin CSV

Si no existe `specs/<CARPETA>/<TABLA>.csv`, el `.gen.ts` lleva solo el encabezado (paso 13), la definición y
`return <TABLA>; }`, sin hooks, sin contrato y sin importar el `.manual.ts` (que no se crea).
Si el `.gen.ts` existente sí tenía hooks, el CSV desapareció: avisa y pregunta antes de escribir.

---------------------------------------------------------------------------------------------------------

# Parte B. Hooks (CSV)

## 7. Formato del CSV

Lo edita el usuario en Excel ("CSV UTF-8"). Una fila por columna de la tabla:

```csv
CAMPO,LABEL,MANUAL,VALIDACIONES,DEFAULT,EDITABLE
IMP_IVA,Imp Iva,NO,"isNonNegative|compareField(<=, IMP_BRUTO)",,SI
```

| Columna | Significado | Vacío |
|---|---|---|
| `CAMPO` | Nombre de la columna; debe existir en el JSON | — (fila inválida) |
| `LABEL` | Nombre para los mensajes de error | El nombre del campo |
| `MANUAL` | `SI`: el valor lo asigna una función del `.manual.ts` (paso 9) | `NO` |
| `VALIDACIONES` | Reglas extra con métodos de `validadores.ts` (paso 10) | Ninguna |
| `DEFAULT` | Valor que toma en la **inserción** si viene nulo (paso 9) | No se asigna |
| `EDITABLE` | `NO`: no se puede cambiar después de insertado (paso 11) | `SI` |

Al leerlo:
- Tolera el BOM al inicio y detecta el delimitador (`,` o `;`) en el encabezado. Los campos pueden venir entre comillas.
- Recorta espacios en encabezados y valores (`"Cve Chequera "` → `Cve Chequera`).
- `SI`/`NO` sin importar mayúsculas.
- Un CAMPO que no exista en el JSON es un error: repórtalo y omite la fila.
- Una columna del JSON que no esté en el CSV se trata como fila vacía (solo validaciones de tipo).

## 8. Validaciones automáticas (siempre)

Para cada columna, en este orden:

1. `validators.isNotNull` si la columna **no** acepta nulos (`is_nullable: false`).
2. La validación de su tipo:

| `data_type` | Validación |
|---|---|
| `varchar(n)` y similares | `length(v, 1, n)` si no acepta nulos; `length(v, 0, n)` si los acepta |
| `varchar(max)`, `text` | ninguna |
| `int` / `smallint` / `tinyint` / `bigint` | `isIntType(v, 'int' \| 'smallint' \| 'tinyint' \| 'bigint')` |
| `numeric(p,s)` con s > 0 | `isDecimalScale(v, p, s)` |
| `numeric(p,0)` | `integerLength(v, p)` |
| `date` | `isDateFormat(v)` |
| `datetime`, `datetime2`, `smalldatetime` | `isDateTime(v)` |
| `bit` | `isBoolean(v)` |

3. Las `VALIDACIONES` del CSV, en el orden escrito.

Se encadenan con `||` (se detiene en el primer error del campo).

Todos los validadores salvo `isNotNull` regresan `null` (válido) cuando el valor está vacío: un campo que acepta
nulos puede quedar nulo aunque tenga validaciones. Para volverlo obligatorio, el usuario escribe `isNotNull` en VALIDACIONES.
Si la columna ya es `is_nullable: false`, un `isNotNull` en VALIDACIONES sobra: repórtalo y no lo dupliques.

## 9. Asignación de valores: DEFAULT y MANUAL

Va al **inicio** de `beforeValidate`, dentro de `if (instance.isNewRecord)`, para que los valores asignados
también pasen por las validaciones (Sequelize valida `allowNull` antes de `beforeCreate`).

Condición de "viene nulo":
- Numéricos (`int`, `numeric`, `bit`…): `instance.X == null` (un `0` no se reemplaza).
- Texto y fechas: `!instance.X` (también `''`).

| DEFAULT | Código |
|---|---|
| Literal numérico (`0`, `1`) en columna numérica | `instance.X = 0` |
| Literal de texto (`CXP`, `P`) | `instance.X = 'CXP'` |
| `HOY` | `new Date().toLocaleDateString('en-CA')` (YYYY-MM-DD local) |
| `AHORA` | `new Date()` |
| `UUID` | `randomUUID()` |
| `ANIOMES(CAMPO)` | `aAnioMes(instance.CAMPO)` — ver abajo |

Orden dentro del bloque:
1. DEFAULT simples (literal, `HOY`, `AHORA`, `UUID`), en el orden del JSON.
2. DEFAULT que dependen de otro campo (`ANIOMES(...)`), para que el campo origen ya tenga su default.
3. Campos MANUAL, en el orden del JSON: `await manual.asignar.<CAMPO>(instance, options);`

`ANIOMES` usa esta función, que se genera una sola vez (a nivel módulo, paso 13) cuando algún DEFAULT la necesita.
Si el campo origen viene vacío o no es una fecha válida, regresa `null` y el campo queda nulo (si es obligatorio,
`isNotNull` lo reporta):

```ts
// Año-mes YYYYMM de una fecha (YYYY-MM-DD o Date); null si no es una fecha válida
const aAnioMes = (f: any): string | null => {
  if (!f || validators.isDateFormat(f, '') !== null) return null;
  const s = f instanceof Date ? f.toLocaleDateString('en-CA') : String(f);
  return s.slice(0, 4) + s.slice(5, 7);
};
```

Si un campo MANUAL también tiene DEFAULT, se genera el DEFAULT y después la llamada manual (que puede
sobrescribirlo); avisa que probablemente sobra una de las dos.

DEFAULT no reconocido (ni literal ni token de la tabla): pregunta antes de generar.

### Contrato con el `.manual.ts`

El `.gen.ts` declara y exporta el contrato; los campos salen de las filas con `MANUAL = SI`
(si no hay ninguna, el tipo es `never` y `asignar` queda `{}`):

```ts
// --- Contrato con <TABLA>.manual.ts ---
// Una función por cada campo con MANUAL=SI en el CSV
export type CamposManuales<TABLA> = 'CAMPO_A' | 'CAMPO_B';

export interface Manual<TABLA> {
  /** Solo en inserción: después de los DEFAULT y antes de validar. */
  asignar: Record<CamposManuales<TABLA>, (instance: any, options: any) => void | Promise<void>>;
  /** Solo en actualización: sobre el registro real, después de revisar los no editables y antes de validar. */
  alActualizar?: (instance: any, options: any) => void | Promise<void>;
  /** Reglas adicionales; se ejecutan después de las generadas. */
  reglas?: ValidationRule[];
  /** Antes de una eliminación física: recibe la llave (where) y regresa los errores [N] que la impiden. */
  validarEliminacion?: (llave: Record<string, any>, options: any) =>
    { campo: string; mensaje: string }[] | Promise<{ campo: string; mensaje: string }[]>;
}
```

`validarEliminacion` es opcional. El `.gen.ts` **siempre** genera el hook que la llama (después de `beforeUpdate`):

```ts
// ============================================
// 🧩 Hook BEFORE BULK DESTROY para <TABLA>
// ============================================
// Model.destroy({ where }) (deleteRecord) no ejecuta beforeDestroy: options.where trae la llave.
<TABLA>.addHook('beforeBulkDestroy', async (options: any) => {
  if (!manual.validarEliminacion) return;
  const errores = await manual.validarEliminacion(options.where, options);
  if (errores.length > 0) {
    throw construirErroresValidacion(errores, options.where);
  }
});
```

Sirve para el patrón de eliminación de cada tabla: sin la función, eliminación libre; con una función que siempre
regresa error, tabla no eliminable; con una consulta (p. ej. al padre con
`options.model.sequelize.models.<PADRE>.findOne({ …, transaction: options.transaction })`), eliminación condicionada.
Los mensajes llevan `[N]:` y `deleteRecord` los regresa en `errorNeg`.

Las reglas de `reglas` admiten `siempre: true` (motor de validación): se evalúan en toda modificación aunque no
cambie ningún campo. Úsalo para reglas de estado del registro (p. ej. "cancelado no se modifica"), con
`if (inst.isNewRecord) return null;` si no aplican al alta.

`alActualizar` es opcional (el generador no la exige): sirve para ajustar campos cuando cambian otros
(ej. mantener `CVE_OPER_ASIG` igual a `CVE_OPERACION`). Recibe el registro real, así que puede usar
`instance.changed('X')` e `instance.previous('X')`, y lo que asigne se guarda aunque el cliente no lo haya enviado.

Así, si el CSV agrega o quita un campo MANUAL, `tsc` falla hasta que el `.manual.ts` se ajuste.
En ese caso **no edites el `.manual.ts`**: reporta el error y dile al usuario qué función agregar o quitar
(si lo pide explícitamente, puedes agregar la función con un `// TODO`).

Si el `.manual.ts` no existe, créalo con esta plantilla (una entrada por campo MANUAL):

```ts
// ==================================================================
// Lógica manual de <TABLA>.
// Este archivo NO se regenera: el generador solo lo crea si no existe.
// El tipo Manual<TABLA> (en <TABLA>.gen.ts) exige
// una función en `asignar` por cada campo con MANUAL=SI en
// specs/<CARPETA>/<TABLA>.csv; si falta o sobra una, no compila.
// ==================================================================
import type { Manual<TABLA> } from './<TABLA>.gen.js';

export const manual: Manual<TABLA> = {

  // Solo en inserción: se ejecutan después de los DEFAULT y antes de validar.
  // options.transaction trae la transacción de la operación.
  asignar: {
    CAMPO_A: async (instance, options) => {
      // TODO: asignar CAMPO_A
    },
  },

  // Solo en actualización (opcional), sobre el registro real.
  // alActualizar: (instance, options) => { ... },

  // Reglas de negocio adicionales; se ejecutan después de las generadas.
  reglas: [],
};
```

## 10. VALIDACIONES del CSV

Formato: `metodo(parámetros)` separados por `|`. Recorta espacios y comas sueltas alrededor de cada `|`.

El usuario escribe **solo los parámetros propios** del método. El skill agrega el valor al inicio y
`campo, label` al final: `metodo(p1, p2)` → `validators.metodo(inst.CAMPO, p1, p2, campo, label)`.

| Escrito | Generado |
|---|---|
| `isPositive` | `validators.isPositive(inst.X, campo, label)` |
| `length(36, 36)` | `validators.length(inst.X, 36, 36, campo, label)` |
| `oneOf(T, E, C)` o `oneOf('T','E','C')` | `validators.oneOf(inst.X, ['T', 'E', 'C'], campo, label)` (quita comillas; valores como texto) |
| `isIntType(int)` | `validators.isIntType(inst.X, 'int', campo, label)` |
| `isDateRange(2020-01-01, HOY)` | `validators.isDateRange(inst.X, '2020-01-01', () => new Date(), campo, label)`; parámetro vacío → `null` |
| `compareField(<=, OTRO)` | `validators.compareField(inst.X, '<=', inst.OTRO, campo, label, '<LABEL de OTRO>')` y `dependencias: ['OTRO']` |

Parámetros: los números van como número; lo demás, como texto entre comillas.

Errores que se reportan antes de generar:
- Método que no existe en el objeto `validators` de `src/api/Util/validadores.ts`.
- `compareField` cuyo segundo parámetro no es una columna de la tabla (ej. `compareField(>, 0)`).
- `compareField` entre un número y una fecha (nunca fallaría).

Si un método nuevo cumple la firma `(valor, ...parámetros, campo, label)`, se usa igual sin cambiar el skill.
Nunca escribas lógica de validación inline en `exec`: siempre llama un método de `validators`.
Las reglas de negocio que no se expresan con un validador genérico van en `manual.reglas`, no aquí.

## 11. Inserción vs. actualización (cómo valida Sequelize) y EDITABLE

`updateRecord` usa `Model.update(data, { where, individualHooks: true })`. En ese camino Sequelize:
1. Ejecuta `beforeValidate` sobre una instancia **construida solo con los datos enviados**, con
   `isNewRecord = true` y `options.type = 'BULKUPDATE'`. Lo que el hook asigne ahí se descarta.
2. Después carga el registro real y ejecuta `beforeUpdate` sobre él, con los cambios aplicados:
   `changed()` compara contra la BD y lo que el hook asigne se guarda.

Por eso el `.gen.ts` siempre separa:
- **`beforeValidate`**: `const esUpdateParcial = options.type === 'BULKUPDATE';`
  - Asignación de valores solo si `instance.isNewRecord && !esUpdateParcial`. Sin esta condición, cada update
    ejecutaría DEFAULT y `manual.asignar` (por ejemplo, consumiría un folio).
  - Validaciones: en un update parcial, con `{ ...options, validateOnlyChanged: true, sinDependencias: true }`
    (solo los campos enviados; así un `null` en un campo obligatorio da error `[N]:` y no de sistema).
- **`beforeUpdate`** (se genera siempre que haya CSV), en este orden:
  1. `noEditables`: antes del paso 2, para que los ajustes de `alActualizar` no se marquen como "no se puede modificar".
  2. `await manual.alActualizar?.(instance, options);`
  3. Validaciones con `{ ...options, validateOnlyChanged: true }`: lo que cambió y sus dependencias,
     contra el registro real.

EDITABLE:
- Lista `noEditables` con cada campo `EDITABLE = NO`, en el orden del JSON, con su LABEL.
- Las columnas de la PK **siempre** van en la lista, aunque el CSV diga `SI` (repórtalo).
- Si la lista queda vacía, no se genera la constante ni el paso 1 de `beforeUpdate`.
- `EDITABLE = NO` bloquea cualquier update hecho con Sequelize. Los campos que actualiza un proceso deben
  hacerlo con un SP o SQL directo (no pasan por los hooks).

## 12. Revisión de contradicciones

Antes de escribir, revisa y reporta (no las corrijas por tu cuenta):
- DEFAULT que no pasaría sus propias validaciones (`0` con `isPositive`, valor fuera del `oneOf`, más largo que la columna).
- Columna que no acepta nulos, sin DEFAULT ni MANUAL: será obligatoria en cada inserción (solo informativo).
- `ANIOMES(CAMPO)` con un campo origen que puede venir nulo y sin `isNotNull`.

## 13. Estructura completa del `.gen.ts`

Las reglas, `aAnioMes` y `noEditables` van a **nivel módulo** (después de la función `def_`), no dentro de
los hooks: se crean una sola vez al cargar el módulo y no en cada validación.

```ts
// ==================================================================
// ARCHIVO GENERADO — NO EDITAR: se sobrescribe completo al regenerar.
// Fuente:   specs/<CARPETA>/<TABLA>.json (definición)
//           specs/<CARPETA>/<TABLA>.csv  (hooks)
// Generar:  /generar-modelo <CARPETA>/<TABLA>
// Lógica manual: <TABLA>.manual.ts
// ==================================================================
import {construirErroresValidacion} from
'@router/index.js';
import {validators, runValidationEngine } from
  '@util/index.js';
import type {ValidationRule} from
  '@util/index.js';
import { randomUUID } from 'node:crypto';          // solo si se usa UUID
import { manual } from './<TABLA>.manual.js';

// --- Contrato con <TABLA>.manual.ts ---              // paso 9
...

// --- Codigo generado de manera automatica -----       // pasos 1 a 4
import { DataTypes } from 'sequelize'

export async function def_<TABLA>(sequelize: any) {
   const <TABLA> = sequelize.define( ... );

// ----------------------------------------------

// ============================================
// 🧩 Hook BEFORE VALIDATE para <TABLA>
// ============================================
<TABLA>.addHook('beforeValidate', async (instance: any, options: any) => {

  // En Model.update (updateRecord) Sequelize valida una instancia construida solo con los
  // datos enviados (con isNewRecord = true): no es inserción y solo se validan esos campos.
  // La validación completa del update se hace en beforeUpdate, con el registro real.
  const esUpdateParcial = options.type === 'BULKUPDATE';

  // --- 1) Asignación de valores (solo en inserción) ---
  if (instance.isNewRecord && !esUpdateParcial) { ... } // paso 9 (DEFAULT → ANIOMES → manual.asignar)

  // --- 2) Validaciones: generadas + manuales ---
  await runValidationEngine(instance, reglas, construirErroresValidacion,
    esUpdateParcial ? { ...options, validateOnlyChanged: true, sinDependencias: true } : options);

});

// ============================================
// 🧩 Hook BEFORE UPDATE para <TABLA>
// ============================================
// instance es el registro de la BD con los cambios aplicados: changed() compara contra la BD.
// Requiere individualHooks: true en Model.update (updateRecord lo envía).
<TABLA>.addHook('beforeUpdate', async (instance: any, options: any) => {
  // --- 1) Campos no editables (antes de alActualizar, para no marcar sus propios ajustes) ---
  ... noEditables → throw construirErroresValidacion ...   // paso 11 (omitir si no hay noEditables)
  // --- 2) Ajustes manuales (<TABLA>.manual.ts) ---
  await manual.alActualizar?.(instance, options);
  // --- 3) Validaciones de lo que cambió, incluidas sus dependencias ---
  await runValidationEngine(instance, reglas, construirErroresValidacion,
    { ...options, validateOnlyChanged: true });
});

   return <TABLA>;
}

// ============================================
// Definiciones usadas por los hooks (se crean una sola vez al cargar el módulo)
// ============================================
const aAnioMes = ...                                    // solo si se usa ANIOMES

// Validaciones: obligatorio → tipo → VALIDACIONES del CSV
const reglasGeneradas: ValidationRule[] = [
  // N. CAMPO: Obligatorio|Opcional, <data_type>
  { campo, label, exec, dependencias? },
];

// Reglas que ejecuta el motor: generadas + las del archivo manual
const reglas: ValidationRule[] = [...reglasGeneradas, ...(manual.reglas ?? [])];

// Campos que no se pueden modificar una vez creado el registro (EDITABLE=NO y PK)
const noEditables = [ { campo, label }, ... ];
```

El `.manual.ts` solo importa **tipos** del `.gen.ts` (`import type`), así no hay dependencia circular en ejecución.

## 14. Verificar y reportar

Ejecuta `npx tsc --noEmit -p .` desde la raíz de lib_comun y corrige hasta que compile
(salvo errores del `.manual.ts` por cambio de campos MANUAL: esos se reportan, paso 9).

Reporte breve:
- Archivos creados o modificados y diferencias respecto a la generación anterior.
- Contradicciones y avisos del paso 12.
- Si el `.manual.ts` se creó, o qué funciones le faltan o le sobran.
- Cambios de comportamiento respecto a los hooks anteriores, si los había.
