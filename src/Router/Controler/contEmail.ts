import { Request, Response } from 'express';
import { emailService } from '@router/index.js';
import {getInstancia}  from '@config/index.js';
import {buildPKWhereClause}   from '@router/index.js';
// import { createPasswordResetToken } from './services/auth.service';

const kErrorSistema = 2;

const sequelize = await getInstancia();

export async function ctrlForgotPassword(req: Request, res: Response) {
  console.log('✅ Proceso de Recuperacion Password ');
  const  email = req.query.email as string;

  // Verifica que el usuatio/email exista
  const modelo = 'FC_SEG_USUARIO';
  const model = sequelize.models[modelo]; 
  const data  = {'CVE_USUARIO' : email};
  const whereClause = buildPKWhereClause(model, data);
  const resultado = await model.findOne({ 
        where: whereClause, 
        raw: true
  });

  if (!resultado) {
    const contexto = 'Verifica Usuario Mail'; 
    return void res.status(400).json({estatus: kErrorSistema, data :null, errorUs: 'No existe el usuario ' + contexto, errorNeg : null}); 
  }

  console.log( '✅ Envía Email 1', email);
  if (email) {  
    try {
      const modelo = 'FC_SEG_PASS_RESET';
      const model = sequelize.models[modelo]; 
      console.log('✅ Enviando Email Service ');
      const resData = await emailService (model, email);
        return void res.status(200).json (resData);
      } catch {
      const contexto = 'Ejecucion de Recuperacion Contraseña';   
      return void res.status(422).json
      ({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});
      }
   } else {
    const contexto = 'Ejecucion de Recuperacion Contraseña'; 
    return void res.status(400).json({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});   
  }
}