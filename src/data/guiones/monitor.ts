import { Franquicia } from "@/types";
import type { AccionUI } from "@/types/agentes";
import { formatPeso } from "@/data/agentes-util";
import type { Guion, Guiones } from "./tipos";
import { RUTAS, T, camposNormalizados, contactoAnalista, escalaPatron, rutaDe, textoDecision } from "./monitor-datos";

/**
 * Guiones de la ventana «monitor» (consola de alertas antifraude y monitoreo manual).
 * Cada acción es función del progreso del paso (0–1); los tiempos que la ventana también usa
 * salen de `T` (monitor-datos) para que lo que se ve y lo que hace el cursor coincidan.
 *
 * Anclas de la ventana:
 * · monitor.cola: mon.tab.monitor|vrm|ems · mon.fila.alerta · mon.fila.manual · mon.btn.escalar
 * · monitor.detalle: mon.chip.origen · mon.campo.comercio|categoria|ubicacion|monto|canal|fecha ·
 *   mon.fila.ruta-visa|ruta-mastercard|ruta-interna · mon.barra.promedio|monto · mon.chip.patron
 * · monitor.sync: mon.btn.sincronizar · mon.fila.monitor|vrm|ems
 * · monitor.manual: mon.fila.caso · mon.btn.contactar · mon.btn.legitima|fraude · mon.chip.decision · dlg.btn.confirmar
 */

/* ─── r1 (alertas MONITOR) · la alerta entra a la cola y se selecciona ─── */
const r1: Guion = (c) => {
  const { alerta } = c.d;
  const ui: AccionUI[] = [
    { t: 0, tipo: "estado", texto: `Nueva alerta ${alerta.referencia} en la cola de Monitor…`, nivel: "info" },
    { t: T.r1.mover, tipo: "mover", ancla: "mon.fila.alerta" },
    { t: T.r1.selecciona, tipo: "clic", ancla: "mon.fila.alerta" },
    {
      t: T.r1.selecciona + 0.08,
      tipo: "estado",
      texto: `Alerta ${alerta.referencia} seleccionada · prioridad ${alerta.prioridad}${alerta.fueraDeHorario ? " · fuera de horario laboral (R12)" : ""}`,
      nivel: alerta.fueraDeHorario ? "aviso" : "ok",
    },
  ];
  return {
    vista: "monitor.cola" as const,
    ui,
    pensamiento: alerta.fueraDeHorario
      ? `Entró una alerta interna de Monitor por ${alerta.motivo.toLowerCase()} fuera del horario laboral: la selecciono en la cola y sigo, porque a esta hora la procesa el orquestador automático (R12).`
      : `Entró una alerta interna de Monitor por ${alerta.motivo.toLowerCase()}: la selecciono en la cola para empezar el proceso.`,
  };
};

/* ─── r2 · normaliza los campos de la transacción uno a uno ─── */
const r2: Guion = (c) => {
  const { transaccion: tx, alerta } = c.d;
  const campos = camposNormalizados(c.d);
  // Un tecleo dura al menos 300 ms reales (la duración del paso varía ±15 %).
  const tecleo = Math.min(0.2, 310 / c.duracion + 0.01);
  const ui: AccionUI[] = [{ t: 0, tipo: "estado", texto: "Normalizando los campos de la transacción…", nivel: "info" }];
  let t = 0.04;
  for (const campo of campos) {
    ui.push({ t, tipo: "clic", ancla: campo.ancla });
    if (campo.modo === "pegar") {
      ui.push(
        { t: t + 0.03, tipo: "pegar", ancla: campo.ancla, texto: campo.valor },
        { t: t + 0.03, tipo: "tecla", tecla: "Ctrl+V" },
      );
      t += 0.115;
    } else {
      ui.push({ t: t + 0.02, hasta: t + 0.02 + tecleo, tipo: "teclear", ancla: campo.ancla, texto: campo.valor });
      t += 0.04 + tecleo;
    }
  }
  ui.push({
    t: Math.min(0.94, t + 0.01),
    tipo: "estado",
    texto: `${tx.comercio} · ${tx.ciudad}, ${tx.pais} · ${formatPeso(tx.monto)} normalizados`,
    nivel: "ok",
  });
  return {
    vista: "monitor.detalle" as const,
    ui,
    pensamiento: `Paso los datos de la alerta de ${alerta.origen} (comercio, categoría, ubicación, monto y fecha) a un mismo formato para poder enrutarla y compararla.`,
  };
};

