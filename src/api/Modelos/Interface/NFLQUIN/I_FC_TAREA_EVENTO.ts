
//  Descripción de la Interfaz FC_TAREA_EVENTO --
export interface I_FC_TAREA_EVENTO
   {
      ID_PROCESO : number;
      F_EVENTO : Date;
      ID_EVENTO : number;
      CVE_TIPO_EVENTO : string;
      CVE_APLICACION : string,
      CVE_USUARIO : string,
      DESC_ERROR : string;
      MSG_ERROR : string | null,
      ERROR_NUMBER_D : number | null,
      ERROR_SEVERITY_D : number | null,
      ERROR_STATE_D : number | null,
      ERROR_PROCEDURE_D : string | null,
      ERROR_LINE_D : number | null,
      ERROR_MESSAGE_D : string | null,
   }
