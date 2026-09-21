import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de la ventana «kari» (consola de Kari AI / WhatsApp Business). */
export const kari: Guiones = {
  c1: soloVista("kari.plantilla"),
  c2: soloVista("kari.conversacion"),
  c4: soloVista("kari.conversacion"),
  c6: soloVista("kari.conversacion"),
};
