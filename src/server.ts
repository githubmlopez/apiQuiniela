import { cargaCache, cargaModelos} from '@util/index.js';
import { ejecFuncion, setupGlobalError} from '@util/index.js'
import { creaHeadEsq } from '@util/index.js'
import { I_Header } from '@modelos/index.js';
import { envConfig } from '@config/index.js';
import { app } from '@core/app.js';

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

const PORT = envConfig.SV_PORT || 3010;
const env = process.env.NODE_ENV || 'development';
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`, env);
});
