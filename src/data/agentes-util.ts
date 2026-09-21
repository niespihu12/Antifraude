/**
 * Utilidades sin dependencias del resto de agentes-data: las importan los guiones
 * (src/data/guiones/*) y las ventanas del escritorio RPA, evitando ciclos.
 */
import { EstadoAlerta } from "@/types";
import type { FaseProcesoKey } from "@/context/simulation-context";
import { formatCOP } from "@/lib/utils";

export const formatPeso = formatCOP;

/** 1.280.000 → «$ 1,28 M»; por debajo del millón se deja completo. */
export function formatPesoCorto(n: number): string {
  if (n < 1_000_000) return formatCOP(n);
  return `$ ${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 2 })} M`;
}

export function fechaCorta(ts: number): string {
  const d = new Date(ts - 5 * 3_600_000);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** «Sí» → 'si', «Guardar todos…» → 'guardar-todos'. */
export function slugAncla(etiqueta: string): string {
  return etiqueta
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Fase del proceso a la que pertenece cada estado según la máquina de estados de la ontología. */
export function faseDeEstado(estado: EstadoAlerta): FaseProcesoKey {
  switch (estado) {
    case EstadoAlerta.EN_VERIFICACION_CRM:
      return "identificacion";
    case EstadoAlerta.WHATSAPP_ENVIADO:
    case EstadoAlerta.ESPERANDO_CLIENTE:
      return "comunicacion";
    case EstadoAlerta.BLOQUEO_PREVENTIVO:
    case EstadoAlerta.DESBLOQUEADO:
    case EstadoAlerta.BLOQUEO_DEFINITIVO:
      return "decision";
    case EstadoAlerta.TIPIFICADO:
      return "registro";
    case EstadoAlerta.PENDIENTE_REVISION:
    default:
      return "recepcion";
  }
}

/** Mínimo de desbloqueos legítimos previos para marcar al cliente como falso positivo recurrente (R09). */
export const UMBRAL_RECURRENTE = 3;
/** Monto desde el cual una alerta se considera de alto riesgo (mismo umbral de «urgente» del simulador). */
export const UMBRAL_ALTO_RIESGO = 5_000_000;
/** SLA de respuesta del cliente y minuto del reintento HSM (R05, R10). */
export const SLA_MIN = 40;
export const REINTENTO_MIN = 15;
