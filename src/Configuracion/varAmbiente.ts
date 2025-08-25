import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path  from 'path';
import {
  AEnvConfig,
} from '../Modelos/Interface/Configuracion/comun.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'desarrollo';
const envPath = path.resolve(__dirname, '../../', `.env.${env}`).trim();
// Carga las variables de entorno desde la ruta especificada
const result = dotenv.config({ path: envPath });

if (result.error) {
  throw('Error ql cargar .env file');
}

export const envConfig : AEnvConfig = {
  SERVER_URI: process.env.SERVER_URI as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
  DB_PWD: process.env.DB_PWD as string,
  DB_PORT: process.env.DB_PORT as string,
  SEL_QUERY: process.env.SEL_QUERY as string,
  SEL_ERROR: process.env.SEL_ERROR as string,
  SEL_PROC: process.env.SEL_PROC as string,
  PASS_SEC: process.env.PASS_SEC as string
}


