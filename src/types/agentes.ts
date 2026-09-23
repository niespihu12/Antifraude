import type { EstadoAlerta, Franquicia } from "@/types";

/* ─── Agentes ─── */
export type AgenteId = "recepcion" | "identificacion" | "comunicacion" | "decision" | "registro";

export type SistemaId = "monitor" | "vrm" | "ems" | "crm" | "kari" | "whatsapp" | "cardinal" | "ppe" | "expediente";

export interface AgenteDef {
  id: AgenteId;
  nombre: string;
  rol: string;
  sistema: SistemaId;
  sistemas: SistemaId[];
  color: string;
  descripcion: string;
}

/* ─── Plan de ejecución de un caso ─── */
export type TipoPaso = "accion" | "espera_humana" | "espera_sistema";

export interface Humano {
  nombre: string;
  rol: string;
  area: string;
  color?: string;
}

/* ─── Escritorio RPA: guion de interfaz por paso ─── */
/** Ventana del escritorio: «revision» agrupa las dos listas de chequeo (identificación y riesgo). */
export type VentanaId = "monitor" | "vrm" | "ems" | "crm" | "kari" | "whatsapp" | "revision" | "ppe" | "expediente";

export type Vista =
  | "monitor.cola"
  | "monitor.detalle"
  | "monitor.sync"
  | "monitor.manual"
  | "vrm.alerta"
  | "ems.alerta"
  | "crm.cliente"
  | "crm.tipificacion"
  | "revision.identificacion"
  | "revision.riesgo"
  | "kari.plantilla"
  | "kari.conversacion"
  | "whatsapp.chat"
  | "ppe.consulta"
  | "ppe.bloqueo"
  | "ppe.confirmacion"
  | "expediente.acta";

export type ActorUI = "agente" | "humano";
export type TipoAccionUI =
  | "ventana"
  | "mover"
  | "clic"
  | "clicDerecho"
  | "teclear"
  | "pegar"
  | "tecla"
  | "dialogo"
  | "toast"
  | "estado"
  | "resaltar"
  | "scroll"
  | "barrido"
  | "arrastrar";
export type NivelUI = "ok" | "aviso" | "error" | "info";

export interface DialogoUI {
  tipo: "confirmar" | "progreso" | "error" | "info" | "menu";
  titulo: string;
  cuerpo?: string;
  /** Anclas automáticas dlg.btn.<slug>. */
  botones?: string[];
  regla?: string;
  /** 'menu': opciones; 'progreso': una barra por ítem. */
  items?: string[];
  /** Etiqueta de un campo de texto dentro del diálogo (ancla dlg.campo.<slug>). */
  campo?: string;
}

export interface AccionUI {
  /** Inicio (0–1 del paso). */
  t: number;
  /** Fin; por defecto: tecla t+0.06, toast/estado t+0.25, clic t+0.05, resto hasta el fin del paso. */
  hasta?: number;
  tipo: TipoAccionUI;
  /** Destino del cursor / campo objetivo; 'arrastrar' usa ancla (origen) + destino. */
  ancla?: string;
  destino?: string;
  /** teclear/pegar (valor), toast/estado (mensaje), resaltar (etiqueta). */
  texto?: string;
  tecla?: string;
  dialogo?: DialogoUI;
  /** tipo 'ventana'. */
  vista?: Vista;
  /** Por defecto 'agente'. */
  actor?: ActorUI;
  /** Teclear con «●». */
  mascara?: boolean;
  nivel?: NivelUI;
}

export interface PasoPlan {
  id: string;
  texto: string;
  duracion: number;
  tipo?: TipoPaso;
  resultado?: string;
  ok?: boolean;
  /** Código de regla de negocio (R01…R12) que este paso aplica. */
  regla?: string;
  sistema?: SistemaId;
  bitacora?: string;
  /** Estado global de la alerta que fija este paso. */
  estado?: EstadoAlerta;
  humano?: Humano;
  /** Guion de interfaz (escritorio RPA): pantalla abierta, acciones del cursor y pensamiento del agente. */
  vista?: Vista;
  ui?: AccionUI[];
  pensamiento?: string;
}

export interface EtapaPlan {
  agente: AgenteId;
  pasos: PasoPlan[];
}

/**
 * Escenario del caso (derivado de las reglas de negocio). Todos terminan en
 * «Tipificado»: la máquina de estados no tiene salidas anticipadas.
 */
export type Escenario =
  "legitima" | "niega" | "sin_respuesta" | "sin_celular" | "alto_riesgo" | "recurrente" | "sin_tipificar";

export type RespuestaCliente = "si" | "no" | "ninguna";
export type Desenlace = "legitima" | "fraude";

export interface OpcionesCaso {
  franquicia?: Franquicia;
  escenario?: Escenario;
}

export interface Escena {
  id: string;
  etiqueta: string;
  sinopsis: string;
  franquicia: Franquicia;
  escenario: Escenario;
  /** Regla(s) que la escena hace visible(s). */
  reglas: string[];
}

/* ─── Datos sintéticos que ven las pantallas ─── */
export type OrigenAlerta = "Monitor" | "VRM" | "EMS/MS";

export interface DatosAlerta {
  /** Identificador de la alerta en el sistema de origen. */
  referencia: string;
  origen: OrigenAlerta;
  sistemaOrigen: "monitor" | "vrm" | "ems";
  canal: string;
  /** Instante en que el origen emitió la alerta. */
  emitidaEn: number;
  motivo: string;
  altoRiesgo: boolean;
  prioridad: "Alta" | "Media";
  /** Fuera del horario laboral (R12): procesa el orquestador automático. */
  fueraDeHorario: boolean;
}

