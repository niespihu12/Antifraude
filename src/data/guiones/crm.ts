/**
 * Guiones de la ventana «crm» (CRM Banco, ERP de escritorio con teclas F): consulta del titular (i1),
 * tipificación y cierre del caso (g1, g2) y perfil de bajo riesgo (g4). Cada guion es una función pura
 * del contexto del paso: devuelve la vista, las acciones ordenadas por `t` y el pensamiento del agente.
 *
 * Anclas de la ventana (data-ancla="crm.<tipo>.<nombre>"):
 *  crm.cliente:      crm.menu.clientes · crm.campo.cedula · crm.btn.buscar · crm.ficha.celular ·
 *                    crm.ficha.actualizacion · crm.ficha.tarjeta · crm.fila.hist.<i>
 *  crm.tipificacion: crm.menu.casos · crm.campo.caso · crm.campo.alerta · crm.campo.categoria ·
 *                    crm.fila.categoria.<legitima|fraude|sin-respuesta> · crm.campo.causa ·
 *                    crm.btn.guardar · crm.btn.cerrar
 *  perfil (g4):      crm.ficha.desbloqueos · crm.fila.perfil.estandar · crm.btn.bajo-riesgo · crm.btn.guardar
 * Los tiempos de cada paso (fracción 0–1) se exportan: la ventana los usa para pintar lo que ya ocurrió.
 */
import type { AccionUI, DialogoUI, NivelUI, Vista } from "@/types/agentes";
import { slugAncla } from "@/data/agentes-util";
import type { Guion, Guiones } from "./tipos";

/* ─── Constructores de acciones ─── */
const ventana = (vista: Vista, t = 0): AccionUI => ({ t, tipo: "ventana", vista });
const mover = (t: number, ancla: string): AccionUI => ({ t, tipo: "mover", ancla });
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
const toast = (t: number, texto: string, nivel: NivelUI, hasta?: number): AccionUI => ({
  t,
  tipo: "toast",
  texto,
  nivel,
  ...(hasta !== undefined ? { hasta } : {}),
});
const dialogo = (t: number, hasta: number, d: DialogoUI): AccionUI => ({ t, hasta, tipo: "dialogo", dialogo: d });
/** Ctrl+V y el pegado sobre el mismo campo. */
const pegarCtrlV = (t: number, ancla: string, texto: string): AccionUI[] => [
  tecla(t, "Ctrl+V", t + 0.05),
  pegar(t, ancla, texto),
];

/** Duración de un clic (fracción del paso): la selección se pinta cuando termina. */
export const CLIC = 0.05;

/* ─── Tiempos de cada paso (fracción 0–1): la ventana y el guion comparten estas constantes ─── */
/** i1 · Consulta del titular (1800 ms). */
export const T_I1 = {
  menu: 0.02,
  f2: 0.07,
  campo: 0.12,
  tecleoIni: 0.15,
  tecleoFin: 0.45,
  enter: 0.47,
  consulta: 0.49,
  ficha: 0.58,
  celular: 0.62,
  histFin: 0.78,
  clicHist: 0.84,
  fin: 0.93,
} as const;

/** g1 · Tipificación normal (2600 ms). */
export const T_G1 = {
  menu: 0.02,
  f2: 0.05,
  campo: 0.09,
  tecleoIni: 0.11,
  tecleoFin: 0.29,
  enter: 0.31,
  consulta: 0.32,
  abierto: 0.38,
  clicCat: 0.42,
  clicCausa: 0.54,
  pegar: 0.56,
  f9: 0.68,
  guardando: 0.69,
  guardado: 0.75,
  clicCerrar: 0.82,
  cerrado: 0.87,
} as const;

/** g1 en «sin_tipificar»: el CRM rechaza el cierre (R11) (2000 ms). */
export const T_G1_RECHAZO = {
  menu: 0.02,
  f2: 0.06,
  campo: 0.1,
  tecleoIni: 0.12,
  tecleoFin: 0.34,
  enter: 0.36,
  consulta: 0.37,
  abierto: 0.44,
  clicCerrar: 0.52,
  dialogo: 0.58,
  clicAceptar: 0.84,
  dialogoFin: 0.9,
} as const;

