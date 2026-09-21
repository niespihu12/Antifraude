import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de la ventana «monitor» (consola del orquestador y monitoreo manual). */
export const monitor: Guiones = {
  "MONITOR:r1": soloVista("monitor.cola"),
  r2: soloVista("monitor.detalle"),
  r3: soloVista("monitor.detalle"),
  r4: soloVista("monitor.detalle"),
  i3: soloVista("monitor.cola"),
  d4: soloVista("monitor.manual"),
  g3: soloVista("monitor.sync"),
};
