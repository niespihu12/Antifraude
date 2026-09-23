import type { AccionUI } from "@/types/agentes";
import type { Guion, Guiones } from "./tipos";
import { T } from "./monitor-datos";

/**
 * Guiones de las ventanas «vrm» (Visa) y «ems» (Mastercard): la alerta tal como llega de la franquicia.
 * r1 · la alerta entrante se selecciona en la bandeja, se lee y se reconoce (acuse de recibo).
 *
 * Anclas de la ventana (prefijo `vrm.` o `ems.`): fila.alerta · campo.referencia · btn.reconocer.
 */
function r1Franquicia(ns: "vrm" | "ems", vista: "vrm.alerta" | "ems.alerta"): Guion {
  return (c) => {
    const { alerta } = c.d;
    const ui: AccionUI[] = [
      { t: 0, tipo: "estado", texto: `Alerta entrante en ${alerta.origen} · ${alerta.referencia}`, nivel: "info" },
      { t: 0.08, tipo: "mover", ancla: `${ns}.fila.alerta` },
      { t: T.fr.selecciona - 0.02, tipo: "clic", ancla: `${ns}.fila.alerta` },
      { t: 0.3, tipo: "mover", ancla: `${ns}.campo.referencia` },
      { t: 0.3, hasta: 0.5, tipo: "resaltar", ancla: `${ns}.campo.referencia`, texto: "Referencia" },
      { t: 0.42, tipo: "mover", ancla: `${ns}.btn.reconocer` },
      { t: T.fr.clicReconocer, tipo: "clic", ancla: `${ns}.btn.reconocer` },
      {
        t: T.fr.reconocida + 0.02,
        tipo: "estado",
        texto: `Alerta ${alerta.referencia} reconocida · acuse enviado a ${alerta.origen}`,
        nivel: "ok",
      },
    ];
    return {
      vista,
      ui,
      pensamiento: `Entró una alerta de ${alerta.origen} por ${alerta.motivo.toLowerCase()}: la selecciono en la bandeja y acuso recibo${alerta.fueraDeHorario ? "; es fuera del horario laboral y la procesa el orquestador automático (R12)" : ""}.`,
    };
  };
}

export const vrmEms: Guiones = {
  "VISA:r1": r1Franquicia("vrm", "vrm.alerta"),
  "MASTERCARD:r1": r1Franquicia("ems", "ems.alerta"),
};
