/* 
import { envConfig } from '@config/index.js';
import { Sequelize, Options } from 'sequelize';

const kNomLocal: string = 'localhost';
const kIpLocal: string = '127.0.0.1';

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
        min: 1,        // mantiene al menos 1 conexión viva; evita reconexión desde cero
        acquire: 30000,
        idle: 60000,   // tolera pausas más largas entre peticiones de prueba
      },
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
          trustedConnection: false,
          connectTimeout: 30000,
          requestTimeout: 60000,
        },
      },
      logging: envConfig.DB_LOGGING
        ? (msg, options: any) => {
            console.log("--- 🚀 SQL LOG ---");
            console.log("QUERY:", msg);
            if (options.model) console.log("MODELO:", options.model.name);
            if (options.instance) console.log("ACCION: Instancia detectada");
            console.log("------------------");
          }
        : false,
    };

    if (
      envConfig.SERVER_URI &&
      envConfig.SERVER_URI !== kNomLocal &&
      envConfig.SERVER_URI !== kIpLocal
    ) {
      dbConfig.host = envConfig.SERVER_URI;
      dbConfig.port = Number(envConfig.DB_PORT) || 1433;
      console.log(`🌐 Conectando vía TCP/IP a: ${dbConfig.host}`);
    } else {
      dbConfig.host = kNomLocal;
      dbConfig.port = undefined;

      if (!dbConfig.dialectOptions) {
        dbConfig.dialectOptions = {};
      }
      const dOpts = dbConfig.dialectOptions as any;
      if (!dOpts.options) {
        dOpts.options = {};
      }

      dOpts.options.instanceName = 'SQLEXPRESS02';
      dOpts.options.encrypt = true;
      dOpts.options.trustServerCertificate = true;

      console.log(`🏠 Conectando vía Local Shared Memory`);
    }

    console.log('✅ Configuracion: ', JSON.stringify(dbConfig), process.env.NODE_ENV);

    // Creamos la instancia en una variable LOCAL, no en la del closure todavía
    const nuevaInstancia = new Sequelize(dbConfig);

    try {
      await nuevaInstancia.authenticate();
      const connectedDatabase = nuevaInstancia.getDatabaseName();
      console.log(`✅ Conexión exitosa a la base de datos: ${connectedDatabase}`);

      // Solo AHORA, si authenticate() tuvo éxito, la guardamos como singleton
      instQuiniela = nuevaInstancia;
      return instQuiniela;
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error);

      // Cerramos la conexión fallida para no dejar sockets colgando
      try {
        await nuevaInstancia.close();
      } catch (closeError) {
        console.error('⚠️ Error adicional al cerrar instancia fallida:', closeError);
      }

      instQuiniela = null; // aseguramos que el próximo llamado reintente desde cero
      throw error;
    }
  };
})();
*/
import { envConfig } from '@config/index.js';
import { Sequelize, Options } from 'sequelize';

const kNomLocal: string = 'localhost';
const kIpLocal: string = '127.0.0.1';

// Crea y autentica una instancia nueva (sin lógica de singleton)
async function crearInstancia(): Promise<Sequelize> {
  const dbConfig: Options = {
    dialect: 'mssql',
    host: envConfig.SERVER_URI,
    port: envConfig.DB_PORT,
    username: envConfig.DB_USER,
    password: envConfig.DB_PWD,
    database: envConfig.DB_NAME,
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 60000,
    },
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: false,
        connectTimeout: 30000,
        requestTimeout: 60000,
      },
    },
    logging: envConfig.DB_LOGGING
      ? (msg, options: any) => {
          console.log("--- 🚀 SQL LOG ---");
          console.log("QUERY:", msg);
          if (options.model) console.log("MODELO:", options.model.name);
          if (options.instance) console.log("ACCION: Instancia detectada");
          console.log("------------------");
        }
      : false,
  };

  if (
    envConfig.SERVER_URI &&
    envConfig.SERVER_URI !== kNomLocal &&
    envConfig.SERVER_URI !== kIpLocal
  ) {
    dbConfig.host = envConfig.SERVER_URI;
    dbConfig.port = Number(envConfig.DB_PORT) || 1433;
    console.log(`🌐 Conectando vía TCP/IP a: ${dbConfig.host}`);
  } else {
    dbConfig.host = kNomLocal;
    dbConfig.port = undefined;

    if (!dbConfig.dialectOptions) {
      dbConfig.dialectOptions = {};
    }
    const dOpts = dbConfig.dialectOptions as any;
    if (!dOpts.options) {
      dOpts.options = {};
    }

    dOpts.options.instanceName = 'SQLEXPRESS02';
    dOpts.options.encrypt = true;
    dOpts.options.trustServerCertificate = true;

    console.log(`🏠 Conectando vía Local Shared Memory`);
  }

  console.log('✅ Configuracion: ', JSON.stringify(dbConfig), process.env.NODE_ENV);

  const nuevaInstancia = new Sequelize(dbConfig);

  try {
    await nuevaInstancia.authenticate();
    console.log(`✅ Conexión exitosa a la base de datos: ${nuevaInstancia.getDatabaseName()}`);
    return nuevaInstancia;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    try {
      await nuevaInstancia.close();
    } catch (closeError) {
      console.error('⚠️ Error adicional al cerrar instancia fallida:', closeError);
    }
    throw error;
  }
}

// Singleton: se guarda la PROMESA de inmediato, así todas las llamadas
// simultáneas esperan la misma conexión en lugar de crear otra.
let instanciaPromise: Promise<Sequelize> | null = null;

export function getInstancia(): Promise<Sequelize> {
  if (!instanciaPromise) {
    instanciaPromise = crearInstancia().catch((error) => {
      instanciaPromise = null; // si falló, el siguiente llamado reintenta desde cero
      throw error;
    });
  }
  return instanciaPromise;
}

