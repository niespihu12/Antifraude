/**
 * Guiones de la ventana «ppe» (ERP clásico de bloqueos y desbloqueos de tarjeta): consulta del estado de la
 * tarjeta (d2) y formulario «Gestión de bloqueo» (r5, d3_*, d5_*), que termina en el comprobante de la operación.
 * Cada guion es una función pura del contexto del paso: devuelve la vista, las acciones ordenadas por `t` y el
 * pensamiento del agente. Las anclas viven en `ppe-datos.ts` (`A`) y las pinta `ventana-ppe.tsx`.
 */
import type { AccionUI, DialogoUI, NivelUI, Vista } from "@/types/agentes";
import type { CtxGuion, Guion, Guiones } from "./tipos";
import { A, T_D2, alertaId, bloqueoId, operacionDe, type IdOperacion } from "./ppe-datos";

/* ─── Constructores de acciones ─── */
const ventana = (vista: Vista, t = 0): AccionUI => ({ t, tipo: "ventana", vista });
const mover = (t: number, ancla: string, hasta?: number): AccionUI => ({
  t,
  tipo: "mover",
  ancla,
  ...(hasta !== undefined ? { hasta } : {}),
});
const clic = (t: number, ancla: string): AccionUI => ({ t, tipo: "clic", ancla });
const tecla = (t: number, k: string, hasta?: number): AccionUI => ({
  t,
  tipo: "tecla",
  tecla: k,
  ...(hasta !== undefined ? { hasta } : {}),
});
const teclear = (t: number, hasta: number, ancla: string, texto: string): AccionUI => ({
  t,
  hasta,
  tipo: "teclear",
  ancla,
  texto,
});
const pegar = (t: number, ancla: string, texto: string): AccionUI => ({ t, tipo: "pegar", ancla, texto });
const estado = (t: number, texto: string, nivel: NivelUI = "info"): AccionUI => ({ t, tipo: "estado", texto, nivel });
const resaltar = (t: number, hasta: number, ancla: string): AccionUI => ({ t, hasta, tipo: "resaltar", ancla });
const toast = (t: number, texto: string, nivel: NivelUI): AccionUI => ({ t, tipo: "toast", texto, nivel });
const dialogo = (t: number, hasta: number, d: DialogoUI): AccionUI => ({ t, hasta, tipo: "dialogo", dialogo: d });

const BTN_CONFIRMAR = "dlg.btn.confirmar";

/* ═══════════════ d2 · Consulta del estado de la tarjeta ═══════════════ */
const d2: Guion = ({ d }) => {
  const u4 = d.tarjeta.ultimos4;
  const blq = d.ppe.bloqueoTemporal;
  const ui: AccionUI[] = [
    ventana("ppe.consulta"),
    tecla(0.03, "F2", 0.09),
    clic(0.1, A.tarjeta),
    teclear(0.12, 0.48, A.tarjeta, d.tarjeta.mascara),
    tecla(T_D2.enter, "Enter", T_D2.enter + 0.06),
    estado(T_D2.enter + 0.02, `Consultando ····${u4}…`, "info"),
    resaltar(T_D2.resultado, 0.92, A.panelBloqueos),
    estado(T_D2.resultado, blq ? `${blq.id} activo` : "Tarjeta operativa", blq ? "aviso" : "ok"),
    mover(0.7, A.filaBloqueo),
  ];
  return {
    vista: "ppe.consulta",
    ui,
    pensamiento: blq
      ? `Consulto la tarjeta ····${u4} en PPE: sigue con el bloqueo temporal ${blq.id} que Recepción aplicó por R02 al llegar la alerta, así que mi decisión debe levantarlo o volverlo definitivo.`
      : `Consulto la tarjeta ····${u4} en PPE: no tiene bloqueos y está operativa, así que cualquier decisión parte de una tarjeta sin restricciones.`,
  };
};

/* ═══════════════ Formulario «Gestión de bloqueo» ═══════════════ */
interface Plantilla {
  /** F2 (buscar la tarjeta y su bloqueo vigente) o F3 (nueva solicitud de bloqueo). */
  inicio: "F2" | "F3";
  /** Compromiso irreversible o excepción: un único diálogo de confirmación antes de aplicar. */
  dialogo?: DialogoUI;
  /** Mensaje de éxito (toast) al abrir el comprobante. */
  toast: string;
  /** Resultado de la consulta de la tarjeta, en la barra de estado. */
  consulta: { texto: string; nivel: NivelUI };
  pensamiento: string;
}

/**
 * Formulario de operación: F2/F3, tarjeta tecleada (≥ 300 ms), consulta, tipo y motivo (clic en la lista),
 * referencia pegada (Ctrl+V), Aplicar (F9), diálogo opcional y cambio al comprobante en t = 0.8.
 */
