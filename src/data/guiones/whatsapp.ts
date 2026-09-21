import type { AccionUI } from "@/types/agentes";
import type { Guion, Guiones } from "./tipos";
import { INICIO_TIEMPO, LLEGADA, T_RESP, TEXTO_RESPUESTA } from "./kari-hsm";

/**
 * Guiones de la ventana «whatsapp»: el teléfono del titular durante las esperas humanas.
 * c3 · llegan los tres mensajes y el titular responde «Sí fui yo» / «No fui yo» (o no responde en 15 min simulados) ·
 * c5 · segunda espera tras el reintento (R10): sigue sin responder hasta el minuto 40 (SLA vencido, R05).
 * Todas las acciones son del humano: su cursor actúa como un toque en la pantalla; el agente queda aparcado y
 * su pensamiento es el del bot que deja la alerta en espera.
 *
 * Anclas de la ventana: wa.msg.{1,2,pregunta} (primer envío) · wa.msg.{4,5,reintento} (reintento) ·
 * wa.msg.respuesta · wa.msg.cierre · wa.campo.mensaje · wa.btn.enviar.
 */

const H = "humano" as const;

const c3: Guion = (c) => {
  const { d } = c;
  const resp = d.hsm.respuesta;
  const llegada: AccionUI[] = [
    { t: 0, tipo: "ventana", vista: "whatsapp.chat", actor: H },
    { t: 0.02, hasta: INICIO_TIEMPO.c3, tipo: "estado", texto: "Recibiendo mensajes…", nivel: "info", actor: H },
    {
      t: LLEGADA.c3[0],
      hasta: 0.28,
      tipo: "toast",
      texto: "Banco de Bogotá Alertas · 3 mensajes nuevos",
      nivel: "info",
      actor: H,
    },
    { t: INICIO_TIEMPO.c3, tipo: "estado", texto: "Chat abierto · 3 mensajes sin responder", nivel: "info", actor: H },
    { t: INICIO_TIEMPO.c3, tipo: "mover", ancla: "wa.msg.pregunta", actor: H },
  ];

  if (resp === "ninguna") {
    return {
      vista: "whatsapp.chat",
      ui: llegada,
      pensamiento: `Dejo la alerta en espera y sigo con otra: si el titular no responde a los ${d.hsm.reintentoMin} min, por R10 reenvío la plantilla.`,
    };
  }

  const texto = TEXTO_RESPUESTA[resp];
  const ui: AccionUI[] = [
    ...llegada,
    {
      t: T_RESP.leer,
      hasta: T_RESP.campo,
      tipo: "resaltar",
      ancla: "wa.msg.pregunta",
      texto: "Leyendo la pregunta",
      actor: H,
    },
    { t: T_RESP.campo, tipo: "mover", ancla: "wa.campo.mensaje", actor: H },
    { t: T_RESP.campo + 0.02, tipo: "clic", ancla: "wa.campo.mensaje", actor: H },
    {
      t: T_RESP.teclearDesde,
      hasta: T_RESP.teclearHasta,
      tipo: "teclear",
      ancla: "wa.campo.mensaje",
      texto,
      actor: H,
    },
    { t: T_RESP.teclearHasta + 0.02, tipo: "mover", ancla: "wa.btn.enviar", actor: H },
    { t: T_RESP.enviar, tipo: "clic", ancla: "wa.btn.enviar", actor: H },
    { t: T_RESP.enviar, tipo: "estado", texto: `«${texto}» enviado`, nivel: "ok", actor: H },
    {
      t: T_RESP.cierre,
      hasta: 1,
      tipo: "toast",
      texto: "Banco de Bogotá Alertas · mensaje nuevo",
      nivel: "info",
      actor: H,
    },
    { t: T_RESP.cierre + 0.03, tipo: "mover", ancla: "wa.msg.cierre", actor: H },
    { t: T_RESP.cierre + 0.03, tipo: "estado", texto: "Confirmación del banco recibida", nivel: "ok", actor: H },
  ];
  return {
    vista: "whatsapp.chat",
    ui,
    pensamiento: `Dejo la alerta en espera y sigo con otra: el titular tiene ${d.hsm.slaMin} min para responder (R05) y, si no lo hace a los ${d.hsm.reintentoMin} min, reenvío la plantilla (R10).`,
  };
};

const c5: Guion = (c) => {
  const { d } = c;
  const ui: AccionUI[] = [
    { t: 0, tipo: "ventana", vista: "whatsapp.chat", actor: H },
    { t: 0.01, hasta: INICIO_TIEMPO.c5, tipo: "estado", texto: "Recibiendo mensajes…", nivel: "info", actor: H },
    {
      t: LLEGADA.c5[0],
      hasta: 0.3,
      tipo: "toast",
      texto: "Banco de Bogotá Alertas · 3 mensajes nuevos",
      nivel: "info",
      actor: H,
    },
    {
      t: INICIO_TIEMPO.c5,
      tipo: "estado",
      texto: "Segundo aviso recibido · sin respuesta del titular",
      nivel: "aviso",
      actor: H,
    },
    { t: 0.24, tipo: "mover", ancla: "wa.msg.reintento", actor: H },
    {
      t: 0.9,
      tipo: "estado",
      texto: `Sin respuesta del titular · SLA de ${d.hsm.slaMin} min vencido`,
      nivel: "aviso",
      actor: H,
    },
  ];
  return {
    vista: "whatsapp.chat",
    ui,
    pensamiento: `Dejo la alerta en espera y sigo con otra: el segundo aviso tampoco tiene respuesta y al minuto ${d.hsm.slaMin} vence el SLA (R05).`,
  };
};

export const whatsapp: Guiones = { c3, c5 };
