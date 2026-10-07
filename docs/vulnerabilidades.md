# Registro de vulnerabilidades y riesgos — lib_comun

Hallazgos detectados durante el desarrollo que **se decidió no corregir todavía**.
Cada uno indica qué lo mitiga hoy y qué se propone para cerrarlo.

**Riesgo:** 🔴 Alto · 🟠 Medio · 🟡 Bajo
**Estado:** Abierto · Mitigado (protección parcial, p. ej. en el front) · Aceptado (se decidió vivir con él) · Cerrado

| # | Riesgo | Área | Estado |
|---|---|---|---|
| V01 | 🔴 | Queries: comillas sin escapar en `formatRepPar` | Cerrado (2026-10-07) |
| V02 | 🔴 | Queries: textos con operador se insertan sin comillas | Abierto |
| V03 | 🟠 | API: `CVE_EMPRESA` se toma del body, no de la sesión | Abierto |
| V04 | 🟠 | CxP: alta/modificación de partidas en cuenta cancelada o conciliada | Mitigado (front) |
| V05 | 🟠 | CxP: `/Crud/Borra` puede eliminar físicamente una cuenta | Mitigado (front) |
| V06 | 🟠 | CRUD: `obtResultado` trata un `TypeError` como éxito | Abierto |
| V07 | 🟠 | Logs: `createRecord` imprime los datos recibidos (incluidas contraseñas) | Abierto |
| V08 | 🟡 | CRUD: violación de llave foránea llega como error de sistema | Abierto |
| V09 | 🟡 | Queries: `FOR JSON` con `FROM` y sin filas termina en error de sistema | Abierto |
| V10 | 🟡 | CRUD: `/Crud/Modifica` sin cambios responde éxito | Mitigado (front) |
| V11 | 🟡 | Queries: `$1` también reemplaza `$10`, `$11`… | Aceptado |
| V12 | 🟡 | Folios: se obtienen fuera de la transacción | Aceptado |
| V13 | 🟡 | Caché: combos desactualizados tras un alta | Abierto |
| V14 | 🟡 | Procedimientos: el header JSON se inserta sin escapar comillas (`IncHeader`) | Cerrado (2026-10-07) |
| V15 | 🟠 | Queries: `$99` (modelo) se inserta tal cual en el SQL | Abierto |

---

## V01 🔴 Comillas sin escapar en `formatRepPar`
- **Dónde:** `src/api/Util/queryConsulta.ts`, `formatRepPar`.
- **Problema:** los parámetros de texto se insertan como `'${valor}'` sin duplicar las comillas simples. Un valor
  como `O'Brien` rompe el query y un valor malicioso permite **inyección SQL** en cualquier query del catálogo.
- **Solución aplicada (2026-10-07):** los textos que van entre comillas pasan por `literalTexto`, que duplica las
  comillas simples (`O'Brien` → `'O''Brien'`). Además, el reemplazo se hace con una función en lugar de una cadena,
  para que valores con `$&`, `$'` o `` $` `` se inserten literales (como cadena, `String.replace` los interpretaba y
  copiaba partes del query). Se conserva el reemplazo propio de parámetros (no se usan los `replacements` de
  Sequelize): el reemplazo maneja patrones que Sequelize no cubre.
- **Probado:** texto normal, `O'Brien`, `x' OR '1'='1`, `x'; DROP TABLE T; --`, valores con `$'` y `$&`, `null`,
  parámetro omitido y operador `LIKE` (sin cambios).
- **Detectado:** 2026-10-05.

## V02 🔴 Textos con operador se insertan sin comillas
- **Dónde:** `formatRepPar` / `containsSpecialOperator`.
- **Problema:** un parámetro de texto que empieza con `IN`, `LIKE`, `>`, `=`… se inserta tal cual. Es otra vía de
  inyección: basta mandar un valor que empiece con un operador.
- **Mitigación actual:** ninguna.
- **Propuesta:** limitar ese comportamiento a parámetros declarados explícitamente en los metadatos del query.
- **Detectado:** 2026-10-05.

## V03 🟠 `CVE_EMPRESA` se toma del body, no de la sesión
- **Dónde:** todos los queries (`$1`) y el CRUD (`data.CVE_EMPRESA`).
- **Problema:** la empresa queda fija al iniciar sesión, pero el back confía en la que manda el front. Cambiando
  `CVE_EMPRESA` (p. ej. desde Postman) se pueden consultar o modificar datos de otra empresa.
- **Mitigación actual:** el sistema de seguridad solo muestra al usuario sus funciones.
- **Propuesta:** que el back tome la empresa de la sesión (token) o valide que coincida con la del body.
- **Detectado:** 2026-10-07.

## V04 🟠 Partidas en cuenta cancelada o conciliada (alta y modificación)
- **Dónde:** `CI_ITEM_C_X_P` (`.manual.ts`).
- **Problema:** el back acepta agregar o modificar partidas de una cuenta cancelada o conciliada. La **baja** sí
  está protegida en el back.
- **Mitigación actual:** el front no ofrece captura ni edición cuando `bEditable = 0`.
- **Propuesta:** llamar a `bloqueoCuenta` (ya existe en `CI_ITEM_C_X_P.manual.ts`) también en el alta y en la
  modificación, mediante una regla con `siempre: true` que consulte al padre (requiere soporte de reglas
  asíncronas o hacerlo en `asignar` / `alActualizar`).
- **Detectado:** 2026-10-03. Decisión: front como solución no definitiva (2026-10-07).

## V05 🟠 `/Crud/Borra` puede eliminar físicamente una cuenta por pagar
- **Dónde:** `CI_CUENTA_X_PAGAR` (`.manual.ts`, `validarEliminacion` no definida).
- **Problema:** la baja de una cuenta debe ser una cancelación. Hoy `/Crud/Borra` elimina una cuenta sin partidas;
  con partidas falla por la llave foránea con un error de sistema.
