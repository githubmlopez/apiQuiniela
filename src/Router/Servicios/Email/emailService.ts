import { ejecFuncion, creaHeadEsq} from '@util/index.js';
import { sendResetPasswordEmail } from '@router/index.js'; 
import { I_EmailOptions, I_Header } from '@modelos/index.js';
import { createRecordService } from '@router/index.js';
import crypto from 'crypto';


export async function emailService(model : any, email : string) {

    const tokenMail = crypto.randomBytes(32).toString('hex');

    console.log( '✅ Envía Service', tokenMail);
    
    let options : I_EmailOptions = 
    {to : email,
     subject : 'Instrucciones para restablecer contraseña',
     token : tokenMail
    }    

    const cveAplicacion = 'RecEmail';

    const header : I_Header =  creaHeadEsq (cveAplicacion) 
    const contexto = 'Send Email / Mail (Service)';
    
    console.log( '✅ Creando Registro');
          
    const modelo = 'FC_SEG_PASS_RESET';
    
    const fecha = new Date();
    const fechaExpiracion = new Date(fecha.getTime() + 30 * 60000);
    
    const data  = 
    {
        "TOKEN_HASH"   : tokenMail,
        "CVE_USUARIO"  : email,
        "F_EXPIRACION" : fechaExpiracion.toLocaleString('sv-SE').replace(',', ''),
        "F_CREACION"   : new Date().toLocaleString('sv-SE').replace(',', ''),
    }

    const resData = await ejecFuncion(
              createRecordService, 
              header, 
              contexto, 
              model,
              data
          );

    console.log( '✅ Se creo con exito');

    // The core logic extracted from the try block
    
    const resDataSend = await ejecFuncion(
          sendResetPasswordEmail, 
          header, 
          contexto, 
          options
    );

    console.log( '✅ Send Email ejecutado con éxito'); 
    return resData;    
}