function guionOperacion(c: CtxGuion, cfg: Plantilla): ReturnType<Guion> {
  const { d } = c;
  const id = c.id as IdOperacion;
  const u4 = d.tarjeta.ultimos4;
  const conDialogo = !!cfg.dialogo;
  // Tiempos como fracción del paso (el tecleo de la tarjeta dura ≥ 390 ms con la duración mínima del paso).
  const T = conDialogo
    ? {
        tecla: 0.02,
        clicTarjeta: 0.07,
        tecIni: 0.08,
        tecFin: 0.29,
        enter: 0.3,
        consulta: 0.38,
        tipo: 0.42,
        motivo: 0.49,
      }
    : {
        tecla: 0.02,
        clicTarjeta: 0.08,
        tecIni: 0.09,
        tecFin: 0.33,
        enter: 0.35,
        consulta: 0.43,
        tipo: 0.47,
        motivo: 0.54,
      };
  const tRef = conDialogo ? 0.55 : 0.61;
  const tAplicar = conDialogo ? 0.6 : 0.68;
  const tF9 = conDialogo ? 0.63 : 0.72;
  const tFin = 0.8;
  const ui: AccionUI[] = [
    ventana("ppe.bloqueo"),
    tecla(T.tecla, cfg.inicio, T.tecla + 0.06),
    clic(T.clicTarjeta, A.tarjeta),
    teclear(T.tecIni, T.tecFin, A.tarjeta, d.tarjeta.mascara),
    tecla(T.enter, cfg.inicio === "F2" ? "Enter" : "Tab", T.enter + 0.06),
    estado(T.enter + 0.01, cfg.inicio === "F2" ? `Consultando ····${u4}…` : `Cargando ····${u4}…`, "info"),
    estado(T.consulta, cfg.consulta.texto, cfg.consulta.nivel),
    resaltar(T.consulta, T.consulta + 0.08, A.bloqueo),
    clic(T.tipo, A.tipo),
    clic(T.motivo, A.motivo),
    clic(tRef, A.referencia),
    tecla(tRef + 0.01, "Ctrl+V", tRef + 0.05),
    pegar(tRef + 0.01, A.referencia, alertaId(d)),
    mover(tAplicar, A.aplicar, tAplicar + 0.04),
    tecla(tF9, "F9", tF9 + 0.06),
  ];
  if (cfg.dialogo) {
    ui.push(
      dialogo(0.64, tFin, cfg.dialogo),
      mover(0.68, BTN_CONFIRMAR, 0.72),
      clic(0.73, BTN_CONFIRMAR),
      estado(0.75, "Aplicando en PPE…", "info"),
    );
  } else {
    ui.push(estado(0.74, "Aplicando en PPE…", "info"));
  }
  ui.push(
    ventana("ppe.confirmacion", tFin),
    toast(tFin, cfg.toast, "ok"),
    estado(tFin, id === "r5" ? "Bloqueo registrado" : "Operación registrada", "ok"),
    mover(0.86, A.comprobante),
    resaltar(0.86, 1, A.comprobante),
  );
  return { vista: "ppe.bloqueo", ui: ordenar(ui), pensamiento: cfg.pensamiento };
}

/** El motor lee las acciones de la última a la primera: deben quedar ordenadas por `t` (orden estable). */
function ordenar(ui: AccionUI[]): AccionUI[] {
  return ui.sort((a, b) => a.t - b.t);
}

/* ─── Guiones por paso ─── */
const r5: Guion = (c) => {
  const { d } = c;
  const blq = d.ppe.bloqueoTemporal;
  const u4 = d.tarjeta.ultimos4;
  return guionOperacion(c, {
    inicio: "F3",
    toast: `Bloqueo preventivo aplicado · ${blq?.id ?? bloqueoId(d)}`,
    consulta: { texto: "Tarjeta operativa", nivel: "info" },
    pensamiento: `Alerta de alto riesgo: aplico R02 y bloqueo de inmediato la tarjeta ····${u4} en PPE con un bloqueo preventivo, sin esperar la respuesta del titular.`,
  });
};

const d3_desbloqueo: Guion = (c) => {
  const { d } = c;
  const blq = d.ppe.bloqueoTemporal;
  const u4 = d.tarjeta.ultimos4;
  if (!blq) {
    return guionOperacion(c, {
      inicio: "F2",
      toast: `Tarjeta ····${u4} operativa · restricción liberada`,
      consulta: { texto: "Sin bloqueos vigentes", nivel: "ok" },
      pensamiento: `El titular confirmó «Sí fui yo» y la tarjeta ya estaba operativa: por R03 solo confirmo que no queda ninguna restricción sobre la transacción y sigo a la tipificación.`,
    });
  }
  return guionOperacion(c, {
    inicio: "F2",
    dialogo: {
      tipo: "confirmar",
      titulo: "Confirmar desbloqueo",
      cuerpo: `¿Levantar el bloqueo ${blq.id} de la tarjeta ····${u4}?\nLa tarjeta quedará operativa de inmediato.`,
      botones: ["Confirmar", "Cancelar"],
      regla: "R03",
    },
    toast: `Bloqueo ${blq.id} levantado · tarjeta operativa`,
    consulta: { texto: `${blq.id} vigente`, nivel: "aviso" },
    pensamiento: `El titular confirmó «Sí fui yo»: por R03 levanto el bloqueo ${blq.id} y dejo la tarjeta ····${u4} operativa, como pide el procedimiento tras una confirmación.`,
  });
};

