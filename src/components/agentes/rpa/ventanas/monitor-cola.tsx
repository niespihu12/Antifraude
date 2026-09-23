"use client";

import { useMemo } from "react";
import { Search, UserRoundCog } from "lucide-react";
import { EstadoAlerta } from "@/types";
import type { Caso, PasoPlan } from "@/types/agentes";
import { estadoAncla } from "@/components/agentes/guion";
import { formatPeso } from "@/data/agentes-util";
import {
  T,
  alertasPrevias,
  avancePaso,
  causaManual,
  conteosCola,
  filaActual,
  manualPrevios,
  type FilaAlerta,
} from "@/data/guiones/monitor-datos";
import { BotonWeb, InsigniaEstado, Tarjeta } from "./monitor-piezas";

const COLUMNAS = "grid grid-cols-[8px_84px_minmax(56px,1fr)_58px_70px_100px] gap-x-1 items-center px-1.5";

const TABS = [
  { clave: "monitor", etiqueta: "Monitor" },
  { clave: "vrm", etiqueta: "VRM" },
  { clave: "ems", etiqueta: "EMS/MS" },
] as const;

function FilaTabla({
  fila,
  ancla,
  seleccionada = false,
  resaltada = false,
  entra = false,
}: {
  fila: FilaAlerta;
  ancla?: string;
  seleccionada?: boolean;
  resaltada?: boolean;
  entra?: boolean;
}) {
  return (
    <div
      data-ancla={ancla}
      className={`${COLUMNAS} h-[16px] text-[10px] border-b border-slate-100 border-l-2 ${entra ? "animate-slide-in-up" : ""} ${resaltada ? "bg-amber-100" : seleccionada ? "bg-blue-50" : "bg-white"} ${seleccionada ? "border-l-blue-600" : "border-l-transparent"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${fila.prioridad === "Alta" ? "bg-[#E31837]" : "bg-slate-300"}`} />
      <span className="font-mono-jetbrains truncate text-slate-800">{fila.referencia}</span>
      <span className="truncate text-slate-700">{fila.cliente}</span>
      <span className="font-mono-jetbrains text-right tabular-nums text-slate-700">{formatPeso(fila.monto)}</span>
      <span className="truncate text-slate-600">{fila.motivo}</span>
      <span className="flex">
        <InsigniaEstado estado={fila.estado} className="!h-[13px] !text-[9px] max-w-full overflow-hidden" />
      </span>
    </div>
  );
}

/**
 * monitor.cola · consola de alertas antifraude. r1 (alertas MONITOR): la alerta entra a la cola y se
 * selecciona. i3 (solo sin_celular): el agente la marca «Escalar a monitoreo manual» (R01) y el caso
 * pasa a la cola de monitoreo manual. Las otras filas se derivan de forma determinista de `caso.id`.
 */
