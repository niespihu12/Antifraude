import { EstadoAlerta, Franquicia } from "@/types";
import type {
  AgenteDef,
  AgenteId,
  Caso,
  CategoriaTipificacion,
  ControlChequeo,
  DatosCaso,
  Desenlace,
  Escena,
  Escenario,
  EtapaPlan,
  Humano,
  OpcionesCaso,
  OrigenAlerta,
  PasoPlan,
  RespuestaCliente,
  SistemaId,
} from "@/types/agentes";
import { formatBogotaTime } from "@/lib/utils";
import {
  REINTENTO_MIN,
  SLA_MIN,
  UMBRAL_ALTO_RIESGO,
  UMBRAL_RECURRENTE,
  fechaCorta,
  formatPeso,
  iniciales,
} from "@/data/agentes-util";
import { GUIONES } from "@/data/guiones";
import type { CtxGuion } from "@/data/guiones/tipos";

export { fechaCorta, iniciales };

/* ─── Definición de los agentes (uno por área de AREAS_PROCESO) ─── */
export const AGENTES: AgenteDef[] = [
  {
    id: "recepcion",
    nombre: "Agente Recepción",
    rol: "Orquestador · recepción y enrutamiento",
    sistema: "monitor",
    sistemas: ["monitor", "vrm", "ems", "ppe"],
    color: "#2563eb",
    descripcion:
      "Recibe la alerta de Monitor, VRM o EMS/MS, normaliza la transacción, la enruta por su canal y evalúa el patrón del cliente.",
  },
  {
    id: "identificacion",
    nombre: "Agente Identificación",
    rol: "Bot CRM · titular y contacto",
    sistema: "crm",
    sistemas: ["crm", "monitor"],
    color: "#7c3aed",
    descripcion:
      "Consulta al titular en CRM Banco y revisa cliente, celular, dispositivo y ubicación antes de contactarlo.",
  },
  {
    id: "comunicacion",
    nombre: "Agente Comunicación",
    rol: "Kari AI · WhatsApp HSM",
    sistema: "kari",
    sistemas: ["kari", "whatsapp"],
    color: "#059669",
    descripcion:
      "Envía la plantilla HSM por WhatsApp, reintenta a los 15 minutos y espera la respuesta del cliente dentro del SLA de 40 minutos.",
  },
  {
    id: "decision",
    nombre: "Agente Decisión",
    rol: "Cardinal / PPE · bloqueo y desbloqueo",
    sistema: "ppe",
    sistemas: ["ppe", "cardinal", "monitor"],
    color: "#ea580c",
    descripcion:
      "Revisa el riesgo (Cardinal en Visa) y ejecuta en PPE el desbloqueo, el bloqueo definitivo o el bloqueo preventivo según la respuesta.",
  },
  {
    id: "registro",
    nombre: "Agente Registro",
    rol: "CRM / Bitácora · tipificación y cierre",
    sistema: "crm",
    sistemas: ["crm", "monitor", "expediente"],
    color: "#0033a0",
    descripcion:
      "Tipifica el caso en CRM, sincroniza el origen, escribe la bitácora y sella el expediente de auditoría.",
  },
];

export const AGENTES_MAP: Record<AgenteId, AgenteDef> = Object.fromEntries(AGENTES.map((a) => [a.id, a])) as Record<
  AgenteId,
  AgenteDef
>;

export const SISTEMAS: Record<SistemaId, { nombre: string; color: string }> = {
  monitor: { nombre: "Monitor", color: "#475569" },
  vrm: { nombre: "VRM", color: "#1d4ed8" },
  ems: { nombre: "EMS/MS", color: "#dc2626" },
  crm: { nombre: "CRM Banco", color: "#0033a0" },
  kari: { nombre: "Kari AI", color: "#059669" },
  whatsapp: { nombre: "WhatsApp", color: "#16a34a" },
  cardinal: { nombre: "Cardinal", color: "#b45309" },
  ppe: { nombre: "PPE", color: "#7c3aed" },
  expediente: { nombre: "Expediente", color: "#334155" },
};

export const FRANQUICIA_LABEL: Record<Franquicia, string> = {
  [Franquicia.VISA]: "Visa",
  [Franquicia.MASTERCARD]: "Mastercard",
  [Franquicia.MONITOR]: "Monitor",
};

/* ─── Catálogos ─── */
const CLIENTES = [
  "Juan Sebastián Rojas",
  "Laura Sofía Gómez",
  "Andrés Felipe Cárdenas",
  "Catalina María Moreno",
  "Daniel Esteban Pérez",
  "Paula Andrea Díaz",
  "Miguel Ángel Torres",
  "Valentina Salazar",
  "Sebastián Herrera",
  "Daniela Castro",
  "Carlos Andrés Méndez",
  "Mariana Rincón",
  "Felipe Camacho",
  "Natalia Giraldo",
  "Camilo Ernesto Vargas",
  "Luisa Fernanda Ospina",
  "Jorge Iván Restrepo",
  "Diana Marcela Cortés",
  "Ricardo Alfonso Bermúdez",
  "Ángela Patricia Suárez",
  "Héctor Fabio Lozano",
  "Sara Isabel Montoya",
  "Óscar Eduardo Quiroga",
  "Verónica Lucía Peña",
];

const CIUDADES = [
  "Bogotá D.C.",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Bucaramanga",
  "Cartagena",
  "Pereira",
  "Manizales",
];

