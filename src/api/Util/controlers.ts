import { I_Header } from '@modelos/index.js';
import { CustomJwtPayload } from '@modelos/index.js';


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