export interface DatosCliente {
  nombre: string;
  primerNombre: string;
  cedula: string;
  celular: string | null;
  /** Fecha (dd/mm/aaaa) de la última actualización de datos de contacto. */
  fechaActualizacion: string;
  ciudad: string;
  /** Desbloqueos legítimos previos (R09 con 3 o más). */
  desbloqueosLegitimos: number;
  clienteDesde: number;
}

export interface DatosTarjeta {
  mascara: string;
  ultimos4: string;
  franquicia: Franquicia;
  producto: string;
  limite: number;
}

export interface DatosTransaccion {
  id: string;
  comercio: string;
  categoria: string;
  mcc: string;
  ciudad: string;
  pais: string;
  monto: number;
  fechaHora: number;
  canal: string;
  /** Monto promedio histórico del cliente (base de R06). */
  promedioHistorico: number;
  atipico: boolean;
  exterior: boolean;
}

export interface ControlChequeo {
  id: string;
  nombre: string;
  detalle: string;
  ok: boolean;
  /** Coincidencia parcial o dato a tener en cuenta (no bloquea). */
  aviso?: boolean;
  regla?: string;
  /** El control no aplica a esta alerta (p. ej. Cardinal fuera de Visa). */
  noAplica?: boolean;
}

export interface DatosHSM {
  plantilla: string;
  messageId: string;
  /** Mensajes que recibe el cliente (texto de WhatsApp, en orden). */
  mensajes: string[];
  respuesta: RespuestaCliente;
  /** Minuto (desde el envío) en que responde el cliente; null si no responde. */
  respuestaMin: number | null;
  /** Minuto del reintento (R10) y SLA total (R05). */
  reintentoMin: number;
  slaMin: number;
  /** Texto con el que Kari cierra la conversación según la respuesta. */
  cierre: string | null;
  entregadoA: string;
}

export interface DatosPPE {
  /** Bloqueo temporal creado al recibir una alerta de alto riesgo (R02). */
  bloqueoTemporal: { id: string; motivo: string } | null;
  referencia: string;
}

/** Categorías de cierre del catálogo de tipificación de CRM (guion: legítima, fraude, sin respuesta). */
export const CATEGORIAS_TIPIFICACION = ["Legítima", "Fraude", "Sin respuesta"] as const;
export type CategoriaTipificacion = (typeof CATEGORIAS_TIPIFICACION)[number];

export interface DatosRegistro {
  casoCrm: string;
  categoria: CategoriaTipificacion;
  /** Causa registrada en la tipificación (cómo se resolvió). */
  causa: string;
}

export interface DatosCaso {
  alerta: DatosAlerta;
  cliente: DatosCliente;
  tarjeta: DatosTarjeta;
  transaccion: DatosTransaccion;
  identificacion: ControlChequeo[];
  riesgo: ControlChequeo[];
  scoreCardinal: number | null;
  hsm: DatosHSM;
  ppe: DatosPPE;
  registro: DatosRegistro;
  /** Resultado final del caso (según cliente o analista). */
  desenlace: Desenlace;
  /** Quien decide fuera del software cuando el cliente no responde o no hay celular. */
  analista: Humano;
  /** El titular como actor humano (su teléfono es la pantalla de la espera). */
  titular: Humano;
  expediente: { numero: string; hash: string };
  sesion: { usuario: string; servidor: string; terminal: string; vm: string };
}

/* ─── Estado vivo de un caso ─── */
export type EstadoCaso = "en_cola" | "procesando" | "esperando" | "terminada";
export type ResultadoCaso = Desenlace;

export interface PasoHecho {
  ok: boolean;
  resultado?: string;
  t: number;
}

export interface Caso {
  /** Identificador de la alerta (ALT-AAAA-NNNNN); es también el de la fila del pipeline. */
  id: string;
  seq: number;
  franquicia: Franquicia;
  cliente: string;
  tarjeta: string;
  monto: number;
  estadoAlerta: EstadoAlerta;
  datos: DatosCaso;
  escenario: Escenario;
  plan: EtapaPlan[];
  etapaIdx: number;
  pasoIdx: number;
  restante: number;
  estado: EstadoCaso;
  resultado?: ResultadoCaso;
  recibidoEn: number;
  terminadoEn?: number;
  tiemposEtapa: Partial<Record<AgenteId, { inicio: number; fin?: number }>>;
  pasosHechos: Record<string, PasoHecho>;
  excepciones: number;
  ultimoEvento: number;
  /** Etiqueta de la escena elegida por el Director de escena (si la hubo). */
  escenaForzada?: string;
}

export interface EntradaBitacora {
  id: number;
  t: number;
  agente: AgenteId;
  casoId: string;
  mensaje: string;
  sistema?: SistemaId;
  nivel: "info" | "ok" | "aviso" | "error" | "handoff";
  regla?: string;
}

export interface EstadoAgente {
  id: AgenteId;
  activo: string | null;
  cola: string[];
  procesadas: number;
  ocupadoMs: number;
  ultimaAccion: string;
}

export interface Snapshot {
  version: number;
  ahora: number;
  relojSim: number;
  velocidad: number;
  casos: Caso[];
  agentes: Record<AgenteId, EstadoAgente>;
  bitacora: EntradaBitacora[];
  focoId: string | null;
  autoSeguir: boolean;
  corriendo: boolean;
  handoffs: { id: number; de: AgenteId; a: AgenteId; casoId: string; t: number }[];
  stats: {
    recibidas: number;
    terminadas: number;
    legitimas: number;
    fraudes: number;
    escaladas: number;
    excepciones: number;
    cicloPromedioMs: number;
    accionesTotales: number;
  };
}
