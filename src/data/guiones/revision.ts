import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de la ventana «revision»: listas de chequeo de identificación (4 controles) y de riesgo (4 controles). */
export const revision: Guiones = {
  i2: soloVista("revision.identificacion"),
  d1: soloVista("revision.riesgo"),
};
