import { envConfig } from '@config/index.js';
import { Sequelize, Options} from 'sequelize';

const kNomLocal : string = 'localhost';
const kIpLocal : string = '127.0.0.1';


export const getInstancia: () => Promise<Sequelize> = (() => {
  let instQuiniela: Sequelize | null = null;

  return async () => {
    if (instQuiniela) return instQuiniela;  
 
const dbConfig: Options = {
    dialect: 'mssql',
    host: envConfig.SERVER_URI,
    port: envConfig.DB_PORT,
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
    logging: envConfig.DB_LOGGING 
    ? (msg, options: any) => {
        // En desarrollo, esto es oro puro para entender tus queries
        console.log("--- 🚀 SQL LOG ---");
        console.log("QUERY:", msg);
        
        // Solo logueamos el modelo y el tiempo si existen
        if (options.model) console.log("MODELO:", options.model.name);
        if (options.instance) console.log("ACCION: Instancia detectada");
        
        console.log("------------------");
      } 
      : false // En producción (false), Sequelize ignora por completo esta función
};  

if (envConfig.SERVER_URI && 
    envConfig.SERVER_URI !== kNomLocal && 
    envConfig.SERVER_URI !== kIpLocal) {
    
    dbConfig.host = envConfig.SERVER_URI;
    dbConfig.port = Number(envConfig.DB_PORT) || 1433;
    
    console.log(`🌐 Conectando vía TCP/IP a: ${dbConfig.host}`);
} else {
    dbConfig.host = kNomLocal; 
    dbConfig.port = undefined; 
    
    // Forzamos la inicialización del objeto si no existe
    if (!dbConfig.dialectOptions) {
        dbConfig.dialectOptions = {};
    }

    // Usamos una aserción de tipo (as any) para indicarle a TypeScript 
    // que sabemos perfectamente que 'options' va ahí dentro.
    const dOpts = dbConfig.dialectOptions as any;
    if (!dOpts.options) {
        dOpts.options = {};
    }

    // Inyectamos los parámetros locales de forma segura
    dOpts.options.instanceName = 'SQLEXPRESS02';
    dOpts.options.encrypt = true;
    dOpts.options.trustServerCertificate = true;

    console.log(`🏠 Conectando vía Local Shared Memory`);
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


