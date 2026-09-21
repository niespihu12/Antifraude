/**
 * Guiones de la ventana «revision»: listas de chequeo «ítem por ítem» de identificación (i2, 4 controles)
 * y de riesgo (d1, 4 controles). La pantalla ES la revisión: cada control pasa de pendiente a
 * «revisando» y termina en ✓ superado, ⚠ aviso, ✗ no superado o «no aplica». El cursor apunta a cada fila.
 *
 * Anclas de la ventana (data-ancla="rev.<tipo>.<nombre>"):
 *  rev.fila.<id del control>  (identificación: cliente · celular · dispositivo · ubicacion;
 *                              riesgo: monto · patron · comercio · cardinal) · rev.resumen
 * Los tiempos de cada control se exportan: la ventana los usa para pintar el estado según el progreso.
 */
import type { AccionUI, ControlChequeo, DatosCaso, NivelUI, Vista } from "@/types/agentes";
import type { CtxGuion, Guion, Guiones } from "./tipos";

/* ─── Línea de tiempo compartida con la ventana ─── */
/** Instante (0–1 del paso) en que el agente empieza a revisar el control k. */
export const inicioControl = (k: number): number => 0.06 + 0.19 * k;
/** Un control que no aplica solo se «mira»: se resuelve casi de inmediato. */
export const finControl = (c: ControlChequeo, k: number): number => inicioControl(k) + (c.noAplica ? 0.04 : 0.15);
/** Momento en que aparece el resumen de la revisión. */
export const T_RESUMEN = 0.84;

export type ResultadoControl = "ok" | "aviso" | "falla" | "na";
export type EstadoControl = "pendiente" | "revisando" | ResultadoControl;

export function resultadoControl(c: ControlChequeo): ResultadoControl {
  if (c.noAplica) return "na";
  if (!c.ok) return "falla";
  return c.aviso ? "aviso" : "ok";
}

/** Estado del control k en el progreso p del paso y avance (0–1) de la revisión mientras está «revisando». */
export function estadoControl(c: ControlChequeo, k: number, p: number): { estado: EstadoControl; sub: number } {
  const ini = inicioControl(k);
  const fin = finControl(c, k);
  if (p < ini) return { estado: "pendiente", sub: 0 };
  if (p < fin) return { estado: "revisando", sub: (p - ini) / (fin - ini) };
  return { estado: resultadoControl(c), sub: 1 };
}

export interface ResumenRevision {
  texto: string;
  nivel: NivelUI;
  /** Controles con aviso (no bloquean). */
  avisos: number;
  /** Regla que hace escalar el caso (solo si algún control falla). */
  regla?: string;
}

/** Resumen de identificación: el mismo criterio que el resultado del paso i2 en `generarPlan`. */
export function resumenIdentificacion(d: DatosCaso): ResumenRevision {
  const total = d.identificacion.length;
  const fallos = d.identificacion.filter((x) => !x.ok);
  const avisos = d.identificacion.filter((x) => x.ok && x.aviso).length;
  if (fallos.length === 0) return { texto: `${total}/${total} controles superados`, nivel: "ok", avisos };
  const regla = fallos.find((x) => x.regla)?.regla ?? "R01";
  return {
    texto: `${total - fallos.length}/${total} · escalar a monitoreo manual (${regla})`,
    nivel: "error",
    avisos,
    regla,
  };
}

/** Resumen de riesgo: el mismo texto que el resultado del paso d1 en `generarPlan`. */
export function resumenRiesgo(d: DatosCaso): ResumenRevision {
  const avisos = d.riesgo.filter((x) => x.aviso).length;
  const nivel: NivelUI = avisos > 0 ? "aviso" : "ok";
  const texto =
    d.scoreCardinal !== null
      ? `4/4 revisados · score Cardinal ${d.scoreCardinal}/100 · ${avisos} con aviso`
      : `3/3 aplicables · ${avisos} con aviso · Cardinal no aplica (solo Visa)`;
  return { texto, nivel, avisos };
}