export default function PanelCola({ caso, paso, p, color }: { caso: Caso; paso?: PasoPlan; p: number; color: string }) {
  const d = caso.datos;
  const previas = useMemo(() => alertasPrevias(caso.id, d, 6), [caso.id, d]);
  const manualOtros = useMemo(() => manualPrevios(caso.id, d, 2), [caso.id, d]);
  const cuentas = useMemo(() => conteosCola(caso.id, d, previas.length + 1), [caso.id, d, previas.length]);

  const pR1 = avancePaso(caso, paso, p, "r1");
  const esSinCelular = caso.escenario === "sin_celular";
  const pI3 = esSinCelular ? avancePaso(caso, paso, p, "i3") : 0;
  // Con el escalamiento (i3) hecho o en curso, la selección y el estado dependen de i3; si no, de r1.
  const enI3 = esSinCelular && (paso?.id === "i3" || pI3 >= 1);
  const presente = pR1 >= T.r1.aparece;
  const seleccionada = enI3 ? pI3 >= T.i3.selecciona : pR1 >= T.r1.selecciona;
  const escalada = enI3 && pI3 >= T.i3.escalada;
  const enManual = enI3 && pI3 >= T.i3.casoEnCola;

  const eFila = estadoAncla(paso, p, "mon.fila.alerta");
  const eEscalar = estadoAncla(paso, p, "mon.btn.escalar");
  const eManual = estadoAncla(paso, p, "mon.fila.manual");

  const estadoFila = escalada
    ? "Monitoreo manual"
    : enI3
      ? EstadoAlerta.EN_VERIFICACION_CRM
      : EstadoAlerta.PENDIENTE_REVISION;
  const actual = filaActual(d, estadoFila);
  const tabActiva = d.alerta.sistemaOrigen;
  const nManual = manualOtros.length + (enManual ? 1 : 0);

  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-1.5 overflow-hidden text-[10.5px]">
      {/* Pestañas por origen */}
      <div className="h-[20px] shrink-0 flex items-end gap-0.5 border-b border-slate-200 whitespace-nowrap">
        {TABS.map((t) => (
          <span
            key={t.clave}
            data-ancla={`mon.tab.${t.clave}`}
            className={`px-2 h-[19px] flex items-center gap-1 text-[10.5px] rounded-t border-b-2 ${t.clave === tabActiva ? "text-slate-900 font-semibold border-slate-700 bg-white" : "text-slate-500 border-transparent"}`}
          >
            {t.etiqueta}
            <span className="font-mono-jetbrains text-[9.5px] text-slate-500">{cuentas[t.clave]}</span>
          </span>
        ))}
        <span className="ml-auto pb-[3px] text-[9.5px] text-slate-500 truncate">
          Alertas del día <span className="font-mono-jetbrains text-slate-700">{cuentas.hoy}</span> · monitoreo 24/7
        </span>
      </div>

      {/* Herramientas */}
      <div className="h-[22px] shrink-0 flex items-center gap-2 whitespace-nowrap">
        <span className="flex items-center gap-1 h-5 w-[128px] px-1.5 rounded border border-slate-200 bg-white text-slate-400 text-[10px]">
          <Search className="w-3 h-3 shrink-0" />
          Buscar referencia
        </span>
        <span className="min-w-0 truncate text-[10px] text-slate-500">
          {seleccionada ? (
            <>
              1 seleccionada · <span className="font-mono-jetbrains text-slate-700">{d.alerta.referencia}</span>
            </>
          ) : (
            "Ninguna alerta seleccionada"
          )}
        </span>
        <span className="ml-auto shrink-0">
          <BotonWeb
            ancla="mon.btn.escalar"
            texto="Escalar a monitoreo manual"
            color={color}
            presionado={eEscalar.clic}
            deshabilitado={!seleccionada || escalada}
            icono={<UserRoundCog className="w-3 h-3" />}
          />
        </span>
      </div>

      {/* Lista + cola manual */}
      <div className="flex-1 min-h-0 flex gap-1.5">
        <Tarjeta
          className="flex-1 min-w-0"
          titulo={`Alertas recientes · ${d.alerta.origen}`}
          derecha={`${previas.length + 1} de ${cuentas[tabActiva]} abiertas`}
        >
          <div
            className={`${COLUMNAS} h-[15px] text-[9px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-50 border-b border-slate-100`}
          >
            <span />
            <span>Referencia</span>
            <span>Cliente</span>
            <span className="text-right">Monto</span>
            <span>Motivo</span>
            <span>Estado</span>
          </div>
          {presente && (
            <FilaTabla
              fila={actual}
              ancla="mon.fila.alerta"
              seleccionada={seleccionada}
              resaltada={eFila.resaltado}
              entra={paso?.id === "r1"}
            />
          )}
          {previas.map((f) => (
            <FilaTabla key={f.referencia} fila={f} />
          ))}
        </Tarjeta>

        <Tarjeta className="w-[152px] shrink-0" borde="border-amber-200" titulo={`Monitoreo manual (${nManual})`}>
          {enManual && (
            <div
              key="caso-manual"
              data-ancla="mon.fila.manual"
              className={`animate-slide-in-up px-1.5 py-[3px] border-b border-slate-100 border-l-2 border-l-amber-500 ${eManual.resaltado ? "bg-amber-100" : "bg-amber-50"}`}
            >
              <div className="flex items-center justify-between gap-1 whitespace-nowrap">
                <span className="font-mono-jetbrains text-[9.5px] text-slate-800 truncate">{d.alerta.referencia}</span>
                <span className="text-[9px] text-amber-700 font-medium">nueva</span>
              </div>
              <div className="text-[9.5px] text-slate-600 truncate">
                {actual.cliente} · {causaManual(caso.escenario, d.hsm.slaMin)}
              </div>
            </div>
          )}
          {manualOtros.map((f) => (
            <div
              key={f.referencia}
              className="px-1.5 py-[3px] border-b border-slate-100 border-l-2 border-l-transparent"
            >
              <div className="flex items-center justify-between gap-1 whitespace-nowrap">
                <span className="font-mono-jetbrains text-[9.5px] text-slate-700 truncate">{f.referencia}</span>
                <span className="text-[9px] text-slate-400">{f.espera}</span>
              </div>
              <div className="text-[9.5px] text-slate-500 truncate">
                {f.cliente} · {f.causa}
              </div>
            </div>
          ))}
        </Tarjeta>
      </div>
    </div>
  );
}