- **Mitigación actual:** el front no ofrece eliminar cuentas, solo cancelarlas.
- **Propuesta:** `validarEliminacion` en el manual que siempre regrese
  `[N]: Las cuentas por pagar no se eliminan; se cancelan`.
- **Detectado:** 2026-10-07.

## V06 🟠 `obtResultado` trata un `TypeError` como éxito
- **Dónde:** `src/api/Router/Servicios/actualizaBD.ts`, `obtResultado`.
- **Problema:** cualquier `TypeError` cuyo mensaje contenga `reading 'id'` se responde como éxito (parche para
  tablas con triggers). Un error real con ese texto se ocultaría y el front creería que la operación se guardó.
- **Mitigación actual:** ninguna.
- **Propuesta:** usar la opción nativa de Sequelize para tablas MSSQL con triggers (`hasTrigger` en el modelo) y
  retirar el parche; o limitarlo a la llamada exacta de inserción en tablas con `hasTriggers`.
- **Detectado:** 2026-10-03.

## V07 🟠 Logs con datos sensibles
- **Dónde:** `createRecord` (`console.log(data)`) y otros `console.log` del CRUD y del motor de validación.
- **Problema:** se imprimen los datos recibidos. En el alta de `FC_SEG_USUARIO` eso incluye la **contraseña en texto
  plano** (se hashea después, en el hook). En producción además afecta el rendimiento.
- **Mitigación actual:** los `console.log` se usan solo durante el desarrollo.
- **Propuesta:** retirar o condicionar los logs (p. ej. `VALIDATION_DEBUG`) antes de producción y nunca imprimir
  `data` completa.
- **Detectado:** 2026-10-07.

## V08 🟡 Violación de llave foránea llega como error de sistema
- **Dónde:** `armaErrorNeg`.
- **Problema:** dar de alta una partida de una cuenta inexistente (o similar) termina en error de sistema y
  excepción registrada, en lugar de un mensaje de negocio.
- **Propuesta:** traducir `ForeignKeyConstraintError` a un mensaje `[N]:`.
- **Detectado:** 2026-10-03.

## V09 🟡 `FOR JSON` con `FROM` en el nivel superior y sin filas
- **Dónde:** `processSqlServerJsonResult` / `prepResponse`.
- **Problema:** lanza "Formato de resultado incorrecto" (error de sistema) en lugar de `data = null`; además
  `prepResponse` evalúa `.length` sobre `null`.
- **Mitigación actual:** la convención de queries evita esa forma (skill `generar-query`).
- **Propuesta:** regresar `null` sin filas y proteger `prepResponse`. Pendiente para la sesión de optimización.
- **Detectado:** 2026-10-06.

## V10 🟡 `/Crud/Modifica` sin cambios responde éxito
- **Problema:** una petición que solo trae la llave (o valores iguales a los de la BD) responde éxito sin modificar
  nada. En cuentas canceladas o conciliadas ya se rechaza (regla `siempre`).
- **Mitigación actual:** el front no llama a modificar si el usuario no cambió nada.
- **Detectado:** 2026-10-07.

## V11 🟡 `$1` también reemplaza `$10`, `$11`…
- **Dónde:** `formatRepPar`.
- **Decisión:** aceptado; ningún query llega a 10 parámetros. La skill `generar-query` limita a `$9`.
- **Detectado:** 2026-10-06.

## V12 🟡 Folios fuera de la transacción
- **Dónde:** `obtenFolio` (folios `CXP` y `CXPI`).
- **Problema:** si la inserción falla después de obtener el folio, queda un hueco en la numeración.
- **Decisión:** aceptado por el usuario (2026-09-30).

## V13 🟡 Caché de queries desactualizada tras un alta
- **Dónde:** `QueryByIdService` con `MEM_CACHE` activo.
- **Problema:** un combo (p. ej. proveedores) no muestra un registro nuevo hasta que la caché se limpia o expira.
- **Detectado:** 2026-10-06.

## V14 🟡 Header JSON sin escapar en `IncHeader`
- **Dónde:** `src/api/Util/queryConsulta.ts`, `IncHeader` (agrega `@pHeader = '<json>'` a los procedimientos).
- **Problema:** el JSON del header se envuelve en comillas sin duplicar las comillas simples. Un dato del header con
  apóstrofo (p. ej. un usuario `o'brien`) rompe la llamada al procedimiento; un valor manipulado podría inyectar SQL.
- **Mitigación actual:** los datos del header vienen de la sesión (token), no del body de la petición.
- **Solución aplicada (2026-10-07):** el JSON se envuelve con `literalTexto` (el mismo de `formatRepPar`), que duplica
  las comillas simples. Probado con usuario normal, usuario `o'brien` y procedimiento sin parámetros.
- **Detectado:** 2026-10-07.

## V15 🟠 `$99` (modelo) se inserta tal cual en el SQL
- **Dónde:** `formatRepPar` (caso `$99`) y queries del catálogo como `SELECT * FROM $99 {P} {S}`.
- **Problema:** el valor de `$99` llega en `parmRemp` desde el front y se inserta sin comillas ni validación, porque es
  un nombre de tabla. Un valor como `T; DELETE FROM X` se ejecutaría.
- **Mitigación actual:** ninguna.
- **Propuesta:** validar que `$99` sea un identificador válido (`/^[A-Za-z_][A-Za-z0-9_.]*$/`) o que exista en
  `sequelize.models`, y rechazar el query en caso contrario.
- **Detectado:** 2026-10-07.
