 //  Descripción de la Interfaz FC_SEG_USUARIO --
export interface I_FC_SEG_USUARIO
   {
      CVE_USUARIO : string;
      APELLIDO_PATERNO : string;
      APELLIDO_MATERNO : string;
      NOMBRE : string;
      PASSWORD : string,
      B_BLOQUEADO : boolean;
      SIT_USUARIO : string;
      CVE_IDIOMA : string | null,
      CVE_PERFIL : string | null
   }