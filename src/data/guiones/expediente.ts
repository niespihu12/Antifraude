import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de la ventana «expediente»: sello de bitácora y acta de trazabilidad. */
export const expediente: Guiones = {
  g5: soloVista("expediente.acta"),
};
