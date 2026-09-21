import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de la ventana «whatsapp»: el teléfono del titular durante las esperas humanas c3 y c5. */
export const whatsapp: Guiones = {
  c3: soloVista("whatsapp.chat"),
  c5: soloVista("whatsapp.chat"),
};
