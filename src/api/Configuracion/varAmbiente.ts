/**
 * @fileoverview Módulo de Inicialización y Configuración Dinámica Multiambiente.
 * * ARQUITECTURA Y DISEÑO:
 * - **Multiambiente:** Carga dinámicamente archivos de configuración (.env.[entorno]) 
 * basándose en la variable `process.env.NODE_ENV`.
 * - **Agnóstico al Sistema Operativo:** Resuelve automáticamente las diferencias de 
 * sintaxis de comandos y rutas de archivos entre Windows (Desarrollo) y Linux (Producción)
 * mediante el uso coordinado de `cross-env` y el módulo nativo `path`.
 * - **Dependencia de Origen:** El valor de `NODE_ENV` es inyectado en tiempo de ejecución 
 * por los scripts definidos en el `package.json` (ej. `npm run dev` o `npm run start`).
 * * @author Mario Lopez
 * @version 1.2.0
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { AEnvConfig } from '@modelos/index.js';

// --- Constantes de Control de Entornos ---
const kProduccion : string = 'production'; 
const kdesarrollo : string = 'development'; 

// Si APP_SISTEMA es 'quiniela', buscará ".quiniela"
const sistemaPrefix = process.env.APP_SISTEMA ? `.${process.env.APP_SISTEMA}` : '';

/**
 * Captura el entorno de ejecución actual.
 * El valor proviene estrictamente del script ejecutado en `package.json` mediante `cross-env`.
 * - `npm run dev`   -> Inyecta 'development'
 * - `npm run start` -> Inyecta 'production'
 * - En caso de no especificarse (ej. comando `npm run cron`), por defecto se asume `kdesarrollo`.
 */
const env = process.env.NODE_ENV || kdesarrollo;

/**
 * Resuelve la ruta absoluta del archivo de configuración requerido.
 * `path.resolve` y `process.cwd()` aseguran que la ruta se construya correctamente
 * apuntando a la raíz del proyecto, sin importar el Sistema Operativo anfitrión.
 * Ejemplo: /raiz/.env.development (Linux) o C:\raiz\.env.production (Windows)
 */
const envPath = path.resolve(process.cwd(), `.env${sistemaPrefix}.${env}`);

// --- Carga e Inyección de Variables de Entorno al Proceso ---
const result = dotenv.config({ path: envPath });

/**
 * Validación de seguridad: Si el archivo correspondiente al entorno actual 
 * (.env.development o .env.production) no existe o es ilegible, detiene el sistema
 * de inmediato emitiendo un Error con su Stack Trace para evitar ejecuciones inestables.
 */
if (result.error) {
  throw new Error(`Error crítico al cargar el archivo de variables de entorno: ${envPath}`);
}

// --- Control Global de Salida de Logs (Override) ---
/**
 * Si el entorno activo definido por el package.json es 'production', se interceptan 
 * y anulan los métodos de salida estándar de la consola (`console`). Esto optimiza el 
 * rendimiento del event-loop en producción y protege datos sensibles de depuración.
 */
if (process.env.NODE_ENV === kProduccion) {
    // Última traza visible en el flujo de salida antes del bloqueo
    console.log("🚀 Aplicación iniciada en PRODUCCIÓN. Silenciando logs de consola...");
    
    // Sobrescritura de funciones miembro a callbacks vacíos
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    
    /* NOTA DE SEGURIDAD: 'console.error' se mantiene completamente operativo. 
      Las excepciones, fallos de infraestructura y rechazos de promesas no capturados 
      DEBEN seguir escribiéndose en el flujo de errores estándar (stderr) para ser 
      monitoreados por el sistema operativo Linux o gestores de procesos (Docker/PM2).
    */
}

export const envConfig : AEnvConfig = Object.freeze({

  SV_PORT : Number(process.env.SV_PORT) || 3000,
  SERVER_URI: process.env.SERVER_URI as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
  DB_PWD: process.env.DB_PWD as string,
  DB_PORT: Number(process.env.DB_PORT),
  DB_LOGGING: process.env.DB_LOGGING?.toLowerCase() === 'true',
  SEL_QUERY: process.env.SEL_QUERY as string,
  SEL_ERROR: process.env.SEL_ERROR as string,
  SEL_PROC: process.env.SEL_PROC as string,
  SEL_PATRON: process.env.SEL_PATRON as string,
  PASS_SEC: process.env.PASS_SEC as string,
  SMTP_HOST: process.env.SMTP_HOST  as string,
  SMTP_PORT: process.env.SMTP_PORT as string,
  SMTP_USER: process.env.SMTP_USER  as string,
  SMTP_PASS: process.env.SMTP_PASS  as string,
  SMTP_FROM: process.env.SMTP_FROM  as string,
  MEM_CACHE: process.env.MEM_CACHE?.toLowerCase() === 'true',
  SECRET: process.env.SECRET  as string,
  SISTEMA: process.env.APP_SISTEMA  as string
})