const d3_definitivo: Guion = (c) => {
  const { d } = c;
  const u4 = d.tarjeta.ultimos4;
  const blq = d.ppe.bloqueoTemporal;
  return guionOperacion(c, {
    inicio: "F2",
    dialogo: {
      tipo: "confirmar",
      titulo: "Confirmar bloqueo definitivo",
      cuerpo: `Se inhabilitará la tarjeta ····${u4} de forma definitiva y se solicitará la reposición.\nEsta acción no se puede deshacer.`,
      botones: ["Confirmar", "Cancelar"],
      regla: "R04",
    },
    toast: `Tarjeta ····${u4} inhabilitada · bloqueo definitivo`,
    consulta: blq ? { texto: `${blq.id} vigente`, nivel: "aviso" } : { texto: "Sin bloqueos vigentes", nivel: "ok" },
    pensamiento: `El titular respondió «No fui yo»: aplico R04 y bloqueo de forma definitiva la tarjeta ····${u4}; es irreversible, por eso PPE me pide confirmarlo antes de aplicar.`,
  });
};

const d3_preventivo: Guion = (c) => {
  const { d } = c;
  const u4 = d.tarjeta.ultimos4;
  const blq = d.ppe.bloqueoTemporal;
  const sinCelular = c.escenario === "sin_celular";
  const verbo = blq ? "mantengo" : "aplico";
  return guionOperacion(c, {
    inicio: "F2",
    toast: blq ? `Bloqueo preventivo mantenido · ${blq.id}` : `Bloqueo preventivo aplicado · ${bloqueoId(d)}`,
    consulta: blq ? { texto: `${blq.id} vigente`, nivel: "aviso" } : { texto: "Sin bloqueos vigentes", nivel: "info" },
    pensamiento: sinCelular
      ? `No hay celular con el que confirmar: por R02 ${verbo} el bloqueo preventivo en la tarjeta ····${u4} mientras un analista de monitoreo decide el caso.`
      : `Pasaron ${d.hsm.slaMin} minutos sin respuesta: por R05 ${verbo} el bloqueo preventivo en la tarjeta ····${u4} y dejo la decisión al analista de monitoreo.`,
  });
};

const d5_desbloqueo: Guion = (c) => {
  const { d } = c;
  const u4 = d.tarjeta.ultimos4;
  const regla = operacionDe("d5_desbloqueo", d, c.escenario).regla;
  return guionOperacion(c, {
    inicio: "F2",
    dialogo: {
      tipo: "confirmar",
      titulo: "Confirmar desbloqueo",
      cuerpo: `¿Levantar el bloqueo ${bloqueoId(d)} de la tarjeta ····${u4}?\nDecisión de ${d.analista.nombre}: compra legítima.`,
      botones: ["Confirmar", "Cancelar"],
      regla,
    },
    toast: `Bloqueo ${bloqueoId(d)} levantado · tarjeta operativa`,
    consulta: { texto: `${bloqueoId(d)} vigente`, nivel: "aviso" },
    pensamiento: `${d.analista.nombre} confirmó que la compra es legítima tras la revisión manual que abrió ${regla}: levanto el bloqueo preventivo ${bloqueoId(d)} y dejo la tarjeta ····${u4} operativa.`,
  });
};

const d5_definitivo: Guion = (c) => {
  const { d } = c;
  const u4 = d.tarjeta.ultimos4;
  const regla = operacionDe("d5_definitivo", d, c.escenario).regla;
  return guionOperacion(c, {
    inicio: "F2",
    dialogo: {
      tipo: "confirmar",
      titulo: "Confirmar bloqueo definitivo",
      cuerpo: `Se inhabilitará la tarjeta ····${u4} de forma definitiva.\nDecisión de ${d.analista.nombre}: fraude confirmado. No se puede deshacer.`,
      botones: ["Confirmar", "Cancelar"],
      regla,
    },
    toast: `Tarjeta ····${u4} inhabilitada · bloqueo definitivo`,
    consulta: { texto: `${bloqueoId(d)} vigente`, nivel: "aviso" },
    pensamiento: `${d.analista.nombre} confirmó el fraude en la revisión manual que abrió ${regla}: convierto el bloqueo preventivo en definitivo sobre la tarjeta ····${u4}; es irreversible y queda registrado con su referencia.`,
  });
};

/** Guiones de la ventana «ppe». Claves: id de paso. */
export const ppe: Guiones = { r5, d2, d3_desbloqueo, d3_definitivo, d3_preventivo, d5_desbloqueo, d5_definitivo };
