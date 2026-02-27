import { Sequelize } from 'sequelize';
import { getInstancia } from '@config/index.js';
import { Server } from 'http';

export async function setUpCierreSeguro(server : Server) {
    
    const cerrarConexion = async (signal: string) => {
        const sequelize: Sequelize = await getInstancia();
        console.log(`\nRecibida señal ${signal}. Cerrando conexiones...`);
        
           // Cerramos la conexión de Sequelize
        server.close();
        await sequelize.close();
        console.log('✅ Conexión a la base de datos cerrada correctamente.');
            
            // Salimos del proceso con éxito (código 0)
        process.exit(0);
    };

    // Escuchamos el evento Ctrl + C (SIGINT)
    process.on('SIGINT', () => cerrarConexion('SIGINT'));

    // Escuchamos el evento de terminación del sistema (SIGTERM)
    process.on('SIGTERM', () => cerrarConexion('SIGTERM'));

    // Escuchamos el evento de cierre de ventana windows donde corre el proceso
    process.on('SIGHUP', () => cerrarConexion('SIGHUP'));
}