const PREFIJOS_CELULAR = [
  "300",
  "301",
  "304",
  "310",
  "311",
  "312",
  "313",
  "314",
  "315",
  "316",
  "317",
  "318",
  "320",
  "321",
  "322",
  "323",
  "350",
  "351",
];

const ANALISTAS: Humano[] = [
  { nombre: "Camila Ortiz", rol: "Analista de monitoreo antifraude", area: "Monitoreo 24/7", color: "#d97706" },
  { nombre: "Julián Barrera", rol: "Analista de monitoreo antifraude", area: "Monitoreo 24/7", color: "#d97706" },
  { nombre: "Diana Quintero", rol: "Analista de monitoreo antifraude", area: "Monitoreo 24/7", color: "#d97706" },
];

interface ComercioDef {
  nombre: string;
  categoria: string;
  mcc: string;
  ciudad: string;
  pais: string;
  canal: string;
  /** Categoría de comercio de riesgo alto (motivo «Comercio riesgoso»). */
  riesgoso?: boolean;
}

const PRESENCIAL = "Presencial · datáfono";
const ONLINE = "Comercio electrónico";

const COMERCIOS_NACIONALES: ComercioDef[] = [
  {
    nombre: "Almacén Central Electrohogar",
    categoria: "Electrodomésticos",
    mcc: "5732",
    ciudad: "Bogotá D.C.",
    pais: "CO",
    canal: PRESENCIAL,
  },
  {
    nombre: "Supermercado La Alameda",
    categoria: "Supermercados",
    mcc: "5411",
    ciudad: "Medellín",
    pais: "CO",
    canal: PRESENCIAL,
  },
  {
    nombre: "Estación de Servicio El Cruce",
    categoria: "Estaciones de servicio",
    mcc: "5541",
    ciudad: "Bucaramanga",
    pais: "CO",
    canal: PRESENCIAL,
  },
  {
    nombre: "Restaurante Casa Brasa",
    categoria: "Restaurantes",
    mcc: "5812",
    ciudad: "Cali",
    pais: "CO",
    canal: PRESENCIAL,
  },
  {
    nombre: "Droguería San Rafael",
    categoria: "Droguerías",
    mcc: "5912",
    ciudad: "Bogotá D.C.",
    pais: "CO",
    canal: PRESENCIAL,
  },
  {
    nombre: "Muebles y Diseño Andino",
    categoria: "Muebles",
    mcc: "5712",
    ciudad: "Barranquilla",
    pais: "CO",
    canal: PRESENCIAL,
  },
  {
    nombre: "Joyería Esmeralda del Sol",
    categoria: "Joyería",
    mcc: "5944",
    ciudad: "Cartagena",
    pais: "CO",
    canal: PRESENCIAL,
  },
  {
    nombre: "Fortuna Apuestas Online",
    categoria: "Juegos de azar en línea",
    mcc: "7995",
    ciudad: "Bogotá D.C.",
    pais: "CO",
    canal: ONLINE,
    riesgoso: true,
  },
  {
    nombre: "GiroExpress Remesas",
    categoria: "Transferencias de dinero",
    mcc: "4829",
    ciudad: "Cali",
    pais: "CO",
    canal: PRESENCIAL,
    riesgoso: true,
  },
];

const COMERCIOS_EXTERIOR: ComercioDef[] = [
  { nombre: "TechZone Outlet", categoria: "Electrónica", mcc: "5732", ciudad: "Miami", pais: "US", canal: ONLINE },
  {
    nombre: "Luxe Travel Booking",
    categoria: "Agencias de viaje",
    mcc: "4722",
    ciudad: "Madrid",
    pais: "ES",
    canal: ONLINE,
  },
  {
    nombre: "Digital Games Hub",
    categoria: "Juegos digitales",
    mcc: "5816",
    ciudad: "Dublín",
    pais: "IE",
    canal: ONLINE,
    riesgoso: true,
  },
  {
    nombre: "Nordic Sports Online",
    categoria: "Artículos deportivos",
    mcc: "5941",
    ciudad: "Estocolmo",
    pais: "SE",
    canal: ONLINE,
  },
  {
    nombre: "Global Gadget Market",
    categoria: "Electrónica",
    mcc: "5732",
    ciudad: "Ciudad de Panamá",
    pais: "PA",
    canal: ONLINE,
  },
];

/* ─── Utilidades ─── */
function rngDesde(seed: number): () => number {
  let h = (seed * 2654435761) >>> 0 || 1;
  return () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    return (h >>> 0) / 4294967296;
  };
}

const pick = <T>(rand: () => number, arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const entre = (rand: () => number, a: number, b: number) => Math.floor(a + rand() * (b - a + 1));
const hex = (rand: () => number, n: number) =>
  Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(rand() * 16)]).join("");
const pad5 = (n: number) => String(n).padStart(5, "0");
const hhmm = (ts: number) => formatBogotaTime(ts, { hour12: false }).slice(0, 5);

/* ─── Franquicia y escenario naturales ─── */
/** Reparto de la taxonomía de la ontología: Visa ≈45 %, Mastercard ≈40 %, Monitor ≈15 %. */
function elegirFranquicia(rand: () => number): Franquicia {
  const r = rand();
  if (r < 0.45) return Franquicia.VISA;
  if (r < 0.85) return Franquicia.MASTERCARD;
  return Franquicia.MONITOR;
}

