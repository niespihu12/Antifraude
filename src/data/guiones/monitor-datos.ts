/**
 * Datos de pantalla y tiempos compartidos por las consolas de alertas (Monitor, VRM y EMS/MS)
 * y por sus guiones. Todo es función pura de `caso.id` y de `caso.datos`: nada de azar ni de
 * reloj. Los tiempos `T` (0–1 del paso) son los mismos que usan los guiones para las acciones,
 * de modo que lo que se ve y lo que el cursor hace nunca se desfasan.
 */
import { EstadoAlerta } from "@/types";
import type { Caso, DatosCaso, Escenario, OrigenAlerta, PasoPlan } from "@/types/agentes";
import { UMBRAL_ALTO_RIESGO, fechaCorta, formatPeso } from "@/data/agentes-util";
import { formatBogotaTime } from "@/lib/utils";

/* ─── Tiempos (fracción del paso) ─── */
export const T = {
  /** MONITOR:r1 · la alerta entra a la cola y se selecciona. */
  r1: { aparece: 0.14, mover: 0.2, selecciona: 0.34 },
  /** i3 · selecciona la alerta, pulsa «Escalar» y el caso aparece en la cola manual. */
  i3: { selecciona: 0.16, clicEscalar: 0.4, escalada: 0.44, casoEnCola: 0.56 },
  /** r3 · el agente elige la ruta del canal (clic en 0.4). */
  r3: { clicRuta: 0.4, resuelto: 0.44 },
  /** r4 · barras (promedio, monto) y veredicto. */
  r4: { promedio: [0.28, 0.42], monto: [0.48, 0.64], veredicto: 0.66, prioridad: 0.8 },
  /** g3 · sincronización de la tipificación en el origen. */
  g3: { clic: 0.1, inicia: 0.14, fin: 0.8 },
  /** d4 · pantalla del analista (todo a ritmo humano). */
  d4: {
    asignado: 0.03,
    abre: 0.1,
    contacta: 0.3,
    contactado: 0.52,
    clicDecision: 0.72,
    dialogo: [0.75, 0.92],
    confirma: 0.86,
    registrada: 0.92,
  },
  /** VRM / EMS: r1 de Visa y Mastercard. */
  fr: { aparece: 0.02, selecciona: 0.16, clicReconocer: 0.56, reconocida: 0.6 },
} as const;

/* ─── Utilidades deterministas ─── */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rngDe(semilla: string): () => number {
  let h = hash(semilla) || 1;
  return () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
}

const entre = (rand: () => number, a: number, b: number) => Math.floor(a + rand() * (b - a + 1));

