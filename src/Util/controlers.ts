import { I_Header } from '../index.js';
import { CustomJwtPayload, I_InfReqCrud} from '../index.js';


export function armaHeaderQuery(infToken : CustomJwtPayload, idProceso : number) : 
I_Header
{
  const header : I_Header = { 
  idProceso  : idProceso,
  cveAplicacion : infToken.cveAplicacion,
  cveUsuario : infToken.cveUsuario,
  cveIdioma  : infToken.cveIdioma,
  cvePerfil  : infToken.cvePerfil
  };
  
  return header
}