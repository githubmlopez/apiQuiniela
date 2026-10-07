---
name: generar-query
description: Genera queries SQL Server para el catálogo de queries de la API de lib_comun (se guardan en la BD y se ejecutan con parámetros de reemplazo $1..$n; listas como SELECT normal y jerarquías con FOR JSON PATH), a partir de la forma del resultado que se necesita y de las tablas en specs/<CARPETA>/<TABLA>.json. Usar cuando el usuario pida un query, una consulta, un combo o un JSON para el front, o invoque /generar-query.
---

# Generar query

Los queries de esta API **no** usan Sequelize como ORM: viven en un catálogo de la BD, la API sustituye
los parámetros `$n` en el texto (`formatRepPar` en `src/api/Util/queryConsulta.ts`) y Sequelize solo
ejecuta el SQL resultante. La API adapta el resultado a la interfaz estándar que recibe el front:

```ts
export interface I_InfResponse {
  estatus: number
  data: Array<Record<string, any>> | null;
  errorUs: string | null;
  errorNeg: string[] | null
}
```

Cada query registrado lleva metadatos: `bNoDataError` y `msgNoData`. **`data = null` es una respuesta válida**:
según `bNoDataError`, significa "no hay datos" (estatus correcto) o un error para el usuario (`errorUs = msgNoData`).

El usuario valida el query y **él lo registra en la BD**: no generes INSERT/UPDATE al catálogo.

Contrato con que el front pide el servicio (POST):

```json
{
  "idProceso": 2,
  "idQuery": 1,
  "parmRemp": { "$1": 1, "$2": 8, "$3": 5 }
}
```

El flujo es `QueryByIdService` → `ExecRawQueryById` → `ExecQuery` → `prepResponse` →
(`processSqlServerJsonResult` si hay `FOR JSON PATH`) → `verificaResult`. Puede haber caché en memoria por
`idQuery` + parámetros (`MEM_CACHE`).

**No modifiques esas funciones** como parte de esta skill: su optimización se verá en una sesión aparte.

## 1. Entradas

- **Forma del resultado** que se necesita: lista, objeto, jerarquía. Si no queda clara, propón la forma con un
  ejemplo y confírmala **antes** de escribir el SQL.
- **Tablas**: léelas de `specs/<CARPETA>/<TABLA>.json` (columnas, tipos, nulos, PK, `foreign_keys` para los joins).
  Si falta una tabla, pídela; no inventes columnas.
- **Parámetros**: qué filtra el query. Si no se dicen, propónlos.

## 2. Reglas de parámetros (salen de `formatRepPar`)

- Se escriben `$1`, `$2`, … **sin comillas** en el SQL. La API inserta los números tal cual y envuelve los
  textos en comillas simples. Un mismo `$n` puede repetirse en el query.
- Máximo `$9`: el reemplazo de `$1` también alcanzaría a `$10`, `$11`…
- `$99` está reservado (modelo): no lo uses.
- Un `$n` que no viene en `parmRemp` se sustituye por `' '`; un `null` llega como `'null'`.
- **Filtro opcional numérico** ("todos" con 0, null u omitido):
  `(ISNULL(TRY_CAST($2 AS INT), 0) = 0 OR t.ID_X = TRY_CAST($2 AS INT))`.
  **Filtro opcional de texto** ("todos" con vacío u omitido): `(LTRIM($2) = '' OR t.CVE_X = $2)`.
  Indica en la tabla de parámetros cuáles son opcionales y qué valor significa "todos".
- Un texto que empieza con un operador (`IN`, `LIKE`, `>`, `=`…) se inserta **sin** comillas. No diseñes queries
  que dependan de eso salvo que el usuario lo pida.
- Fechas como texto `'YYYY-MM-DD'` (parámetro string).
- Deja un espacio después de cada `$n` (`= $1 OR`, no `= $1OR`).
- No uses `{C}`, `{P}` ni `{S}` (campos, predicado y paginación de `formatQuery`): el usuario los revisará más adelante.

## 3. Forma del resultado (convención acordada con los queries existentes)

Cómo llega cada forma al front, según `prepResponse` / `processSqlServerJsonResult`:

| Forma del query | `data` en el front | Sin filas |
|---|---|---|
| **A. `SELECT` normal, sin `FOR JSON`** | `[{...}, {...}]` | `null` → aplican los metadatos |
| **B. Objeto exterior sin `FROM`**, nodos con `FOR JSON PATH`, cierre `FOR JSON PATH, WITHOUT_ARRAY_WRAPPER` | `[{ nodo1: [...], nodo2: {...} }]` → el front lee `data[0].nodo` | siempre hay fila (nodos vacíos se omiten o vienen `null`) |
| D. `FOR JSON` con `FROM` en el nivel superior | arreglo: `[[...]]`; objeto: `[{...}]` | **error de sistema** ("Formato de resultado incorrecto") |
| `ROOT('x')` | `[{ x: [...] }]` | depende |

