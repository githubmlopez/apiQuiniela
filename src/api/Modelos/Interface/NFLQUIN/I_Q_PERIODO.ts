 
//  Descripción de la Interfaz Q_PERIODO --
export interface I_Q_PERIODO
   {
      ID_QUINIELA : number;
      ID_PERIODO : string;
      TIT_PERIODO : string | null,
      COSTO_SURVIVOR : number | null,
      B_ABIERTO : boolean | null,
      B_RES_SURV : boolean | null,
      F_LIMITE : Date | null,
      HORA_LIMITE : string | null,
      B_INICIO_DIA : boolean;
      B_CIERRE_PER : boolean;
      IMP_PREMIO : number | null,
   }
