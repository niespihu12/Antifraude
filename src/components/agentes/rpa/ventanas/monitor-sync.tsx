"use client";

import { Check, RefreshCw } from "lucide-react";
import type { Caso, PasoPlan } from "@/types/agentes";
import { estadoAncla } from "@/components/agentes/guion";
import { BarraProgreso, Spinner } from "@/components/agentes/ui";
import { CROMO } from "@/components/agentes/rpa/cromo";
import { SISTEMAS } from "@/data/agentes-data";
import { T, avancePaso, tramo } from "@/data/guiones/monitor-datos";
import { BotonWeb, Insignia, Tarjeta } from "./monitor-piezas";

const FILAS = [
  { clave: "monitor", nombre: "Monitor", endpoint: CROMO.monitor.url },
  { clave: "brm", nombre: "BRM", endpoint: CROMO.brm.url },
  { clave: "ems", nombre: "EMS/MS", endpoint: CROMO.ems.url },
] as const;

const CLASE_CATEGORIA: Record<string, string> = {
  Legítima: "bg-emerald-100 text-emerald-700",
  Fraude: "bg-red-100 text-[#E31837]",
  "Sin respuesta": "bg-slate-100 text-slate-700",
};

/**
 * monitor.sync (g3) · replica la tipificación en el sistema de origen. Solo el origen real de la
 * alerta pasa de pendiente a sincronizando y a replicada; los otros dos no tienen nada que replicar.
 */
export default function PanelSync({ caso, paso, p, color }: { caso: Caso; paso?: PasoPlan; p: number; color: string }) {
  const d = caso.datos;
  const pG3 = avancePaso(caso, paso, p, "g3");
  const inicia = pG3 >= T.g3.inicia;
  const replicada = pG3 >= T.g3.fin;
  const avance = tramo(pG3, [T.g3.inicia, T.g3.fin]);
  const eBoton = estadoAncla(paso, p, "mon.btn.sincronizar");

  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-1.5 overflow-hidden text-[10.5px]">
      <div className="h-[22px] shrink-0 flex items-center gap-2 whitespace-nowrap">
        <span className="text-[11px] font-semibold text-slate-800 truncate">Sincronización de la tipificación</span>
        {replicada ? (
          <Insignia
            texto={`Tipificación replicada en ${d.alerta.origen}`}
            clase="bg-emerald-100 text-emerald-700"
            className="animate-scale-pulse"
          />
        ) : inicia ? (
          <Insignia texto="Sincronizando…" clase="bg-blue-100 text-blue-700" />
        ) : (
          <Insignia texto="Pendiente de replicar" clase="bg-amber-100 text-amber-700" />
        )}
        <span className="ml-auto shrink-0">
          <BotonWeb
            ancla="mon.btn.sincronizar"
            texto="Sincronizar con origen"
            color={color}
            presionado={eBoton.clic}
            deshabilitado={inicia}
            icono={<RefreshCw className="w-3 h-3" />}
          />
        </span>
      </div>

      <Tarjeta className="shrink-0" titulo="Tipificación a replicar">
        <div className="px-2 py-1 grid grid-cols-3 gap-x-3 gap-y-0.5 text-[10px]">
          <div className="flex gap-1 min-w-0">
            <span className="text-slate-400 shrink-0">Alerta</span>
            <span className="truncate font-mono-jetbrains text-slate-800">{d.alerta.referencia}</span>
          </div>
          <div className="flex gap-1 min-w-0">
            <span className="text-slate-400 shrink-0">Caso CRM</span>
            <span className="truncate font-mono-jetbrains text-slate-800">{d.registro.casoCrm}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-slate-400 shrink-0">Tipificación</span>
            <Insignia texto={d.registro.categoria} clase={CLASE_CATEGORIA[d.registro.categoria]} />
          </div>
          <div className="col-span-3 flex gap-1 min-w-0">
            <span className="text-slate-400 shrink-0">Causa</span>
            <span className="truncate text-slate-700">{d.registro.causa}</span>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta className="shrink-0" titulo="Sistemas de origen" derecha={`origen: ${d.alerta.origen}`}>
        {FILAS.map((f) => {
          const esOrigen = f.clave === d.alerta.sistemaOrigen;
          const e = estadoAncla(paso, p, `mon.fila.${f.clave}`);
          return (
            <div
              key={f.clave}
              data-ancla={`mon.fila.${f.clave}`}
              className={`h-[24px] grid grid-cols-[8px_54px_minmax(80px,1fr)_92px_84px] gap-x-2 items-center px-2 border-b border-slate-100 text-[10px] ${esOrigen && inicia && !replicada ? "bg-blue-50" : esOrigen && replicada ? "bg-emerald-50" : ""} ${e.foco ? "ring-1 ring-inset ring-blue-300" : ""}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SISTEMAS[f.clave].color }} />
              <span className={esOrigen ? "font-semibold text-slate-900" : "text-slate-600"}>{f.nombre}</span>
              <span
                className={`truncate font-mono-jetbrains text-[9.5px] ${esOrigen ? "text-slate-600" : "text-slate-400"}`}
              >
                {f.endpoint}
              </span>
              {esOrigen ? (
                replicada ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Check className="w-3 h-3" strokeWidth={3} /> Replicada
                  </span>
                ) : inicia ? (
                  <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                    <Spinner className="w-3 h-3" color="#1d4ed8" /> Sincronizando
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">Pendiente</span>
                )
              ) : (
                <span className="text-slate-400">Sin cambios</span>
              )}
              {esOrigen ? (
                <span className="flex items-center gap-1">
                  <span className="flex-1">
                    <BarraProgreso valor={replicada ? 1 : avance} color={replicada ? "#059669" : color} alto={5} />
                  </span>
                  <span className="w-7 text-right font-mono-jetbrains text-[9px] text-slate-500 tabular-nums">
                    {Math.round((replicada ? 1 : avance) * 100)} %
                  </span>
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 truncate">origen distinto</span>
              )}
            </div>
          );
        })}
      </Tarjeta>
    </div>
  );
}