/* ─── r3 · enrutamiento por canal (R07 Visa / R08 Mastercard / alerta interna) ─── */
const r3: Guion = (c) => {
  const ruta = RUTAS.find((r) => r.clave === rutaDe(c.d)) ?? RUTAS[2];
  const { alerta } = c.d;
  const resultado =
    ruta.clave === "interna"
      ? "Alerta interna de Monitor · sin canal de red"
      : `Alerta de ${alerta.origen} enrutada por ${ruta.canal} (${ruta.regla})`;
  const ui: AccionUI[] = [
    { t: 0, tipo: "estado", texto: "Determinando el canal de la alerta…", nivel: "info" },
    { t: 0.05, tipo: "mover", ancla: "mon.chip.origen" },
    { t: 0.28, tipo: "mover", ancla: ruta.ancla },
    { t: T.r3.clicRuta, tipo: "clic", ancla: ruta.ancla },
    { t: T.r3.resuelto + 0.02, tipo: "estado", texto: resultado, nivel: "ok" },
  ];
  const pensamiento =
    c.franquicia === Franquicia.VISA
      ? "La alerta viene de VRM: por ser franquicia Visa la enruto por el canal Visa (R07)."
      : c.franquicia === Franquicia.MASTERCARD
        ? "La alerta viene de EMS/MS: por ser franquicia Mastercard la enruto por el canal Mastercard (R08)."
        : "Es una alerta interna de Monitor: no pasa por un canal de red, así que la clasifico como interna.";
  return { vista: "monitor.detalle" as const, ui, pensamiento };
};

/* ─── r4 · monto contra el patrón histórico del cliente (R06) ─── */
const r4: Guion = (c) => {
  const tx = c.d.transaccion;
  const esc = escalaPatron(c.d);
  const ui: AccionUI[] = [
    { t: 0, tipo: "estado", texto: "Comparando el monto contra el patrón histórico…", nivel: "info" },
    { t: 0.04, tipo: "mover", ancla: "mon.campo.monto" },
    { t: 0.04, hasta: 0.26, tipo: "resaltar", ancla: "mon.campo.monto", texto: "Monto de la alerta" },
    { t: T.r4.promedio[0] - 0.02, tipo: "mover", ancla: "mon.barra.promedio" },
    { t: T.r4.monto[0] - 0.02, tipo: "mover", ancla: "mon.barra.monto" },
  ];
  if (tx.atipico) {
    ui.push({
      t: T.r4.veredicto + 0.02,
      hasta: 0.98,
      tipo: "toast",
      texto: `Monto atípico: supera el patrón del cliente · WhatsApp con prioridad (R06)`,
      nivel: "aviso",
    });
  }
  ui.push({ t: T.r4.veredicto + 0.04, tipo: "mover", ancla: "mon.chip.patron" });
  ui.push({
    t: T.r4.prioridad + 0.03,
    tipo: "estado",
    texto: `${formatPeso(tx.monto)} ${tx.atipico ? "supera" : "está dentro del"} patrón (promedio ${formatPeso(tx.promedioHistorico)})${c.d.alerta.altoRiesgo ? " · alto riesgo" : ""}`,
    nivel: tx.atipico ? "aviso" : "ok",
  });
  return {
    vista: "monitor.detalle" as const,
    ui,
    pensamiento: tx.atipico
      ? `${formatPeso(tx.monto)} frente a un promedio de ${formatPeso(tx.promedioHistorico)}, cerca de ${Math.round(esc.veces)} veces lo habitual: lo marco atípico y priorizo el mensaje por WhatsApp (R06).`
      : `${formatPeso(tx.monto)} frente a un promedio de ${formatPeso(tx.promedioHistorico)}: está dentro del patrón del cliente, así que sigo sin prioridad especial.`,
  };
};

