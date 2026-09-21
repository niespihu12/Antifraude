import type { AccionUI } from "@/types/agentes";
import type { Guion, Guiones } from "./tipos";
import { formatPeso } from "@/data/agentes-util";
import { KARI_ENVIO, T_C1, T_C6, TEXTO_RESPUESTA, variablesPlantilla } from "./kari-hsm";

/**
 * Guiones de la ventana «kari» (consola de conversaciones de Kari AI / WhatsApp Business).
 * c1 · plantilla HSM: rellena las cinco variables y programa el envío (R06 si el monto es atípico) ·
 * c2 · envía el HSM: tres burbujas enviadas → entregadas ✓✓ · c4 · reintento a los 15 min (R10) ·
 * c6 · asocia la respuesta del titular a la alerta (R03/R04) o registra la ausencia (R05).
 *
 * Anclas de la ventana: kar.chip.estado · kar.chip.prioridad · kar.campo.{nombre,comercio,monto,ubicacion,fecha} ·
 * kar.msg.{1..6} · kar.btn.programar (plantilla) · kar.btn.enviar · kar.btn.reenviar · kar.card.reintento ·
 * kar.msg.{respuesta,sla} · kar.btn.registrar (conversación).
 */

const c1: Guion = (c) => {
  const { d } = c;
  const vars = variablesPlantilla(d);
  const atipico = d.transaccion.atipico;
  const ui: AccionUI[] = [
    { t: 0, tipo: "ventana", vista: "kari.plantilla" },
    { t: 0.02, tipo: "estado", texto: `Plantilla ${d.hsm.plantilla} · aprobada`, nivel: "info" },
    { t: 0.02, tipo: "mover", ancla: "kar.chip.estado" },
    { t: 0.03, hasta: 0.12, tipo: "resaltar", ancla: "kar.chip.estado", texto: "Plantilla aprobada" },
    ...(atipico
      ? ([
          { t: 0.07, tipo: "mover", ancla: "kar.chip.prioridad" },
          { t: 0.07, hasta: 0.14, tipo: "resaltar", ancla: "kar.chip.prioridad", texto: "Prioridad alta" },
        ] satisfies AccionUI[])
      : []),
    { t: 0.11, tipo: "estado", texto: "Completando las variables de la plantilla…", nivel: "info" },
    ...vars.map((v, i): AccionUI => ({
      t: 0.12 + i * 0.125,
      hasta: 0.12 + i * 0.125 + 0.1,
      tipo: "pegar",
      ancla: v.ancla,
      texto: v.valor,
    })),
    { t: 0.74, tipo: "mover", ancla: "kar.msg.2" },
    { t: 0.74, hasta: 0.86, tipo: "resaltar", ancla: "kar.msg.2", texto: "Vista previa" },
    { t: 0.74, tipo: "estado", texto: "5/5 variables completas · vista previa de 3 mensajes", nivel: "ok" },
    { t: 0.86, tipo: "mover", ancla: "kar.btn.programar" },
    { t: 0.9, tipo: "clic", ancla: "kar.btn.programar" },
    { t: T_C1.programado, hasta: 1, tipo: "toast", texto: `Envío programado · ${d.hsm.plantilla}`, nivel: "ok" },
    { t: T_C1.programado, tipo: "estado", texto: `Envío programado a ${d.hsm.entregadoA}`, nivel: "ok" },
  ];
  const monto = formatPeso(d.transaccion.monto);
  return {
    vista: "kari.plantilla",
    ui,
    pensamiento: atipico
      ? `El monto de ${monto} supera el patrón histórico del cliente: aplico R06, marco la plantilla con prioridad alta y relleno las cinco variables con los datos de la alerta.`
      : d.alerta.fueraDeHorario
        ? `Es una alerta fuera del horario laboral: por R12 la atiende el orquestador automático; relleno las cinco variables y dejo programado el reintento a los ${d.hsm.reintentoMin} min (R10).`
        : `Relleno las cinco variables de la plantilla aprobada con los datos de la alerta y dejo programado el reintento a los ${d.hsm.reintentoMin} min por si el cliente no responde (R10).`,
  };
};

const c2: Guion = (c) => {
  const { d } = c;
  const env = KARI_ENVIO.c2;
  const ui: AccionUI[] = [
    { t: 0, tipo: "ventana", vista: "kari.conversacion" },
    { t: 0.02, tipo: "estado", texto: "Plantilla en cola · lista para envío inmediato", nivel: "info" },
    { t: 0.03, tipo: "mover", ancla: "kar.btn.enviar" },
    { t: 0.1, tipo: "clic", ancla: "kar.btn.enviar" },
    { t: 0.12, tipo: "estado", texto: "Enviando la plantilla por WhatsApp Business…", nivel: "info" },
    { t: env.entregado[2], tipo: "mover", ancla: "kar.msg.3" },
    {
      t: env.entregado[2] + 0.02,
      hasta: 1,
      tipo: "toast",
      texto: `HSM entregado ✓✓ a ${d.hsm.entregadoA}`,
      nivel: "ok",
    },
    { t: env.entregado[2] + 0.02, tipo: "estado", texto: `HSM entregado ✓✓ · ${d.hsm.messageId}`, nivel: "ok" },
    { t: env.entregado[2] + 0.03, hasta: 0.95, tipo: "resaltar", ancla: "kar.msg.3", texto: "Entregado" },
  ];
  return {
    vista: "kari.conversacion",
    ui,
    pensamiento: `Envío la plantilla al ${d.hsm.entregadoA} y arranco el reloj: si no responde a los ${d.hsm.reintentoMin} min reenvío (R10) y a los ${d.hsm.slaMin} min vence el SLA (R05).`,
  };
};

