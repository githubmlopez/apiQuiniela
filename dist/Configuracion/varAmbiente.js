import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = process.env.NODE_ENV || 'desarrollo';
const envPath = path.resolve(__dirname, '../../', `.env.${env}`).trim();
// Carga las variables de entorno desde la ruta especificada
const result = dotenv.config({ path: envPath });
if (result.error) {
    throw ('Error ql cargar .env file');
}
export const envConfig = {
    SERVER_URI: process.env.SERVER_URI,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PWD: process.env.DB_PWD,
    DB_PORT: process.env.DB_PORT,
    SEL_QUERY: process.env.SEL_QUERY,
    SEL_ERROR: process.env.SEL_ERROR,
    SEL_PROC: process.env.SEL_PROC,
    PASS_SEC: process.env.PASS_SEC,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM
};