/* ─── i3 (solo sin_celular) · escala el caso a monitoreo manual (R01) ─── */
const i3: Guion = (c) => {
  const { alerta, analista } = c.d;
  const ui: AccionUI[] = [
    {
      t: 0,
      tipo: "estado",
      texto: "Sin celular vigente en CRM · valido el escalamiento a monitoreo manual",
      nivel: "aviso",
    },
    { t: 0.06, tipo: "mover", ancla: "mon.fila.alerta" },
    { t: T.i3.selecciona - 0.02, tipo: "clic", ancla: "mon.fila.alerta" },
    { t: 0.28, tipo: "mover", ancla: "mon.btn.escalar" },
    { t: T.i3.clicEscalar, tipo: "clic", ancla: "mon.btn.escalar" },
    {
      t: T.i3.escalada,
      hasta: 0.98,
      tipo: "toast",
      texto: `Alerta ${alerta.referencia} escalada a monitoreo manual (R01)`,
      nivel: "aviso",
    },
    { t: T.i3.escalada, tipo: "estado", texto: "Escalando a monitoreo manual…", nivel: "info" },
    {
      t: T.i3.casoEnCola + 0.02,
      tipo: "estado",
      texto: `Caso escalado · cola Monitoreo manual · analista ${analista.nombre}`,
      nivel: "ok",
    },
    { t: 0.68, tipo: "mover", ancla: "mon.fila.manual" },
    { t: 0.68, hasta: 1, tipo: "resaltar", ancla: "mon.fila.manual", texto: "Caso en la cola manual" },
  ];
  return {
    vista: "monitor.cola" as const,
    ui,
    pensamiento: `El titular no tiene celular vigente en CRM (R01): no puedo contactarlo por WhatsApp, así que escalo la alerta ${alerta.referencia} a monitoreo manual.`,
  };
};

