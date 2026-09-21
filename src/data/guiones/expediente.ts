/**
 * Guion de la ventana «expediente» (trazabilidad 24/7): g5 consolida una a una las secciones del expediente
 * digital, pega el sello SHA-256 y redacta el acta de cierre. Las secciones, las anclas y los instantes
 * compartidos con la ventana viven en `expediente-datos.ts`.
 */
import type { AccionUI } from "@/types/agentes";
import type { Guion, Guiones } from "./tipos";
import {
  ANCLA_ACTA,
  ANCLA_HASH,
  ANCLA_SELLAR,
  PASO_SECCION,
  SECCIONES_EXPEDIENTE,
  T_G5,
  anclaFila,
  tSeccion,
} from "./expediente-datos";

const g5: Guion = ({ d }) => {
  const hash = d.expediente.hash;
  const ui: AccionUI[] = [
    { t: 0, tipo: "ventana", vista: "expediente.acta" },
    { t: 0.02, tipo: "estado", texto: "Consolidando bitácora y evidencias…", nivel: "info" },
    // El cursor recorre las secciones; cada una se marca como consolidada al llegar la siguiente.
    ...SECCIONES_EXPEDIENTE.map<AccionUI>((s, i) => ({
      t: tSeccion(i),
      hasta: tSeccion(i) + PASO_SECCION,
      tipo: "mover",
      ancla: anclaFila(s.slug),
    })),
    { t: T_G5.calculo, tipo: "estado", texto: "Calculando el sello SHA-256…", nivel: "info" },
    { t: T_G5.hash, tipo: "clic", ancla: ANCLA_HASH },
    { t: T_G5.pegar, hasta: T_G5.pegar + 0.06, tipo: "tecla", tecla: "Ctrl+V" },
    { t: T_G5.pegar, tipo: "pegar", ancla: ANCLA_HASH, texto: hash },
    { t: T_G5.sellar - 0.02, hasta: T_G5.sellar, tipo: "mover", ancla: ANCLA_SELLAR },
    { t: T_G5.sellar, tipo: "clic", ancla: ANCLA_SELLAR },
    { t: T_G5.sello, tipo: "toast", texto: "Expediente sellado y archivado", nivel: "ok" },
    { t: T_G5.sello, tipo: "estado", texto: `SHA-256 ${hash.slice(0, 12)}… · ${d.expediente.numero}`, nivel: "ok" },
    { t: 0.8, tipo: "mover", ancla: ANCLA_ACTA },
  ];
  return {
    vista: "expediente.acta",
    ui,
    pensamiento: `Sello el expediente ${d.expediente.numero} con SHA-256: la operación 24/7 (R12) exige que cada decisión quede trazable y verificable sin volver a abrir ningún sistema.`,
  };
};

/** Guiones de la ventana «expediente». Claves: id de paso. */
export const expediente: Guiones = { g5 };
