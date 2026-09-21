import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de la ventana «ppe» (bloqueos y desbloqueos de tarjeta). */
export const ppe: Guiones = {
  r5: soloVista("ppe.bloqueo"),
  d2: soloVista("ppe.consulta"),
  d3_desbloqueo: soloVista("ppe.bloqueo"),
  d3_definitivo: soloVista("ppe.bloqueo"),
  d3_preventivo: soloVista("ppe.bloqueo"),
  d5_desbloqueo: soloVista("ppe.bloqueo"),
  d5_definitivo: soloVista("ppe.bloqueo"),
};