const c4: Guion = (c) => {
  const { d } = c;
  const env = KARI_ENVIO.c4;
  const ui: AccionUI[] = [
    { t: 0, tipo: "ventana", vista: "kari.conversacion" },
    { t: 0.02, tipo: "estado", texto: `Sin respuesta a los ${d.hsm.reintentoMin} min`, nivel: "aviso" },
    { t: 0.02, tipo: "mover", ancla: "kar.card.reintento" },
    { t: 0.03, hasta: 0.22, tipo: "resaltar", ancla: "kar.card.reintento", texto: "Reintento a los 15 min" },
    { t: 0.24, tipo: "mover", ancla: "kar.btn.reenviar" },
    { t: 0.3, tipo: "clic", ancla: "kar.btn.reenviar" },
    { t: 0.32, tipo: "estado", texto: "Reenviando la plantilla por WhatsApp Business…", nivel: "info" },
    { t: env.entregado[2], tipo: "mover", ancla: "kar.msg.6" },
    {
      t: env.entregado[2] + 0.02,
      hasta: 1,
      tipo: "toast",
      texto: `Segundo HSM entregado a los ${d.hsm.reintentoMin} min`,
      nivel: "ok",
    },
    {
      t: env.entregado[2] + 0.02,
      tipo: "estado",
      texto: `Reintento entregado ✓✓ · minuto ${d.hsm.reintentoMin}`,
      nivel: "ok",
    },
  ];
  return {
    vista: "kari.conversacion",
    ui,
    pensamiento: `Pasaron ${d.hsm.reintentoMin} min sin respuesta: por R10 reenvío la plantilla al mismo celular y sigo esperando hasta que venza el SLA de ${d.hsm.slaMin} min (R05).`,
  };
};

const c6: Guion = (c) => {
  const { d } = c;
  const resp = d.hsm.respuesta;
  if (resp === "ninguna") {
    const ui: AccionUI[] = [
      { t: 0, tipo: "ventana", vista: "kari.conversacion" },
      {
        t: 0.02,
        tipo: "estado",
        texto: `SLA de ${d.hsm.slaMin} min vencido · sin respuesta del titular`,
        nivel: "aviso",
      },
      { t: T_C6.marcaSLA + 0.02, tipo: "mover", ancla: "kar.msg.sla" },
      { t: T_C6.marcaSLA + 0.02, hasta: 0.4, tipo: "resaltar", ancla: "kar.msg.sla", texto: "Sin respuesta" },
      { t: 0.44, tipo: "mover", ancla: "kar.btn.registrar" },
      { t: 0.52, tipo: "clic", ancla: "kar.btn.registrar" },
      {
        t: T_C6.registrado,
        hasta: 1,
        tipo: "toast",
        texto: "Ausencia de respuesta registrada en la alerta",
        nivel: "aviso",
      },
      { t: T_C6.registrado, tipo: "estado", texto: "Sin respuesta registrada · pasa a Decisión", nivel: "aviso" },
    ];
    return {
      vista: "kari.conversacion",
      ui,
      pensamiento: `Pasaron ${d.hsm.slaMin} min sin respuesta del titular: por R05 registro la ausencia y dejo la alerta lista para que Decisión mantenga el bloqueo preventivo.`,
    };
  }
  const texto = TEXTO_RESPUESTA[resp];
  const ui: AccionUI[] = [
    { t: 0, tipo: "ventana", vista: "kari.conversacion" },
    { t: 0.02, tipo: "estado", texto: `Respuesta del titular recibida a los ${d.hsm.respuestaMin} min`, nivel: "info" },
    { t: 0.03, tipo: "mover", ancla: "kar.msg.respuesta" },
    { t: 0.03, hasta: 0.4, tipo: "resaltar", ancla: "kar.msg.respuesta", texto: "Respuesta del titular" },
    { t: 0.44, tipo: "mover", ancla: "kar.btn.registrar" },
    { t: 0.52, tipo: "clic", ancla: "kar.btn.registrar" },
    {
      t: T_C6.registrado,
      hasta: 1,
      tipo: "toast",
      texto: `Respuesta «${texto}» asociada a la alerta`,
      nivel: "ok",
    },
    {
      t: T_C6.registrado,
      tipo: "estado",
      texto: `Respuesta «${texto}» asociada a ${d.alerta.referencia}`,
      nivel: "ok",
    },
  ];
  return {
    vista: "kari.conversacion",
    ui,
    pensamiento:
      resp === "si"
        ? `El titular respondió «${texto}» a los ${d.hsm.respuestaMin} min, dentro del SLA: asocio la respuesta a la alerta para que Decisión levante el bloqueo (R03).`
        : `El titular respondió «${texto}» a los ${d.hsm.respuestaMin} min: asocio la respuesta a la alerta para que Decisión aplique el bloqueo definitivo (R04).`,
  };
};

export const kari: Guiones = { c1, c2, c4, c6 };