/** g2 · Tipificación obligatoria tras el rechazo (2600 ms). El caso ya está abierto. */
export const T_G2 = {
  clicCat: 0.1,
  clicCausa: 0.3,
  pegar: 0.32,
  f9: 0.52,
  guardando: 0.53,
  guardado: 0.6,
  clicCerrar: 0.72,
  cerrado: 0.77,
} as const;

/** g4 · Perfil de bajo riesgo (1600 ms). */
export const T_G4 = {
  contador: 0.04,
  contadorFin: 0.4,
  clicBajo: 0.46,
  f9: 0.62,
  guardando: 0.63,
  guardado: 0.7,
} as const;

/* ═══════════════ Guiones ═══════════════ */

/** Tipificación normal (g1 sin escenario «sin_tipificar»). */
const guionTipificacion: Guion = (c) => {
  const T = T_G1;
  const reg = c.d.registro;
  return {
    vista: "crm.tipificacion",
    ui: [
      ventana("crm.tipificacion"),
      mover(T.menu, "crm.menu.casos"),
      tecla(T.f2, "F2"),
      clic(T.campo, "crm.campo.caso"),
      teclear(T.tecleoIni, T.tecleoFin, "crm.campo.caso", reg.casoCrm),
      tecla(T.enter, "Enter"),
      estado(T.consulta, "Abriendo caso…", "info"),
      estado(T.abierto, `Caso abierto · ${reg.casoCrm}`, "info"),
      clic(T.clicCat, `crm.fila.categoria.${slugAncla(reg.categoria)}`),
      clic(T.clicCausa, "crm.campo.causa"),
      ...pegarCtrlV(T.pegar, "crm.campo.causa", reg.causa),
      tecla(T.f9, "F9"),
      estado(T.guardando, "Guardando tipificación…", "info"),
      toast(T.guardado, "Caso tipificado", "ok", 0.95),
      estado(T.guardado, `Tipificado · ${reg.categoria} · ${reg.casoCrm}`, "ok"),
      clic(T.clicCerrar, "crm.btn.cerrar"),
      estado(T.cerrado, `Caso cerrado · ${reg.casoCrm}`, "ok"),
    ],
    pensamiento: `Abro el caso ${reg.casoCrm} en CRM, lo tipifico como ${reg.categoria.toLowerCase()} y lo cierro: sin tipificación CRM bloquea el cierre (R11).`,
  };
};

/** g1 con el escenario «sin_tipificar»: el agente cierra sin categoría y el CRM lo rechaza (R11). */
const guionRechazo: Guion = (c) => {
  const T = T_G1_RECHAZO;
  const reg = c.d.registro;
  return {
    vista: "crm.tipificacion",
    ui: [
      ventana("crm.tipificacion"),
      mover(T.menu, "crm.menu.casos"),
      tecla(T.f2, "F2"),
      clic(T.campo, "crm.campo.caso"),
      teclear(T.tecleoIni, T.tecleoFin, "crm.campo.caso", reg.casoCrm),
      tecla(T.enter, "Enter"),
      estado(T.consulta, "Abriendo caso…", "info"),
      estado(T.abierto, `Caso abierto · ${reg.casoCrm}`, "aviso"),
      clic(T.clicCerrar, "crm.btn.cerrar"),
      estado(T.dialogo, "Cierre rechazado · R11", "error"),
      dialogo(T.dialogo, T.dialogoFin, {
        tipo: "error",
        titulo: "No se puede cerrar el caso sin tipificación",
        cuerpo: `El caso ${reg.casoCrm} no tiene categoría de cierre ni causa. Regístrelas antes de cerrarlo.`,
        regla: "R11",
        botones: ["Aceptar"],
      }),
      clic(T.clicAceptar, "dlg.btn.aceptar"),
      mover(0.92, `crm.fila.categoria.${slugAncla(reg.categoria)}`),
    ],
    pensamiento: `Intento cerrar el caso ${reg.casoCrm} sin tipificar y CRM lo rechaza: aplico R11, el cierre queda bloqueado hasta que registre la categoría.`,
  };
};

