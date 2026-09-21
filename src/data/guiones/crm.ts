import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de la ventana «crm» (CRM Banco): consulta del titular y tipificación. */
export const crm: Guiones = {
  i1: soloVista("crm.cliente"),
  g1: soloVista("crm.tipificacion"),
  g2: soloVista("crm.tipificacion"),
  g4: soloVista("crm.tipificacion"),
};