/** Probabilidad natural de cada escenario (≈72 % de desenlaces legítimos, dentro del 70–80 % de falsos positivos). */
export const PROBABILIDAD_ESCENARIO: Record<Escenario, number> = {
  legitima: 0.56,
  niega: 0.16,
  sin_respuesta: 0.11,
  sin_celular: 0.06,
  recurrente: 0.05,
  sin_tipificar: 0.03,
  alto_riesgo: 0.03,
};

function elegirEscenario(rand: () => number): Escenario {
  let r = rand();
  for (const [esc, p] of Object.entries(PROBABILIDAD_ESCENARIO) as [Escenario, number][]) {
    if (r < p) return esc;
    r -= p;
  }
  return "legitima";
}

/* ─── Datos del caso ─── */
export function generarDatos(seq: number, franquicia: Franquicia, escenario: Escenario, ahora: number): DatosCaso {
  const rand = rngDesde(seq * 7919 + 17);
  const anio = Number(fechaCorta(ahora).slice(-4));
  const seqPad = pad5(seq);

  /* Cliente y tarjeta (se sortean siempre en el mismo orden para que el escenario forzado no altere el resto) */
  const nombre = pick(rand, CLIENTES);
  const cedula = entre(rand, 10_000_000, 1_099_999_999).toLocaleString("es-CO");
  const ciudadCliente = pick(rand, CIUDADES);
  const celularBase = `+57 ${pick(rand, PREFIJOS_CELULAR)} ${entre(rand, 100, 999)} ${entre(rand, 1000, 9999)}`;
  const mesesActualizado = entre(rand, 1, 11);
  const opcionSinCelular = rand() < 0.5;
  const clienteDesde = entre(rand, 2004, 2022);
  const ultimos4 = String(entre(rand, 1000, 9999));
  const producto = `Crédito ${pick(rand, ["Clásica", "Oro", "Platinum"])}`;
  const limite = entre(rand, 3, 40) * 1_000_000;

  /* Transacción */
  const base = entre(rand, 12, 260) * 10_000;
  const grande = entre(rand, 520, 1450) * 10_000;
  const usaGrande = rand() < 0.22 || escenario === "alto_riesgo";
  const promedioSorteado = entre(rand, 40, 150) * 10_000;
  const exterior = escenario === "alto_riesgo" || rand() < (usaGrande ? 0.6 : 0.12);
  const comercio = exterior ? pick(rand, COMERCIOS_EXTERIOR) : pick(rand, COMERCIOS_NACIONALES);
  const minutosAtras = entre(rand, 1, 4);
  const segundosAtras = entre(rand, 0, 59);
  const monto = usaGrande ? grande : base;
  const promedioHistorico =
    escenario === "alto_riesgo" ? Math.min(promedioSorteado, Math.floor(monto / 50_000) * 10_000) : promedioSorteado;
  const atipico = monto > 4 * promedioHistorico;
  const altoRiesgo = atipico || monto >= UMBRAL_ALTO_RIESGO;
  const fechaHora = ahora - minutosAtras * 60_000 - segundosAtras * 1_000;
  const ciudadDistinta = comercio.ciudad !== ciudadCliente && !exterior;
  const comercioRiesgoso = comercio.riesgoso === true;

  /* Alerta */
  const origen: OrigenAlerta =
    franquicia === Franquicia.VISA ? "VRM" : franquicia === Franquicia.MASTERCARD ? "EMS/MS" : "Monitor";
  const sistemaOrigen =
    franquicia === Franquicia.VISA ? "vrm" : franquicia === Franquicia.MASTERCARD ? "ems" : "monitor";
  const prefijoRef = origen === "VRM" ? "VRM" : origen === "EMS/MS" ? "EMS" : "MON";
  const referencia = `${prefijoRef}-${anio}${entre(rand, 100000, 999999)}`;
  const canal =
    franquicia === Franquicia.VISA
      ? "Canal Visa"
      : franquicia === Franquicia.MASTERCARD
        ? "Canal Mastercard"
        : "Alerta interna (sin canal de red)";
  const motivo = exterior
    ? "Ubicación atípica"
    : atipico
      ? "Monto inusual"
      : comercioRiesgoso
        ? "Comercio riesgoso"
        : ciudadDistinta
          ? "Ubicación atípica"
          : "Monto inusual";
  const hora = Number(formatBogotaTime(ahora, { hour12: false }).slice(0, 2));
  const fueraDeHorario = hora < 7 || hora >= 19;
  const emitidaEn = fechaHora + entre(rand, 20, 55) * 1_000;

  /* Contacto del cliente y celular (R01) */
  const sinCelular = escenario === "sin_celular";
  const celular = sinCelular && opcionSinCelular ? null : celularBase;
  const fechaActualizacion = fechaCorta(
    ahora - (sinCelular && !opcionSinCelular ? entre(rand, 26, 44) : mesesActualizado) * 30 * 86_400_000,
  );
  const desbloqueosLegitimos =
    escenario === "recurrente" ? entre(rand, UMBRAL_RECURRENTE, 7) : entre(rand, 0, UMBRAL_RECURRENTE - 1);
  const primerNombre = nombre.split(" ")[0];
  const mascara = `**** **** **** ${ultimos4}`;

  /* Controles de identificación (4) */
  const celularOk = !sinCelular;
  const identificacion: ControlChequeo[] = [
    {
      id: "cliente",
      nombre: "Cliente en CRM",
      detalle: `${nombre} · CC ${cedula} · titular de la tarjeta ····${ultimos4}`,
      ok: true,
    },
    {
      id: "celular",
      nombre: "Celular actualizado",
      detalle: celularOk
        ? `${celular} · actualizado ${fechaActualizacion}`
        : celular === null
          ? "Sin celular registrado en CRM"
          : `${celular} · última actualización ${fechaActualizacion} (más de 12 meses)`,
      ok: celularOk,
      regla: celularOk ? undefined : "R01",
    },
    {
      id: "dispositivo",
      nombre: "Cruce de dispositivo",
      detalle: exterior
        ? "Sin sesión de banca móvil activa en las últimas 24 h"
        : "Dispositivo habitual · última sesión de banca móvil hace 3 h",
      ok: true,
      aviso: exterior,
    },
    {
      id: "ubicacion",
      nombre: "Ubicación coherente",
      detalle:
        exterior || ciudadDistinta
          ? `Compra en ${comercio.ciudad}${exterior ? ` (${comercio.pais})` : ""} · habitual ${ciudadCliente} · sin registro de viaje`
          : `Compra en ${comercio.ciudad} · coincide con la ciudad habitual`,
      ok: true,
      aviso: exterior || ciudadDistinta,
    },
  ];

  /* Controles de riesgo (4): Cardinal solo aplica a Visa */
  const esVisa = franquicia === Franquicia.VISA;
  const scoreCardinal = esVisa ? (altoRiesgo ? entre(rand, 74, 96) : entre(rand, 14, 52)) : null;
  const compras90 = entre(rand, 18, 64);
  const riesgo: ControlChequeo[] = [
    {
      id: "monto",
      nombre: "Monto atípico",
      detalle: `${formatPeso(monto)} vs promedio ${formatPeso(promedioHistorico)} · ${atipico ? "supera el patrón" : "dentro del patrón"}`,
      ok: true,
      aviso: atipico,
      regla: atipico ? "R06" : undefined,
    },
    {
      id: "patron",
      nombre: "Patrón histórico",
      detalle: exterior
        ? `${compras90} compras en ${ciudadCliente} en 90 días · 0 en ${comercio.pais}`
        : `${compras90} compras en 90 días · ${ciudadDistinta ? `0 en ${comercio.ciudad}` : "comercio y ciudad habituales"}`,
      ok: true,
      aviso: exterior || ciudadDistinta,
    },
    {
      id: "comercio",
      nombre: "Comercio sospechoso",
      detalle: `${comercio.nombre} · MCC ${comercio.mcc} ${comercio.categoria} · ${comercioRiesgoso ? "categoría de riesgo alto" : "categoría habitual"}`,
      ok: true,
      aviso: comercioRiesgoso,
    },
    esVisa
      ? {
          id: "cardinal",
          nombre: "Score Cardinal",
          detalle: `Score ${scoreCardinal}/100 · umbral 70 · 3DS ${exterior ? "sin autenticar" : "autenticada"}`,
          ok: true,
          aviso: (scoreCardinal ?? 0) >= 70,
        }
      : {
          id: "cardinal",
          nombre: "Score Cardinal",
          detalle: "No aplica · Cardinal valida solo transacciones Visa",
          ok: true,
          noAplica: true,
        },
  ];

  /* Respuesta del cliente y desenlace */
  const respuesta: RespuestaCliente =
    escenario === "niega" ? "no" : escenario === "sin_respuesta" || escenario === "sin_celular" ? "ninguna" : "si";
  const respuestaMin = respuesta === "ninguna" ? null : entre(rand, 2, 11);
  const analistaDecide = respuesta === "ninguna";
  const analistaFraude = rand() < 0.4;
  const desenlace: Desenlace =
    respuesta === "no" ? "fraude" : respuesta === "si" ? "legitima" : analistaFraude ? "fraude" : "legitima";
  const analista = pick(rand, ANALISTAS);

  const mensajes = [
    `🔔 Centro de Operaciones Antifraude\n\nHola ${primerNombre}, detectamos una actividad inusual en tu tarjeta ${esVisa ? "Visa " : franquicia === Franquicia.MASTERCARD ? "Mastercard " : ""}terminada en ${ultimos4}.`,
    `📍 Comercio: ${comercio.nombre}\n💰 Monto: ${formatPeso(monto)} COP\n🌎 Ubicación: ${comercio.ciudad}, ${comercio.pais}\n📅 Fecha: Hoy, ${hhmm(fechaHora)}`,
    "¿Reconoces esta transacción?\nResponde SÍ si fuiste tú o NO si no la reconoces.",
  ];
  const cierre =
    respuesta === "si"
      ? `✅ Confirmación recibida. Tu tarjeta ya está disponible y puedes continuar con tus compras.\n\nGracias por ayudarnos a proteger tu cuenta, ${primerNombre}. 🛡️`
      : respuesta === "no"
        ? `🔒 Gracias por avisarnos, ${primerNombre}. Bloqueamos tu tarjeta terminada en ${ultimos4} para proteger tu cuenta.`
        : null;

  const categoria: CategoriaTipificacion = desenlace === "fraude" ? "Fraude" : "Legítima";
  const causa = analistaDecide
    ? `${escenario === "sin_celular" ? "Sin celular en CRM" : "Sin respuesta en 40 min"} · resuelta por monitoreo manual (${analista.nombre})`
    : respuesta === "si"
      ? "Falso positivo · confirmada por el titular por WhatsApp"
      : "Desconocida por el titular por WhatsApp";

  return {
    alerta: {
      referencia,
      origen,
      sistemaOrigen,
      canal,
      emitidaEn,
      motivo,
      altoRiesgo,
      prioridad: altoRiesgo ? "Alta" : "Media",
      fueraDeHorario,
    },
    cliente: {
      nombre,
      primerNombre,
      cedula,
      celular,
      fechaActualizacion,
      ciudad: ciudadCliente,
      desbloqueosLegitimos,
      clienteDesde,
    },
    tarjeta: { mascara, ultimos4, franquicia, producto, limite },
    transaccion: {
      id: `TRX-${anio}-${hex(rand, 8).toUpperCase()}`,
      comercio: comercio.nombre,
      categoria: comercio.categoria,
      mcc: comercio.mcc,
      ciudad: comercio.ciudad,
      pais: comercio.pais,
      monto,
      fechaHora,
      canal: comercio.canal,
      promedioHistorico,
      atipico,
      exterior,
    },
    identificacion,
    riesgo,
    scoreCardinal,
    hsm: {
      plantilla: "alerta_transaccional",
      messageId: `wamid.${hex(rand, 20).toUpperCase()}`,
      mensajes,
      respuesta,
      respuestaMin,
      reintentoMin: REINTENTO_MIN,
      slaMin: SLA_MIN,
      cierre,
      entregadoA: celular ?? "",
    },
    ppe: {
      bloqueoTemporal: altoRiesgo ? { id: `BLQ-${anio}-${seqPad}`, motivo: "Alerta de alto riesgo" } : null,
      referencia: `PPE-${anio}-${entre(rand, 100000, 999999)}`,
    },
    registro: { casoCrm: `CRM-${anio}-${entre(rand, 100000, 999999)}`, categoria, causa },
    desenlace,
    analista,
    titular: { nombre, rol: "Titular de la tarjeta", area: "Cliente", color: "#16a34a" },
    expediente: { numero: `EXP-${anio}-${seqPad}`, hash: hex(rand, 64) },
    sesion: { usuario: "agt-antifraude", servidor: "SRV-BDB-AF-01", terminal: "AF-TRM-07", vm: "RPA-VM-02" },
  };
}