/** Baraja (Fisher-Yates) con el generador dado, sin mutar el original. */
function mezclar<T>(rand: () => number, arr: readonly T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** «Juan Sebastián Rojas» → «Juan Rojas». */
export function nombreCorto(nombre: string): string {
  const p = nombre.split(" ");
  return p.length > 2 ? `${p[0]} ${p[p.length - 1]}` : nombre;
}

export const horaReloj = (ts: number) => formatBogotaTime(ts, { hour12: false });

/* ─── Catálogos de las filas «de relleno» ─── */
const CLIENTES_COLA = [
  "Marcela Ríos Duque",
  "Esteban Arango",
  "Liliana Carvajal",
  "Gustavo Naranjo",
  "Paola Andrade",
  "Iván Darío Mejía",
  "Rosa Elena Villamil",
  "Tomás Escobar",
  "Yesenia Bonilla",
  "Nicolás Patiño",
  "Adriana Fonseca",
  "Mauricio Zapata",
  "Lucía Ferrer",
  "Hernán Cifuentes",
  "Beatriz Lemus",
  "Fabián Contreras",
];

const MOTIVOS = ["Monto inusual", "Ubicación atípica", "Comercio riesgoso"];

const ANALISTAS_MANUAL = ["Camila Ortiz", "Julián Barrera", "Diana Quintero"];

/** Estados por edad de la alerta (las más nuevas, al principio del proceso). */
const ESTADOS_COLA: string[] = [
  EstadoAlerta.PENDIENTE_REVISION,
  EstadoAlerta.EN_VERIFICACION_CRM,
  EstadoAlerta.WHATSAPP_ENVIADO,
  EstadoAlerta.ESPERANDO_CLIENTE,
  EstadoAlerta.BLOQUEO_PREVENTIVO,
  EstadoAlerta.DESBLOQUEADO,
];

/** Estados propios de la bandeja de una franquicia (VRM / EMS/MS). */
export const ESTADOS_BANDEJA = ["Nueva", "Reconocida", "En análisis", "Cerrada"] as const;

const PREFIJO: Record<OrigenAlerta, string> = { Monitor: "MON", VRM: "VRM", "EMS/MS": "EMS" };

/** Año de la referencia de la alerta («VRM-2026412345» → «2026»). */
function anioDe(d: DatosCaso): string {
  return /-(\d{4})/.exec(d.alerta.referencia)?.[1] ?? fechaCorta(d.alerta.emitidaEn).slice(-4);
}

/* ─── Filas de alertas ─── */
export interface FilaAlerta {
  referencia: string;
  origen: OrigenAlerta;
  ultimos4: string;
  cliente: string;
  monto: number;
  motivo: string;
  prioridad: "Alta" | "Media";
  estado: string;
  hora: string;
}

/** La alerta del caso como fila de una lista. */
export function filaActual(d: DatosCaso, estado: string): FilaAlerta {
  return {
    referencia: d.alerta.referencia,
    origen: d.alerta.origen,
    ultimos4: d.tarjeta.ultimos4,
    cliente: nombreCorto(d.cliente.nombre),
    monto: d.transaccion.monto,
    motivo: d.alerta.motivo,
    prioridad: d.alerta.prioridad,
    estado,
    hora: horaReloj(d.alerta.emitidaEn),
  };
}

/**
 * `n` alertas anteriores del mismo origen, de la más nueva a la más antigua. Los clientes, tarjetas
 * y referencias son distintos de los del caso; los estados avanzan con la antigüedad.
 */
export function alertasPrevias(id: string, d: DatosCaso, n: number, estados: readonly string[] = ESTADOS_COLA) {
  const rand = rngDe(`${id}|cola`);
  const clientes = mezclar(rand, CLIENTES_COLA).filter((c) => c !== d.cliente.nombre);
  const anio = anioDe(d);
  const prefijo = PREFIJO[d.alerta.origen];
  const usadas = new Set<string>([d.alerta.referencia, d.tarjeta.ultimos4]);
  let ts = d.alerta.emitidaEn;
  const filas: FilaAlerta[] = [];
  for (let i = 0; i < n; i++) {
    ts -= entre(rand, 2, 5) * 60_000 + entre(rand, 0, 59) * 1_000;
    let referencia = `${prefijo}-${anio}${entre(rand, 100000, 999999)}`;
    while (usadas.has(referencia)) referencia = `${prefijo}-${anio}${entre(rand, 100000, 999999)}`;
    let ultimos4 = String(entre(rand, 1000, 9999));
    while (usadas.has(ultimos4)) ultimos4 = String(entre(rand, 1000, 9999));
    usadas.add(referencia);
    usadas.add(ultimos4);
    const grande = rand() < 0.18;
    const monto = grande ? entre(rand, 520, 900) * 10_000 : entre(rand, 9, 190) * 10_000;
    const idxEstado = Math.min(estados.length - 1, Math.floor((i * estados.length) / n + rand() * 1.4));
    filas.push({
      referencia,
      origen: d.alerta.origen,
      ultimos4,
      cliente: nombreCorto(clientes[i % clientes.length]),
      monto,
      motivo: MOTIVOS[entre(rand, 0, MOTIVOS.length - 1)],
      prioridad: monto >= UMBRAL_ALTO_RIESGO ? "Alta" : "Media",
      estado: estados[idxEstado],
      hora: horaReloj(ts),
    });
  }
  return filas;
}

/* ─── Contadores de las pestañas de la consola ─── */
export interface ConteosCola {
  monitor: number;
  vrm: number;
  ems: number;
  /** Alertas del día. */
  hoy: number;
}

export function conteosCola(id: string, d: DatosCaso, visibles: number): ConteosCola {
  const rand = rngDe(`${id}|conteos`);
  const c: ConteosCola = {
    monitor: entre(rand, 7, 14),
    vrm: entre(rand, 9, 18),
    ems: entre(rand, 8, 16),
    hoy: entre(rand, 64, 148),
  };
  // La pestaña del origen no puede tener menos alertas que las filas listadas.
  const origen = d.alerta.sistemaOrigen;
  c[origen] = Math.max(c[origen], visibles);
  return c;
}

/* ─── Cola de monitoreo manual ─── */
export interface FilaManual {
  referencia: string;
  cliente: string;
  monto: number;
  causa: string;
  analista: string;
  espera: string;
}

export function causaManual(escenario: Escenario, slaMin: number): string {
  return escenario === "sin_celular" ? "Sin celular en CRM" : `Sin respuesta ${slaMin} min`;
}

/** Casos de otros clientes ya en la cola manual (el analista del caso atiende algunos de ellos). */
export function manualPrevios(id: string, d: DatosCaso, n: number): FilaManual[] {
  const rand = rngDe(`${id}|manual`);
  const clientes = mezclar(rand, CLIENTES_COLA)
    .filter((c) => c !== d.cliente.nombre)
    .slice(6);
  const otros = ANALISTAS_MANUAL.filter((a) => a !== d.analista.nombre);
  const anio = anioDe(d);
  const origenes: OrigenAlerta[] = ["Monitor", "VRM", "EMS/MS"];
  return Array.from({ length: n }, (_, i) => {
    const origen = origenes[entre(rand, 0, 2)];
    const monto = entre(rand, 12, 240) * 10_000;
    return {
      referencia: `${PREFIJO[origen]}-${anio}${entre(rand, 100000, 999999)}`,
      cliente: nombreCorto(clientes[i % clientes.length]),
      monto,
      causa: rand() < 0.5 ? "Sin celular en CRM" : `Sin respuesta ${d.hsm.slaMin} min`,
      analista: i === 0 ? d.analista.nombre : otros[i % otros.length],
      espera: `${entre(rand, 3, 34)} min`,
    };
  });
}

/* ─── Bandeja de VRM / EMS/MS ─── */
export function bandejaFranquicia(id: string, d: DatosCaso, n: number): FilaAlerta[] {
  return alertasPrevias(id, d, n, ["En análisis", "Reconocida", "Reconocida", "Cerrada", "Cerrada"]);
}

/** Contadores de la bandeja (nuevas / reconocidas del día). */
export function conteosBandeja(id: string): { nuevas: number; reconocidas: number } {
  const rand = rngDe(`${id}|bandeja`);
  return { nuevas: entre(rand, 2, 5), reconocidas: entre(rand, 18, 47) };
}

/* ─── Registro de la gestión del analista (d4) ─── */
/** Hora (hh:mm:ss) de la línea `n` del registro de gestión: tras el SLA (sin respuesta) o poco después de la alerta. */
export function horaGestion(d: DatosCaso, escenario: Escenario, n: number): string {
  const base =
    escenario === "sin_respuesta" ? d.alerta.emitidaEn + (d.hsm.slaMin + 1) * 60_000 : d.alerta.emitidaEn + 4 * 60_000;
  return horaReloj(base + n * 47_000);
}

/** Línea de contacto que el analista ve en su ficha (sin inventar números). */
export function contactoAnalista(
  d: DatosCaso,
  escenario: Escenario,
): { canal: string; detalle: string; boton: string } {
  if (escenario === "sin_celular") {
    return {
      canal: "Sin celular vigente en CRM",
      detalle:
        d.cliente.celular === null
          ? "Sin celular registrado · canal alterno: banca móvil o correo registrado"
          : `Celular desactualizado (${d.cliente.fechaActualizacion}) · canal alterno: banca móvil o correo registrado`,
      boton: "Contactar por canal alterno",
    };
  }
  return {
    canal: "Llamada al celular del titular",
    detalle: d.cliente.celular ?? "Sin celular registrado",
    boton: "Llamar al titular",
  };
}

/** Texto de la decisión del analista para el diálogo de confirmación. */
export function textoDecision(d: DatosCaso): { etiqueta: "Legítima" | "Fraude"; cuerpo: string } {
  return d.desenlace === "legitima"
    ? {
        etiqueta: "Legítima",
        cuerpo: `Marcar la alerta ${d.alerta.referencia} como LEGÍTIMA. Se levantará el bloqueo preventivo de la tarjeta ····${d.tarjeta.ultimos4}.`,
      }
    : {
        etiqueta: "Fraude",
        cuerpo: `Marcar la alerta ${d.alerta.referencia} como FRAUDE. Se aplicará el bloqueo definitivo de la tarjeta ····${d.tarjeta.ultimos4}.`,
      };
}

/* ─── Campos normalizados de la ficha (r2) ─── */
export interface CampoNormalizado {
  ancla: string;
  etiqueta: string;
  valor: string;
  /** 'pegar' (copia del payload de la alerta) o 'teclear' (valor que el agente digita). */
  modo: "pegar" | "teclear";
  mono: boolean;
}

export function camposNormalizados(d: DatosCaso): CampoNormalizado[] {
  const tx = d.transaccion;
  return [
    { ancla: "mon.campo.comercio", etiqueta: "Comercio", valor: tx.comercio, modo: "pegar", mono: false },
    {
      ancla: "mon.campo.categoria",
      etiqueta: "Categoría",
      valor: `${tx.categoria} · MCC ${tx.mcc}`,
      modo: "pegar",
      mono: false,
    },
    {
      ancla: "mon.campo.ubicacion",
      etiqueta: "Ciudad · país",
      valor: `${tx.ciudad}, ${tx.pais}`,
      modo: "pegar",
      mono: false,
    },
    {
      ancla: "mon.campo.monto",
      etiqueta: "Monto COP",
      valor: `${formatPeso(tx.monto)} COP`,
      modo: "teclear",
      mono: true,
    },
    { ancla: "mon.campo.canal", etiqueta: "Canal", valor: tx.canal, modo: "pegar", mono: false },
    {
      ancla: "mon.campo.fecha",
      etiqueta: "Fecha y hora",
      valor: `${fechaCorta(tx.fechaHora)} ${horaReloj(tx.fechaHora)}`,
      modo: "teclear",
      mono: true,
    },
  ];
}

/* ─── Rutas de canal (r3) ─── */
export type ClaveRuta = "visa" | "mastercard" | "interna";

export const RUTAS: { clave: ClaveRuta; ancla: string; red: string; origen: string; canal: string; regla?: string }[] =
  [
    { clave: "visa", ancla: "mon.fila.ruta-visa", red: "Visa", origen: "VRM", canal: "Canal Visa", regla: "R07" },
    {
      clave: "mastercard",
      ancla: "mon.fila.ruta-mastercard",
      red: "Mastercard",
      origen: "EMS/MS",
      canal: "Canal Mastercard",
      regla: "R08",
    },
    { clave: "interna", ancla: "mon.fila.ruta-interna", red: "Interna", origen: "Monitor", canal: "Sin canal de red" },
  ];

export const rutaDe = (d: DatosCaso): ClaveRuta =>
  d.alerta.origen === "VRM" ? "visa" : d.alerta.origen === "EMS/MS" ? "mastercard" : "interna";

/** Escala de las barras de r4: el umbral de patrón (4× el promedio) y el monto caben siempre. */
export function escalaPatron(d: DatosCaso) {
  const { monto, promedioHistorico } = d.transaccion;
  const umbral = promedioHistorico * 4;
  const max = Math.max(monto, umbral) * 1.06;
  return {
    promedio: promedioHistorico / max,
    monto: monto / max,
    umbral: umbral / max,
    veces: monto / Math.max(1, promedioHistorico),
  };
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Rango [a, b] de una fracción del paso → 0–1. */
export const tramo = (p: number, rango: readonly number[]) => clamp01((p - rango[0]) / (rango[1] - rango[0]));

/**
 * Avance (0–1) de un paso previo o en curso: 1 si ya se hizo, `p` si es el paso actual y 0 si aún
 * no llega. Sin paso (caso en cola) la alerta ya está recibida (r1 = 1) y nada más ha ocurrido.
 */
export function avancePaso(caso: Caso, paso: PasoPlan | undefined, p: number, id: string): number {
  if (caso.pasosHechos[id]) return 1;
  if (paso) return paso.id === id ? p : 0;
  return id === "r1" ? 1 : 0;
}