Reglas:

1. **Listas y combos: forma A.** Un `SELECT` normal, sin `FOR JSON`. Es el patrón más usado del sistema y
   encaja directo con `I_InfResponse`.
2. **Estructuras jerárquicas: forma B**, como el query de quiniela (`quiniela`, `bye`, `extraData`).
3. **No uses la forma D ni `ROOT(...)`** salvo que el usuario lo pida: D convierte "sin datos" en error de sistema
   y un arreglo en `[[...]]`.
4. El texto de un query de forma B **debe contener literalmente** `FOR JSON PATH` (mayúsculas, un espacio):
   así detecta la API que el resultado es JSON. Un query de forma A **no debe** contenerlo (ni en comentarios).
5. **Nunca nombres un nodo `data`**: `processSqlServerJsonResult` lo trata de forma especial.
6. En forma B:
   - Arreglo dentro del objeto: `(SELECT … FOR JSON PATH) AS hijos`.
   - Objeto dentro del objeto: `JSON_QUERY((SELECT … FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)) AS obj`.
   - Una subconsulta `FOR JSON PATH` usada como columna de otro `FOR JSON` se reconoce como JSON. **Necesita
     `JSON_QUERY`** (o llega como texto escapado) cuando lleva `WITHOUT_ARRAY_WRAPPER` o pasa por una función
     (`COALESCE`, `ISNULL`, `CASE`…).
   - Usa `INCLUDE_NULL_VALUES` cuando el front necesite todas las llaves aunque vengan nulas; pregunta si no está claro.
   - Si un nodo vacío debe llegar como `[]` en lugar de omitirse, `JSON_QUERY(COALESCE((SELECT … FOR JSON PATH), '[]'))`.
     Solo cuando el usuario lo pida.
7. **`bNoDataError`**: propónlo según el caso de uso (un combo vacío normalmente no es error; la consulta de un
   registro que debe existir, sí). Recuerda que en forma B nunca hay `data = null`.
8. La primera vez que se use un patrón nuevo, pide al usuario confirmar el resultado en su BD.

## 4. Nombres

**Combos (lista de opciones): `llave` / `valor`**, el estándar del componente de combo del front:

```sql
SELECT e.ID_EQUIPO AS llave, e.NOM_EQUIPO AS valor FROM Q_EQUIPO AS e ORDER BY e.NOM_EQUIPO
```

**Todo lo demás: camelCase** desde el nombre de BD: separa por `_`, primera palabra en minúsculas, las demás con
mayúscula inicial.

| BD | JSON |
|---|---|
| `ID_PROVEEDOR` | `idProveedor` |
| `IMP_BRUTO` | `impBruto` |
| `SIT_C_X_P` | `sitCXP` |
| `F_OPERACION` | `fOperacion` |

Siempre con alias explícito (`t.IMP_BRUTO AS impBruto`), aunque coincida. Las columnas calculadas y los nodos
de forma B (`partidas`, `totales`) también en camelCase.

## 5. Estilo SQL

- Alias de tabla cortos y significativos; joins explícitos (`JOIN … ON`) siguiendo las `foreign_keys` del spec.
- Incluye siempre la empresa (`CVE_EMPRESA`) en joins y filtros cuando la tabla la tenga.
- Importes como número (no los conviertas a texto); fechas `date` tal cual.
- Combos ordenados por `valor`.
- Comentarios `--` breves solo donde la lógica no sea evidente.

## 6. Entrega (siempre en este orden)

1. **Query**, en un bloque ```sql listo para registrar.
2. **Parámetros**: tabla `$n | nombre | tipo (número/texto) | obligatorio/opcional | significado`.
3. **Contrato de ejemplo** (el JSON POST de arriba con `parmRemp` llenado; `idQuery` como `<id asignado>`).
4. **Respuesta de ejemplo**: el `I_InfResponse` completo con datos plausibles, y cómo lee el front el resultado
   (`data` directo en forma A, `data[0].nodo` en forma B).
5. **Metadatos sugeridos** para el catálogo: `bNoDataError` (true/false) y `msgNoData`.
6. Avisos: supuestos que hiciste, columnas que no encontraste, patrones que requieren confirmarse en la BD.