/* ─── Plan de ejecución ─── */
type CrearPaso = (id: string, texto: string, duracion: number, extra?: Partial<PasoPlan>) => PasoPlan;

/**
 * Fabrica el helper `paso` de un caso: cada paso se enriquece con su guion de
 * interfaz (vista, acciones del cursor, pensamiento) buscado por `${franquicia}:${id}`
 * y luego por `id`. El `extra` explícito siempre gana. No cambia textos ni duraciones.
 */
function crearPaso(ctxBase: Omit<CtxGuion, "ok" | "humano" | "duracion" | "sistema" | "id">): CrearPaso {
  return (id, texto, duracion, extra = {}) => {
    const guion = GUIONES[`${ctxBase.franquicia}:${id}`] ?? GUIONES[id];
    const enriquecido = guion
      ? guion({ ...ctxBase, id, duracion, ok: extra.ok !== false, humano: extra.humano, sistema: extra.sistema })
      : {};
    return { id, texto, duracion, ...enriquecido, ...extra };
  };
}

function variar(rand: () => number, ms: number): number {
  return Math.round(ms * (0.85 + rand() * 0.3));
}

export function generarPlan(seq: number, franquicia: Franquicia, escenario: Escenario, d: DatosCaso): EtapaPlan[] {
  const rand = rngDesde(seq * 104729 + 3);
  const v = (ms: number) => variar(rand, ms);
  const paso = crearPaso({ d, franquicia, escenario, seq });
  const { alerta, cliente, tarjeta, transaccion: tx, hsm, ppe, registro } = d;
  const etapas: EtapaPlan[] = [];

  const sinCelular = escenario === "sin_celular";
  const sinRespuesta = escenario === "sin_respuesta";
  const esVisa = franquicia === Franquicia.VISA;
  const bloqueado = ppe.bloqueoTemporal !== null;
  const ultimos = tarjeta.ultimos4;

  /* 1. Recepción */
  etapas.push({
    agente: "recepcion",
    pasos: [
      paso("r1", `Alerta detectada en ${alerta.origen}`, v(900), {
        sistema: alerta.sistemaOrigen,
        estado: EstadoAlerta.PENDIENTE_REVISION,
        regla: alerta.fueraDeHorario ? "R12" : undefined,
        resultado: `${alerta.referencia} · ${FRANQUICIA_LABEL[franquicia]} · ${formatPeso(tx.monto)}${alerta.fueraDeHorario ? " · fuera de horario laboral" : ""}`,
        bitacora: `Alerta ${alerta.referencia} recibida de ${alerta.origen} · ${cliente.nombre} · ${formatPeso(tx.monto)}${alerta.fueraDeHorario ? " · procesa el orquestador automático" : ""}`,
      }),
      paso("r2", "Normalizando datos de la transacción", v(2200), {
        sistema: "monitor",
        resultado: `${tx.comercio} · ${tx.ciudad}, ${tx.pais} · ${formatPeso(tx.monto)}`,
      }),
      paso(
        "r3",
        esVisa
          ? "Enrutando por canal Visa (VRM)"
          : franquicia === Franquicia.MASTERCARD
            ? "Enrutando por canal Mastercard (EMS/MS)"
            : "Clasificando como alerta interna de Monitor",
        v(1600),
        {
          sistema: "monitor",
          regla: esVisa ? "R07" : franquicia === Franquicia.MASTERCARD ? "R08" : undefined,
          resultado: `Origen ${alerta.origen} · ${alerta.canal}`,
        },
      ),
      paso("r4", "Comparando el monto contra el patrón histórico del cliente", v(2000), {
        sistema: "monitor",
        regla: tx.atipico ? "R06" : undefined,
        resultado: tx.atipico
          ? `${formatPeso(tx.monto)} supera el patrón (promedio ${formatPeso(tx.promedioHistorico)}) · WhatsApp con prioridad`
          : `Dentro del patrón (promedio ${formatPeso(tx.promedioHistorico)})`,
      }),
      ...(bloqueado
        ? [
            paso("r5", "Solicitando bloqueo preventivo en PPE", v(2400), {
              sistema: "ppe",
              regla: "R02",
              resultado: `Bloqueo temporal ${ppe.bloqueoTemporal!.id} · tarjeta ····${ultimos} bloqueada`,
            }),
          ]
        : []),
      paso("r6", "Entregando a Agente Identificación", v(400)),
    ],
  });

  /* 2. Identificación */
  etapas.push({
    agente: "identificacion",
    pasos: [
      paso("i1", "Consultando titular en CRM Banco", v(1800), {
        sistema: "crm",
        estado: EstadoAlerta.EN_VERIFICACION_CRM,
        resultado: `${cliente.nombre} · CC ${cliente.cedula} · cliente desde ${cliente.clienteDesde}`,
      }),
      paso("i2", "Revisión de identificación (4 controles)", v(4200), {
        sistema: "crm",
        ok: !sinCelular,
        regla: sinCelular ? "R01" : undefined,
        resultado: sinCelular ? `3/4 controles · ${d.identificacion[1].detalle}` : "4/4 controles superados",
      }),
      ...(sinCelular
        ? [
            paso("i3", "Escalando a monitoreo manual", v(1500), {
              sistema: "monitor",
              regla: "R01",
              resultado: "Caso derivado al equipo de monitoreo · sin contacto por WhatsApp",
            }),
          ]
        : []),
      paso("i4", `Entregando a Agente ${sinCelular ? "Decisión" : "Comunicación"}`, v(400)),
    ],
  });

  /* 3. Comunicación (no aplica sin celular: R01 la salta) */
  if (!sinCelular) {
    const pasosCom: PasoPlan[] = [
      paso("c1", "Preparando plantilla HSM «alerta_transaccional»", v(1800), {
        sistema: "kari",
        regla: tx.atipico ? "R06" : undefined,
        resultado: `Variables: nombre, comercio, monto, ubicación, fecha${tx.atipico ? " · prioridad alta" : ""}`,
      }),
      paso("c2", "Enviando plantilla por WhatsApp Business", v(1600), {
        sistema: "kari",
        estado: EstadoAlerta.WHATSAPP_ENVIADO,
        resultado: `Entregado ✓✓ a ${hsm.entregadoA} · ${hsm.messageId.slice(0, 18)}…`,
      }),
    ];
    if (sinRespuesta) {
      pasosCom.push(
        paso("c3", "Esperando respuesta del cliente", v(5000), {
          tipo: "espera_humana",
          humano: d.titular,
          sistema: "whatsapp",
          estado: EstadoAlerta.ESPERANDO_CLIENTE,
          resultado: `Sin respuesta a los ${hsm.reintentoMin} min`,
        }),
        paso("c4", "Reintentando el envío de la plantilla", v(1600), {
          sistema: "kari",
          regla: "R10",
          resultado: `Segundo HSM entregado a los ${hsm.reintentoMin} min`,
        }),
        paso("c5", "Esperando respuesta (segundo intento)", v(5000), {
          tipo: "espera_humana",
          humano: d.titular,
          sistema: "whatsapp",
          ok: false,
          regla: "R05",
          resultado: `Sin respuesta · SLA de ${hsm.slaMin} min vencido`,
        }),
      );
    } else {
      pasosCom.push(
        paso("c3", "Esperando respuesta del cliente", v(9000), {
          tipo: "espera_humana",
          humano: d.titular,
          sistema: "whatsapp",
          estado: EstadoAlerta.ESPERANDO_CLIENTE,
          resultado:
            hsm.respuesta === "si"
              ? `«Sí fui yo» a los ${hsm.respuestaMin} min`
              : `«No fui yo» a los ${hsm.respuestaMin} min`,
        }),
      );
    }
    pasosCom.push(
      paso(
        "c6",
        sinRespuesta ? "Registrando la ausencia de respuesta" : "Registrando la respuesta del cliente",
        v(1200),
        {
          sistema: "kari",
          resultado: sinRespuesta
            ? "Sin respuesta registrada · pasa a Decisión"
            : `Respuesta «${hsm.respuesta === "si" ? "Sí fui yo" : "No fui yo"}» asociada a la alerta`,
        },
      ),
      paso("c7", "Entregando a Agente Decisión", v(400)),
    );
    etapas.push({ agente: "comunicacion", pasos: pasosCom });
  }

  /* 4. Decisión */
  const sistemaRiesgo: SistemaId | undefined = esVisa ? "cardinal" : undefined;
  const avisosRiesgo = d.riesgo.filter((c) => c.aviso).length;
  const pasosDec: PasoPlan[] = [
    paso("d1", "Revisión de riesgo (4 controles)", v(4400), {
      sistema: sistemaRiesgo,
      regla: tx.atipico ? "R06" : undefined,
      resultado: esVisa
        ? `4/4 revisados · score Cardinal ${d.scoreCardinal}/100 · ${avisosRiesgo} con aviso`
        : `3/3 aplicables · ${avisosRiesgo} con aviso · Cardinal no aplica (solo Visa)`,
    }),
    paso("d2", "Consultando el estado de la tarjeta en PPE", v(1600), {
      sistema: "ppe",
      resultado: bloqueado
        ? `Bloqueo temporal ${ppe.bloqueoTemporal!.id} activo`
        : "Sin bloqueo activo · tarjeta operativa",
    }),
  ];
  if (hsm.respuesta === "si") {
    pasosDec.push(
      paso("d3_desbloqueo", bloqueado ? "Desbloqueando la tarjeta" : "Confirmando la tarjeta operativa", v(2200), {
        sistema: "ppe",
        estado: EstadoAlerta.DESBLOQUEADO,
        regla: "R03",
        resultado: bloqueado
          ? `Bloqueo ${ppe.bloqueoTemporal!.id} levantado · ref ${ppe.referencia}`
          : `Sin bloqueo activo · restricción de la transacción liberada · ref ${ppe.referencia}`,
      }),
    );
  } else if (hsm.respuesta === "no") {
    pasosDec.push(
      paso("d3_definitivo", "Aplicando el bloqueo definitivo", v(2400), {
        sistema: "ppe",
        estado: EstadoAlerta.BLOQUEO_DEFINITIVO,
        regla: "R04",
        resultado: `Tarjeta ····${ultimos} inhabilitada · ref ${ppe.referencia}`,
      }),
    );
  } else {
    pasosDec.push(
      paso(
        "d3_preventivo",
        bloqueado ? "Manteniendo el bloqueo preventivo" : "Aplicando el bloqueo preventivo",
        v(2200),
        {
          sistema: "ppe",
          estado: EstadoAlerta.BLOQUEO_PREVENTIVO,
          regla: sinCelular ? "R02" : "R05",
          resultado: sinCelular
            ? `Sin contacto posible · bloqueo preventivo automático · ref ${ppe.referencia}`
            : `SLA de ${hsm.slaMin} min vencido · bloqueo preventivo ${bloqueado ? "mantenido" : "aplicado"} · ref ${ppe.referencia}`,
        },
      ),
      paso("d4", "Revisión de monitoreo manual", v(8000), {
        tipo: "espera_humana",
        humano: d.analista,
        sistema: "monitor",
        regla: sinCelular ? "R01" : "R05",
        resultado:
          d.desenlace === "legitima"
            ? "Legítima · el analista confirmó la compra con el titular"
            : "Fraude · el analista confirmó que el titular no reconoce la compra",
      }),
    );
    if (d.desenlace === "legitima") {
      pasosDec.push(
        paso("d5_desbloqueo", "Levantando el bloqueo preventivo (legítima)", v(2200), {
          sistema: "ppe",
          estado: EstadoAlerta.DESBLOQUEADO,
          resultado: `Bloqueo levantado · ref ${ppe.referencia}`,
        }),
      );
    } else {
      pasosDec.push(
        paso("d5_definitivo", "Aplicando el bloqueo definitivo (fraude)", v(2400), {
          sistema: "ppe",
          estado: EstadoAlerta.BLOQUEO_DEFINITIVO,
          resultado: `Tarjeta ····${ultimos} inhabilitada · ref ${ppe.referencia}`,
        }),
      );
    }
  }
  pasosDec.push(paso("d6", "Entregando a Agente Registro", v(400)));
  etapas.push({ agente: "decision", pasos: pasosDec });

  /* 5. Registro */
  const cierreBloqueado = escenario === "sin_tipificar";
  const recurrente = d.desenlace === "legitima" && cliente.desbloqueosLegitimos >= UMBRAL_RECURRENTE;
  const pasosReg: PasoPlan[] = [];
  if (cierreBloqueado) {
    pasosReg.push(
      paso("g1", "Cerrando el caso en CRM", v(2000), {
        sistema: "crm",
        ok: false,
        regla: "R11",
        resultado: "CRM rechazó el cierre: falta la tipificación obligatoria",
      }),
      paso("g2", "Registrando la tipificación obligatoria", v(2600), {
        sistema: "crm",
        estado: EstadoAlerta.TIPIFICADO,
        resultado: `${registro.categoria} · caso ${registro.casoCrm}`,
      }),
    );
  } else {
    pasosReg.push(
      paso("g1", "Tipificando el caso en CRM", v(2600), {
        sistema: "crm",
        estado: EstadoAlerta.TIPIFICADO,
        resultado: `${registro.categoria} · caso ${registro.casoCrm}`,
      }),
    );
  }
  pasosReg.push(
    paso("g3", `Sincronizando la tipificación en ${alerta.origen}`, v(1800), {
      sistema: alerta.sistemaOrigen,
      resultado: `Tipificación replicada en ${alerta.origen}`,
    }),
  );
  if (recurrente) {
    pasosReg.push(
      paso("g4", "Evaluando falso positivo recurrente", v(1600), {
        sistema: "crm",
        regla: "R09",
        resultado: `${cliente.desbloqueosLegitimos} desbloqueos legítimos · perfil marcado de bajo riesgo`,
      }),
    );
  }
  pasosReg.push(
    paso("g5", "Sellando la bitácora y el expediente", v(2400), {
      sistema: "expediente",
      resultado: `Expediente ${d.expediente.numero} · SHA-256 ${d.expediente.hash.slice(0, 12)}…`,
    }),
  );
  etapas.push({ agente: "registro", pasos: pasosReg });

  return etapas;
}

