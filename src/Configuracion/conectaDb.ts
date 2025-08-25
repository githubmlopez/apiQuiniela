import { AConfig } from '../index.js';
import { envConfig } from './index.js';
import { Sequelize, Options} from 'sequelize';

const kError = 'No .env';
const kProduccion = 'produccion';

export const getInstancia: () => Promise<Sequelize> = (() => {
  let instQuiniela: Sequelize | null = null;

  return async () => {
    if (instQuiniela) return instQuiniela;  
 
const dbConfig: Options = {
    dialect: 'mssql',
    username: envConfig.DB_USER,
    password: envConfig.DB_PWD,
    database: envConfig.DB_NAME,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            trustedConnection: true,
            requestTimeout: 60000,
        },
    },
    logging: (msg, options) => {
        console.log("SQL Query:", msg);
        // Imprime todo el objeto options para ver su estructura
        // Puedes usar JSON.stringify para verlo mejor si es complejo
        console.log("Sequelize Options:", options);
        console.log("---"); // Separador para cada log
    },
  };  

  const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : '';
  
  if (nodeEnv === kProduccion) {
      dbConfig.host = envConfig.SERVER_URI;
  } 
  
  console.log('✅ Configuracion: ', JSON.stringify(dbConfig), process.env.NODE_ENV);

  instQuiniela  = new Sequelize(dbConfig);
  
  try { 
    let connectedDatabase: string = ' ';
    await instQuiniela.authenticate();
    connectedDatabase = instQuiniela.getDatabaseName();
    console.log(instQuiniela.getDatabaseName())
    console.log(`✅ Conexión exitosa a la base de datos: ${connectedDatabase}`);
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error; 
  }

  return instQuiniela;
  }
})();


