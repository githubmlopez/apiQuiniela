import { getTransporter } from '../../../Configuracion/index.js';
import { I_EmailOptions, I_InfResponse } from '../../../Modelos/Interface/Configuracion/index.js'

/**
 * Función encargada del envío por SMTP
 */   

const kCorrecto = 1;

export async function sendResetPasswordEmail(options: I_EmailOptions): Promise<I_InfResponse> {

  console.log( '✅ sendResetPasswordEmail', options);

  const { to, subject, token } = options;
  
  // URL que el usuario verá en su correo
  const resetUrl = `https://tu-frontend.com/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: to,
    subject: subject,
    text: `Para restablecer tu contraseña, copia y pega este enlace: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Recuperación de Contraseña</h2>
        <p>Has solicitado un cambio de contraseña. Haz clic en el botón para continuar:</p>
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Restablecer Contraseña
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
           Si no solicitaste este correo, puedes ignorarlo.
        </p>
      </div>
    `,
  };
  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
  return {estatus: kCorrecto, data :null, errorUs: null, errorNeg : null};    
    console.log( '✅ Termina Correcto');
 
}