export const crm: Guiones = {
  i1: (c) => {
    const T = T_I1;
    const cli = c.d.cliente;
    const celularOk = c.d.identificacion.find((x) => x.id === "celular")?.ok !== false;
    return {
      vista: "crm.cliente",
      ui: [
        ventana("crm.cliente"),
        mover(T.menu, "crm.menu.clientes"),
        tecla(T.f2, "F2"),
        clic(T.campo, "crm.campo.cedula"),
        teclear(T.tecleoIni, T.tecleoFin, "crm.campo.cedula", cli.cedula),
        tecla(T.enter, "Enter"),
        estado(T.consulta, "Consultando titular…", "info"),
        estado(T.ficha, "Titular encontrado · 1 registro", "ok"),
        mover(T.celular, "crm.ficha.celular"),
        resaltar(T.celular, T.histFin, "crm.ficha.celular"),
        clic(T.clicHist, "crm.fila.hist.0"),
        estado(
          T.fin,
          celularOk
            ? `Titular verificado · ${cli.nombre} · CC ${cli.cedula}`
            : `Celular sin vigencia · ${cli.nombre} · CC ${cli.cedula}`,
          celularOk ? "ok" : "aviso",
        ),
      ],
      pensamiento: celularOk
        ? `Busco a ${cli.primerNombre} por su cédula en CRM Banco: traigo su ficha, su celular vigente para contactarlo por WhatsApp (R01) y su historial de alertas.`
        : `Busco a ${cli.primerNombre} por su cédula en CRM Banco y su celular no está vigente en la ficha: lo anoto para la revisión, donde R01 decide.`,
    };
  },

  g1: (c) => (c.escenario === "sin_tipificar" ? guionRechazo(c) : guionTipificacion(c)),

  g2: (c) => {
    const T = T_G2;
    const reg = c.d.registro;
    return {
      vista: "crm.tipificacion",
      ui: [
        ventana("crm.tipificacion"),
        estado(0, `Caso abierto · falta tipificar (R11)`, "aviso"),
        mover(0.04, `crm.fila.categoria.${slugAncla(reg.categoria)}`),
        clic(T.clicCat, `crm.fila.categoria.${slugAncla(reg.categoria)}`),
        clic(T.clicCausa, "crm.campo.causa"),
        ...pegarCtrlV(T.pegar, "crm.campo.causa", reg.causa),
        tecla(T.f9, "F9"),
        estado(T.guardando, "Guardando tipificación…", "info"),
        toast(T.guardado, "Caso tipificado", "ok", 0.9),
        estado(T.guardado, `Tipificado · ${reg.categoria} · ${reg.casoCrm}`, "ok"),
        clic(T.clicCerrar, "crm.btn.cerrar"),
        estado(T.cerrado, `Caso cerrado · ${reg.casoCrm}`, "ok"),
      ],
      pensamiento: `Registro la categoría (${reg.categoria.toLowerCase()}) y la causa que R11 exige, guardo con F9 y ahora sí cierro el caso ${reg.casoCrm}.`,
    };
  },

  g4: (c) => {
    const T = T_G4;
    const cli = c.d.cliente;
    return {
      vista: "crm.tipificacion",
      ui: [
        ventana("crm.tipificacion"),
        estado(0, "Evaluando perfil de riesgo…", "info"),
        mover(T.contador, "crm.ficha.desbloqueos"),
        resaltar(T.contador, T.contadorFin, "crm.ficha.desbloqueos"),
        clic(T.clicBajo, "crm.btn.bajo-riesgo"),
        estado(T.clicBajo + 0.05, "Perfil «Bajo riesgo» seleccionado", "info"),
        tecla(T.f9, "F9"),
        estado(T.guardando, "Guardando perfil…", "info"),
        toast(T.guardado, "Perfil actualizado: Bajo riesgo", "ok", 0.95),
        estado(T.guardado, `Perfil Bajo riesgo (R09) · ${cli.nombre}`, "ok"),
      ],
      pensamiento: `${cli.primerNombre} suma ${cli.desbloqueosLegitimos} desbloqueos legítimos: es un falso positivo recurrente y R09 me pide marcar su perfil como bajo riesgo.`,
    };
  },
};
