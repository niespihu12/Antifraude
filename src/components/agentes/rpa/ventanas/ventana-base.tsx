"use client";

import { memo } from "react";
import type { VentanaId } from "@/types/agentes";
import { progresoEfectivo } from "@/components/agentes/guion";
import VentanaSistema from "../ventana-sistema";
import type { PropsVentana } from "../tipos";

/** Título de la barra según la vista (la ventana «revision» aloja dos listas de chequeo). */
const TITULO_VISTA: Partial<Record<string, string>> = {
  "revision.identificacion": "Revisión de identificación · 4 controles",
  "revision.riesgo": "Revisión de riesgo · 4 controles",
};

/**
 * Cuerpo provisional de una ventana (contrato de Fase 1): enmarca la pantalla con
 * el cromo real del sistema y muestra qué vista y qué paso estarían en curso.
 * Fase 2 reemplaza el cuerpo de cada ventana por su réplica; el marco no cambia.
 */
function VentanaBase({
  ventana,
  caso,
  vista,
  paso,
  progreso,
  velocidad,
  actor,
  medir,
  relojSim,
}: PropsVentana & { ventana: VentanaId }) {
  const p = progresoEfectivo(progreso, velocidad);
  return (
    <VentanaSistema
      ventana={ventana}
      titulo={TITULO_VISTA[vista]}
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={caso.datos.sesion}
      relojSim={relojSim}
      medir={medir}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-500">
        <div className="text-[12px] font-semibold text-slate-700">{vista}</div>
        <div className="max-w-[80%] truncate text-[11px]">{paso?.texto ?? "En espera"}</div>
        <div className="text-[10px] italic">Pantalla en construcción · {Math.round(p * 100)} %</div>
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaBase);
