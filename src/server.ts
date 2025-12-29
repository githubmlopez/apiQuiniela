import { cargaCache, cargaModelos} from './index.js';
import { ejecFuncion, setupGlobalError} from './index.js'
import { creaHeadEsq } from './index.js'
import { I_Header } from './index.js';
import { envConfig } from './index.js';
import { app } from './index.js';

const cveAplicacion = 'setGlobalE'
const header : I_Header = creaHeadEsq(cveAplicacion);

// Estas funciones tienen su porpio manejo de errores internamente 
await setupGlobalError();
console.log('✅ setupGlobalError');
const contMem = 'Carga inf a Memoria';
await ejecFuncion (cargaCache, header, contMem) 
console.log('✅ cargaCache');
const contModel = 'Carga inf a Memoria';
await ejecFuncion (cargaModelos, header, contModel);

const PORT = envConfig.DB_PORT || 3010;
const env = process.env.NODE_ENV || 'desarrollo';
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`, env);
});
