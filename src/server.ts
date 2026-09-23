import { cargaCache, cargaModelos} from '@util/index.js';
import { ejecFuncion, setupGlobalError, setUpCierreSeguro} from '@util/index.js'
import { creaHeadEsq } from '@util/index.js'
import { I_Header } from '@modelos/index.js';
import { envConfig } from '@config/index.js';
import { app } from '@core/app.js';

const cveAplicacion = 'setGlobalE'
const header : I_Header = creaHeadEsq(cveAplicacion);

// Estas funciones tienen su porpio manejo de errores internamente 

// En la función carga modelos se crea la instancia de sequelize
// y la conexión a la base de datos (singleton)
const contModel = 'Carga de modelos';
try {
  await ejecFuncion(cargaModelos, header, contModel);
} catch (error) {
  console.error('❌ No fue posible cargar los modelos. El servidor no se iniciará.', error);
  process.exit(1);
}

const PORT = envConfig.SV_PORT || 3010;
const env = process.env.NODE_ENV || 'development';
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`, env);
});

await setupGlobalError();
console.log('✅ setupGlobalError');
await setUpCierreSeguro(server);
console.log('✅ setupCierreSeguro');
const contMem = 'Carga inf a Memoria';
await ejecFuncion (cargaCache, header, contMem) 
console.log('✅ cargaCache');