/**
 * Crea un caso determinista por `seq`. El Director de escena solo sobreescribe franquicia y
 * escenario: el sorteo natural se consume igual, así los casos siguientes no cambian.
 */
export function generarCaso(seq: number, ahora: number, opts?: OpcionesCaso): Caso {
  const rand = rngDesde(seq * 48271 + 11);
  const franquiciaNatural = elegirFranquicia(rand);
  const escenarioNatural = elegirEscenario(rand);
  const franquicia = opts?.franquicia ?? franquiciaNatural;
  const escenario = opts?.escenario ?? escenarioNatural;
  const datos = generarDatos(seq, franquicia, escenario, ahora);
  const plan = generarPlan(seq, franquicia, escenario, datos);
  const anio = Number(fechaCorta(ahora).slice(-4));
  return {
    id: `ALT-${anio}-${pad5(seq)}`,
    seq,
    franquicia,
    cliente: datos.cliente.nombre,
    tarjeta: datos.tarjeta.mascara,
    monto: datos.transaccion.monto,
    estadoAlerta: EstadoAlerta.PENDIENTE_REVISION,
    datos,
    escenario,
    plan,
    etapaIdx: 0,
    pasoIdx: 0,
    restante: plan[0].pasos[0].duracion,
    estado: "en_cola",
    recibidoEn: ahora,
    tiemposEtapa: {},
    pasosHechos: {},
    excepciones: 0,
    ultimoEvento: ahora,
  };
}

