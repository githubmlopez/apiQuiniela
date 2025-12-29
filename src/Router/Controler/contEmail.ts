import { Request, Response } from 'express';
import { emailService } from '../Servicios/Email/emailService.js';
import {getInstancia}  from '../../index.js';
// import { createPasswordResetToken } from './services/auth.service';

const kErrorSistema = 2;

const sequelize = await getInstancia();

export async function ctrlForgotPassword(req: Request, res: Response) {
  const  email = req.query.email as string;
  console.log( '✅ Envía Email 1', email);
  if (email) {  
    try {
      const modelo = 'FC_SEG_PASS_RESET';
      const model = sequelize.models[modelo]; 
      const resData = await emailService (model, email);
        return void res.status(200).json (resData);
      } catch {
      const contexto = 'Ejecucion de Recuperacion Contraseña';   
      return void res.status(422).json
      ({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});
      }
   } else {
    const contexto = 'No se proporciono email'; 
    return void res.status(400).json({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});   
  }
}