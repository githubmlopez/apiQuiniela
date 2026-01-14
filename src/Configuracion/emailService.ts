import { envConfig } from '@config/index.js'; 
import nodemailer from 'nodemailer';

export const getTransporter = () => {
    
    return nodemailer.createTransport({
        host: envConfig.SMTP_HOST,
        port: Number(envConfig.SMTP_PORT),
        secure: false,
        auth: {
            user: (envConfig.SMTP_USER || "").trim(),
            pass: (envConfig.SMTP_PASS || "").trim(),
            type: 'LOGIN'
        },
//        debug: true,
//        logger: true,
        tls: { rejectUnauthorized: false }
    });
};