/* ─── d4 · pantalla del analista de monitoreo (humano): contacta y decide Legítima o Fraude ─── */
const d4: Guion = (c) => {
  const d = c.d;
  const H = "humano" as const;
  const t = T.d4;
  const sinCelular = c.escenario === "sin_celular";
  const regla = sinCelular ? "R01" : "R05";
  const legitima = d.desenlace === "legitima";
  const decision = textoDecision(d);
  const contacto = contactoAnalista(d, c.escenario);
  const boton = legitima ? "mon.btn.legitima" : "mon.btn.fraude";
  const ui: AccionUI[] = [
    {
      t: 0.02,
      hasta: 0.16,
      tipo: "toast",
      texto: `Nuevo caso asignado · ${d.alerta.referencia} · ${formatPeso(d.transaccion.monto)}`,
      nivel: "info",
      actor: H,
    },
    {
      t: 0.04,
      tipo: "estado",
      texto: "Caso asignado a monitoreo manual · bloqueo preventivo vigente",
      nivel: "info",
      actor: H,
    },
    { t: 0.06, tipo: "mover", ancla: "mon.fila.caso", actor: H },
    { t: t.abre, tipo: "clic", ancla: "mon.fila.caso", actor: H },
    {
      t: t.abre + 0.06,
      tipo: "estado",
      texto: `Caso ${d.alerta.referencia} abierto · ${d.cliente.nombre} · ${formatPeso(d.transaccion.monto)}`,
      nivel: "info",
      actor: H,
    },
    { t: 0.24, tipo: "mover", ancla: "mon.btn.contactar", actor: H },
    { t: t.contacta, tipo: "clic", ancla: "mon.btn.contactar", actor: H },
    {
      t: t.contacta + 0.02,
      tipo: "estado",
      texto: sinCelular ? "Contactando al titular por canal alterno…" : `Llamando al titular · ${contacto.detalle}…`,
      nivel: "info",
      actor: H,
    },
    {
      t: t.contactado,
      tipo: "estado",
      texto: `Titular contactado · ${legitima ? "reconoce" : "no reconoce"} la compra`,
      nivel: "ok",
      actor: H,
    },
    { t: 0.62, tipo: "mover", ancla: boton, actor: H },
    { t: t.clicDecision, tipo: "clic", ancla: boton, actor: H },
    {
      t: t.dialogo[0],
      hasta: t.dialogo[1],
      tipo: "dialogo",
      actor: H,
      dialogo: {
        tipo: "confirmar",
        titulo: "Confirmar decisión",
        cuerpo: decision.cuerpo,
        botones: ["Confirmar", "Cancelar"],
        regla,
      },
    },
    { t: 0.8, tipo: "mover", ancla: "dlg.btn.confirmar", actor: H },
    { t: t.confirma, tipo: "clic", ancla: "dlg.btn.confirmar", actor: H },
    {
      t: t.registrada,
      tipo: "estado",
      texto: `Decisión registrada: ${decision.etiqueta} · ${d.alerta.referencia}`,
      nivel: "ok",
      actor: H,
    },
    {
      t: t.registrada + 0.01,
      hasta: 0.99,
      tipo: "toast",
      texto: `Decisión registrada · ${decision.etiqueta}`,
      nivel: "ok",
      actor: H,
    },
    { t: t.registrada + 0.02, tipo: "mover", ancla: "mon.chip.decision", actor: H },
  ];
  return {
    vista: "monitor.manual" as const,
    ui,
    pensamiento: sinCelular
      ? `Sin celular en CRM (R01), el caso lo decide ${d.analista.nombre} desde monitoreo manual: mantengo el bloqueo preventivo y espero su decisión.`
      : `El titular no respondió en ${d.hsm.slaMin} min (R05): mantengo el bloqueo preventivo mientras ${d.analista.nombre}, de monitoreo manual, lo contacta y decide.`,
  };
};

/* ─── g3 · replica la tipificación en el sistema de origen ─── */
const g3: Guion = (c) => {
  const { alerta } = c.d;
  const ui: AccionUI[] = [
    { t: 0, tipo: "estado", texto: `Preparando la replicación en ${alerta.origen}…`, nivel: "info" },
    { t: 0.05, tipo: "mover", ancla: "mon.btn.sincronizar" },
    { t: T.g3.clic, tipo: "clic", ancla: "mon.btn.sincronizar" },
    { t: T.g3.inicia, tipo: "estado", texto: `Sincronizando la tipificación en ${alerta.origen}…`, nivel: "info" },
    { t: 0.22, tipo: "mover", ancla: `mon.fila.${alerta.sistemaOrigen}` },
    { t: T.g3.fin + 0.02, tipo: "estado", texto: `Tipificación replicada en ${alerta.origen}`, nivel: "ok" },
    {
      t: T.g3.fin + 0.02,
      hasta: 0.98,
      tipo: "toast",
      texto: `Tipificación replicada en ${alerta.origen}`,
      nivel: "ok",
    },
  ];
  return {
    vista: "monitor.sync" as const,
    ui,
    pensamiento: `Con el caso ya tipificado en CRM, replico la tipificación en ${alerta.origen}, el sistema de donde llegó la alerta, para que el origen quede cerrado.`,
  };
};

/** Guiones de la ventana «monitor». Claves: id de paso o `${franquicia}:${id}`. */
export const monitor: Guiones = {
  "MONITOR:r1": r1,
  r2,
  r3,
  r4,
  i3,
  d4,
  g3,
};