const NIVEL_RESULTADO: Record<ResultadoControl, NivelUI> = { ok: "ok", aviso: "aviso", falla: "error", na: "info" };

/** Texto que la barra de estado deja al terminar de revisar un control. */
function textoResultado(c: ControlChequeo): string {
  const r = resultadoControl(c);
  const regla = c.regla && (r === "falla" || r === "aviso") ? ` (${c.regla})` : "";
  switch (r) {
    case "falla":
      return `${c.nombre} · no superado${regla}`;
    case "aviso":
      return `${c.nombre} · superado con aviso${regla}`;
    case "na":
      return `${c.nombre} · no aplica`;
    default:
      return `${c.nombre} · superado`;
  }
}

/** Recorre los controles uno tras otro: el cursor apunta a cada fila y la barra de estado va cantando el avance. */
function recorrido(vista: Vista, controles: ControlChequeo[], resumen: ResumenRevision): AccionUI[] {
  const n = controles.length;
  const ui: AccionUI[] = [{ t: 0, tipo: "ventana", vista }];
  controles.forEach((x, k) => {
    const ini = inicioControl(k);
    ui.push(
      { t: ini, tipo: "mover", ancla: `rev.fila.${x.id}` },
      { t: ini, tipo: "estado", texto: `Control ${k + 1}/${n} · ${x.nombre}…`, nivel: "info" },
      { t: finControl(x, k), tipo: "estado", texto: textoResultado(x), nivel: NIVEL_RESULTADO[resultadoControl(x)] },
    );
  });
  ui.push(
    { t: T_RESUMEN, tipo: "mover", ancla: "rev.resumen" },
    { t: T_RESUMEN, tipo: "estado", texto: resumen.texto, nivel: resumen.nivel },
    { t: T_RESUMEN, hasta: 1, tipo: "resaltar", ancla: "rev.resumen" },
  );
  return ui;
}

const identificacion: Guion = (c: CtxGuion) => {
  const { d } = c;
  const resumen = resumenIdentificacion(d);
  const sinCelular = d.cliente.celular === null;
  return {
    vista: "revision.identificacion",
    ui: recorrido("revision.identificacion", d.identificacion, resumen),
    pensamiento: resumen.regla
      ? sinCelular
        ? `Reviso los 4 controles de identificación: el titular no tiene celular registrado en CRM, así que aplico ${resumen.regla}: el control falla y escalo el caso a monitoreo manual.`
        : `Reviso los 4 controles de identificación: el celular de CRM está desactualizado (última actualización ${d.cliente.fechaActualizacion}), aplico ${resumen.regla}: el control falla y escalo el caso a monitoreo manual.`
      : `Repaso los 4 controles de identificación uno por uno: titular, celular vigente (R01), dispositivo y ubicación${resumen.avisos > 0 ? "; los avisos no bloquean" : ""} y puedo contactar al cliente.`,
  };
};

const riesgo: Guion = (c: CtxGuion) => {
  const { d } = c;
  const resumen = resumenRiesgo(d);
  const visa = d.scoreCardinal !== null;
  const monto = d.transaccion.atipico
    ? "el monto supera el patrón histórico del cliente (R06, aviso)"
    : "el monto está dentro del patrón histórico";
  const cardinal = visa
    ? `consulto el score Cardinal (${d.scoreCardinal}/100)`
    : "Cardinal no aplica porque solo valida Visa";
  return {
    vista: "revision.riesgo",
    ui: recorrido("revision.riesgo", d.riesgo, resumen),
    pensamiento: `Repaso los 4 controles de riesgo uno por uno: ${monto}, luego su historial y el comercio, y ${cardinal}.`,
  };
};

export const revision: Guiones = {
  i2: identificacion,
  d1: riesgo,
};
