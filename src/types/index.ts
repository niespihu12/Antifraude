export enum EstadoAlerta {
  PENDIENTE_REVISION = "Pendiente Revisión",
  EN_VERIFICACION_CRM = "En Verificación CRM",
  WHATSAPP_ENVIADO = "WhatsApp Enviado",
  ESPERANDO_CLIENTE = "Esperando Cliente",
  BLOQUEO_PREVENTIVO = "Bloqueo Preventivo",
  DESBLOQUEADO = "Desbloqueado",
  BLOQUEO_DEFINITIVO = "Bloqueo Definitivo",
  TIPIFICADO = "Tipificado",
}

export enum Franquicia {
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  MONITOR = "MONITOR",
}

export interface Alerta {
  id: string;
  franquicia: Franquicia;
  tarjeta: string;
  monto: number;
  estado: EstadoAlerta;
  tiempo: string;
  cliente: string;
  area: string;
  fecha: string;
}

export interface FaseProceso {
  recepcion: number;
  identificacion: number;
  comunicacion: number;
  decision: number;
  registro: number;
}

export interface MetricaKPI {
  label: string;
  valor: string | number;
  tendencia: string;
  icono: string;
  color: string;
}