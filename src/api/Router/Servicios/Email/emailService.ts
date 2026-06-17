import { ejecFuncion, creaHeadEsq} from '@util/index.js';
import { sendResetPasswordEmail } from '@router/index.js'; 
import { I_EmailOptions, I_Header } from '@modelos/index.js';
import { createRecordService } from '@router/index.js';
import crypto from 'crypto';
import { DateTime } from 'luxon';


export async function emailService(model : any, email : string) {

    const tokenMail = crypto.randomBytes(32).toString('hex');

    console.log( '✅ Envía Service', tokenMail);
    
    let options : I_EmailOptions = {
        to : email,
        subject : 'Instrucciones para restablecer contraseña',
        token : tokenMail
    }    

    const cveAplicacion = 'RecEmail';

    const header : I_Header = creaHeadEsq (cveAplicacion);
    const contexto = 'Send Email / Mail (Service)';
    
    console.log( '✅ Creando Registro');
          
    // 1. Obtener el momento exacto actual "ahora" en la zona horaria de CDMX
    const ahoraCDMX = DateTime.now().setZone('America/Mexico_City');
    
    // 2. Calcular la expiración (+30 minutos) basándonos en el tiempo de CDMX
    const expiracionCDMX = ahoraCDMX.plus({ minutes: 30 });
    
    // 3. Construimos el objeto pasando instancias de Date nativas (.toJSDate())
    // Sequelize se encargará de enviarlas de forma transparente a las columnas DATETIME2(3)
    const data = {
        "TOKEN_HASH"   : tokenMail,
        "CVE_USUARIO"  : email,
        "F_EXPIRACION" : expiracionCDMX.toJSDate(), // 👈 Objeto Date nativo ajustado a CDMX
        "F_CREACION"   : ahoraCDMX.toJSDate(),      // 👈 Objeto Date nativo ajustado a CDMX
    }

    console.log('✅ Enviado Create Record Service ');
    const resData = await ejecFuncion(
              createRecordService, 
              header, 
              contexto, 
              model,
              data
          );

    console.log( '✅ Se creo con exito');
    
    const resDataSend = await ejecFuncion(
          sendResetPasswordEmail, 
          header, 
          contexto, 
          options
    );

    console.log( '✅ Send Email ejecutado con éxito'); 
    return resData;    
}