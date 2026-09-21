import {
  Activity,
  ClipboardCheck,
  CreditCard,
  Database,
  FilePen,
  LockKeyhole,
  MessageCircle,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { VentanaId } from "@/types/agentes";

export type TipoCromo = "web" | "escritorio" | "clasico";

export interface Cromo {
  titulo: string;
  tipo: TipoCromo;
  /** Color de la barra de título. */
  barra: string;
  /** Fondo del cuerpo. */
  fondo: string;
  menu?: string[];
  url?: string;
  icono: LucideIcon;
  /** Nombre corto para la barra de tareas. */
  corto: string;
}

/**
 * Apariencia de cada sistema del banco. Sin logos ni marcas: solo el nombre del
 * sistema; los dominios son internos y ficticios (*.corp.local).
 */
export const CROMO: Record<VentanaId, Cromo> = {
  monitor: {
    titulo: "Monitor · Consola de alertas antifraude",
    tipo: "web",
    barra: "#334155",
    fondo: "#f8fafc",
    url: "monitor.antifraude.corp.local/alertas",
    icono: Activity,
    corto: "Monitor",
  },
  brm: {
    titulo: "BRM · Alertas de fraude Visa",
    tipo: "web",
    barra: "#1d4ed8",
    fondo: "#f8fafc",
    url: "brm.antifraude.corp.local/visa/alertas",
    icono: CreditCard,
    corto: "BRM",
  },
  ems: {
    titulo: "EMS/MS · Alertas de fraude Mastercard",
    tipo: "web",
    barra: "#b91c1c",
    fondo: "#fef2f2",
    url: "ems.antifraude.corp.local/mastercard/alertas",
    icono: CreditCard,
    corto: "EMS/MS",
  },
  crm: {
    titulo: "CRM Banco · Gestión de clientes y casos",
    tipo: "clasico",
    barra: "#0a246a",
    fondo: "#ece9d8",
    menu: ["Archivo", "Clientes", "Casos", "Tipificación", "Reportes", "Ayuda"],
    icono: Database,
    corto: "CRM",
  },
  kari: {
    titulo: "Kari AI · Consola de conversaciones",
    tipo: "web",
    barra: "#047857",
    fondo: "#f0fdf4",
    url: "kari.antifraude.corp.local/hsm/conversaciones",
    icono: MessageCircle,
    corto: "Kari AI",
  },
  whatsapp: {
    titulo: "Teléfono del titular · WhatsApp",
    tipo: "escritorio",
    barra: "#15803d",
    fondo: "#e2e8f0",
    menu: ["Chat", "Ver"],
    icono: Smartphone,
    corto: "WhatsApp",
  },
  revision: {
    titulo: "Lista de chequeo · Revisión",
    tipo: "escritorio",
    barra: "#475569",
    fondo: "#f8fafc",
    menu: ["Revisión", "Controles", "Ver"],
    icono: ClipboardCheck,
    corto: "Revisión",
  },
  ppe: {
    titulo: "PPE · Bloqueo y desbloqueo de tarjetas",
    tipo: "clasico",
    barra: "#2e1a6b",
    fondo: "#ece9d8",
    menu: ["Archivo", "Tarjetas", "Bloqueos", "Consultas", "Ayuda"],
    icono: LockKeyhole,
    corto: "PPE",
  },
  expediente: {
    titulo: "Expediente digital · Trazabilidad 24/7",
    tipo: "escritorio",
    barra: "#334155",
    fondo: "#f8fafc",
    menu: ["Expediente", "Evidencias", "Auditoría"],
    icono: FilePen,
    corto: "Expediente",
  },
};

/** Orden fijo de la barra de tareas (Expediente solo cuando el agente es Registro; el teléfono del titular nunca). */
export const ORDEN_TASKBAR: VentanaId[] = ["monitor", "brm", "ems", "crm", "kari", "revision", "ppe"];
