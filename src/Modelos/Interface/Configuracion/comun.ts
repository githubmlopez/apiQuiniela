import { Dialect} from 'sequelize';
import { JwtPayload as OriginalJwtPayload } from 'jsonwebtoken';
import { I_FC_TAREA_EVENTO} from '../NFLQUIN/I_FC_TAREA_EVENTO.js';
import { I_FC_SEG_USUARIO } from '../NFLQUIN/I_FC_SEG_USUARIO.js';

// Interfaces para configuracion de Bases de Datos
export interface AConfig {
  dialect: Dialect;
  username: string;
  password: string;
  database: string;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  dialectOptions: {
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    trustedConnection: boolean;
    requestTimeout: number
  }
};
}

export interface AEnvConfig {
  SV_PORT: number,
  SERVER_URI: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PWD: string;
  DB_PORT: number;
  DB_LOGGING: boolean;
  SEL_QUERY: string;
  SEL_ERROR: string; 
  SEL_PROC: string;
  SEL_PATRON: string;
  PASS_SEC: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
  MEM_CACHE: boolean
}

export interface I_CreaObjetoEvento extends Partial<I_FC_TAREA_EVENTO> {
    ID_PROCESO: number;
    F_EVENTO: Date;
    ID_EVENTO: number;
    CVE_APLICACION : string;
    CVE_USUARIO : string;
  }

export interface I_InfUsuario {
  idProceso : number,
  data :I_FC_SEG_USUARIO | null;
}

export interface I_Header {
  idProceso  : number | null,
  cveAplicacion : string | null,
  cveUsuario : string | null,
  cveIdioma  : string | null,
  cvePerfil  : string | null
}

export interface I_InfReqQuery {
idProceso : number,
idQuery  : string,
modelo : string 
parmRemp : KeyValueObject,
campos? : string[],
where? : string[],
orderBy? : string[],
numReg? : number,
skip? : number
}

export interface I_InfReqProc {
idProceso : number,
idProcedure : string,
parmRemp : KeyValueObject

}

export interface I_InfReqCrud {
idProceso : number,
model : string,
data : KeyValueObject | null
}

// Interfaces para Response

export interface I_InfResponse {
  estatus: number
  data: Array<Record<string, any>> | null;
  errorUs  : string | null;
  errorNeg    : string[] | null
}

// Interfaces para respuesta de Query y Store Procedure
export interface I_ResProcedure {
  data: string | null;
  errUs: string | null;
  errNeg: string | null 
}

export interface I_ResQuery {
  data  : string;
}

// Interfaces para manejo de Errores

export interface I_ObjError {
  errorUs : string | undefined;
  errorSis : string | undefined;
  errorStack : string | undefined;
  errNeg : string[] | null;
}

// Interfaces de uso comun

export interface KeyValueObject {
  [key: string]: string | number;
}

// Interfaces para rutas especificas

export interface I_Autentica {
  idProceso  : number;
  cveAplicacion : string;
  cveUsuario : string;
  password   : string;
}


export interface CustomJwtPayload extends OriginalJwtPayload {
  cveAplicacion : string | null,
  cveUsuario : string | null,
  cveIdioma  : string | null,
  cvePerfil : string | null
}

export interface I_EmailOptions {
  to: string;
  subject: string;
  token: string;
}
