import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path  from 'path';
import {
  AEnvConfig,
} from '../Modelos/Interface/Configuracion/comun.js';

const kProduccion : string = 'production'; 
const kdesarrollo : string = 'development'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || kdesarrollo;
const envPath = path.resolve(__dirname, '../../', `.env.${env}`).trim();
// Carga las variables de entorno desde la ruta especificada
const result = dotenv.config({ path: envPath });

if (result.error) {
  throw('Error ql cargar .env file');
}

// Este código anula los console.log dando override a la función console.log
if (process.env.NODE_ENV === kProduccion) {
    // Un último mensaje antes de silenciar todo
    console.log("🚀 Aplicación iniciada en PRODUCCIÓN. Silenciando logs de consola...");
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    // console.error se mantiene activo para detectar fallos reales
}

export const envConfig : AEnvConfig = {

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
  PASS_SEC: process.env.PASS_SEC as string,
  SMTP_HOST: process.env.SMTP_HOST  as string,
  SMTP_PORT: process.env.SMTP_PORT as string,
  SMTP_USER: process.env.SMTP_USER  as string,
  SMTP_PASS: process.env.SMTP_PASS  as string,
  SMTP_FROM: process.env.SMTP_FROM  as string,
  MEM_CACHE: process.env.DB_LOGGING?.toLowerCase() === 'true',
}