/** Guion sugerido de la demo (el Director de escena lo ofrece en este orden). */
export const ESCENAS: Escena[] = [
  {
    id: "legitima",
    etiqueta: "Falso positivo",
    sinopsis: "Visa con Cardinal: el titular responde «Sí fui yo», PPE libera la tarjeta y se tipifica como legítima.",
    franquicia: Franquicia.VISA,
    escenario: "legitima",
    reglas: ["R03", "R07"],
  },
  {
    id: "niega",
    etiqueta: "«No fui yo»",
    sinopsis: "Mastercard: el titular desconoce la compra y PPE aplica el bloqueo definitivo.",
    franquicia: Franquicia.MASTERCARD,
    escenario: "niega",
    reglas: ["R04", "R08"],
  },
  {
    id: "sin_respuesta",
    etiqueta: "Sin respuesta",
    sinopsis: "Reintento a los 15 min, SLA de 40 min vencido, bloqueo preventivo y decisión de un analista.",
    franquicia: Franquicia.VISA,
    escenario: "sin_respuesta",
    reglas: ["R10", "R05"],
  },
  {
    id: "sin_celular",
    etiqueta: "Sin celular en CRM",
    sinopsis: "Escalada a monitoreo manual, bloqueo preventivo automático y decisión de un analista.",
    franquicia: Franquicia.MASTERCARD,
    escenario: "sin_celular",
    reglas: ["R01", "R02"],
  },
  {
    id: "alto_riesgo",
    etiqueta: "Alto riesgo · monto atípico",
    sinopsis: "Compra en el exterior muy superior al patrón: bloqueo inmediato en recepción y WhatsApp con prioridad.",
    franquicia: Franquicia.VISA,
    escenario: "alto_riesgo",
    reglas: ["R06", "R02"],
  },
  {
    id: "recurrente",
    etiqueta: "Cliente recurrente",
    sinopsis: "Tres o más desbloqueos legítimos: el perfil se marca de bajo riesgo.",
    franquicia: Franquicia.MASTERCARD,
    escenario: "recurrente",
    reglas: ["R09"],
  },
  {
    id: "sin_tipificar",
    etiqueta: "Cierre bloqueado",
    sinopsis: "CRM rechaza el cierre sin tipificación; el agente la registra y el caso se cierra.",
    franquicia: Franquicia.VISA,
    escenario: "sin_tipificar",
    reglas: ["R11"],
  },
  {
    id: "visa",
    etiqueta: "Alerta Visa",
    sinopsis: "Origen VRM, canal Visa y score de Cardinal en la revisión de riesgo.",
    franquicia: Franquicia.VISA,
    escenario: "legitima",
    reglas: ["R07"],
  },
  {
    id: "mastercard",
    etiqueta: "Alerta Mastercard",
    sinopsis: "Origen EMS/MS, canal Mastercard; Cardinal no aplica.",
    franquicia: Franquicia.MASTERCARD,
    escenario: "legitima",
    reglas: ["R08"],
  },
  {
    id: "monitor",
    etiqueta: "Alerta Monitor",
    sinopsis: "Alerta interna del motor del banco, sin canal de red.",
    franquicia: Franquicia.MONITOR,
    escenario: "legitima",
    reglas: [],
  },
];

export const ESCENARIO_LABEL: Record<Escenario, string> = {
  legitima: "Falso positivo",
  niega: "«No fui yo»",
  sin_respuesta: "Sin respuesta",
  sin_celular: "Sin celular en CRM",
  alto_riesgo: "Alto riesgo",
  recurrente: "Cliente recurrente",
  sin_tipificar: "Cierre bloqueado",
};
