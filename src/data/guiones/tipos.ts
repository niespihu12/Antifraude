import type { Franquicia } from "@/types";
import type { DatosCaso, Escenario, Humano, PasoPlan, SistemaId, Vista } from "@/types/agentes";

/** Contexto que recibe cada guion al construirse el plan de un caso. */
export interface CtxGuion {
  d: DatosCaso;
  franquicia: Franquicia;
  escenario: Escenario;
  seq: number;
  id: string;
  duracion: number;
  ok: boolean;
  humano?: Humano;
  sistema?: SistemaId;
}

/** Un guion devuelve la pantalla abierta, las acciones del cursor y el pensamiento del agente para un paso. */
export type Guion = (c: CtxGuion) => Pick<PasoPlan, "vista" | "ui" | "pensamiento">;

/**
 * Clave del guion: `id` del paso (i2, c3, d3_desbloqueo…) o `${franquicia}:${id}`
 * cuando el mismo id abre otra pantalla según la franquicia (VISA:r1 → BRM, MASTERCARD:r1 → EMS/MS).
 */
export type Guiones = Record<string, Guion>;

/** Guion mínimo del contrato: solo declara la pantalla; Fase 2 añade `ui` y `pensamiento`. */
export const soloVista =
  (vista: Vista): Guion =>
  () => ({ vista });
