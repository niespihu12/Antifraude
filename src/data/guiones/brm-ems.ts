import type { Guiones } from "./tipos";
import { soloVista } from "./tipos";

/** Guiones de las ventanas «brm» (Visa) y «ems» (Mastercard): la alerta tal como llega de la franquicia. */
export const brmEms: Guiones = {
  "VISA:r1": soloVista("brm.alerta"),
  "MASTERCARD:r1": soloVista("ems.alerta"),
};
