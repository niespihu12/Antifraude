"use client";

import { useMemo } from "react";
import { ArrowRight, Check } from "lucide-react";
import { EstadoAlerta } from "@/types";
import type { Caso, PasoPlan } from "@/types/agentes";
import { estadoAncla } from "@/components/agentes/guion";
import { CampoTecleado } from "@/components/agentes/ui";
import { formatPeso } from "@/data/agentes-util";
import { RUTAS, T, avancePaso, camposNormalizados, escalaPatron, rutaDe, tramo } from "@/data/guiones/monitor-datos";
import { ChipRegla, Insignia, InsigniaEstado, Tarjeta } from "./monitor-piezas";

const CLASE_ORIGEN: Record<string, string> = {
  VRM: "bg-blue-100 text-blue-700",
  "EMS/MS": "bg-red-100 text-[#E31837]",
  Monitor: "bg-slate-100 text-slate-700",
};

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

/**
 * monitor.detalle · ficha de la alerta. r2 normaliza los campos uno a uno, r3 muestra el enrutamiento
 * por canal (R07/R08 o alerta interna) y r4 compara el monto contra el patrón histórico del cliente (R06).
 * Cada panel se pinta según el avance de su paso (1 si ya se hizo) y no depende del paso en curso.
 */
export default function PanelDetalle({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d = caso.datos;
  const campos = useMemo(() => camposNormalizados(d), [d]);
  const esc = useMemo(() => escalaPatron(d), [d]);

  const pR2 = avancePaso(caso, paso, p, "r2");
  const pR3 = avancePaso(caso, paso, p, "r3");
  const pR4 = avancePaso(caso, paso, p, "r4");
  // r2 en curso: cada campo aparece con su propio tecleo/pegado; si ya terminó (o se revisa), todos visibles.
  const enR2 = paso?.id === "r2" && !caso.pasosHechos["r2"];

  let normalizados = 0;
  const filasCampo = campos.map((c) => {
    const e = estadoAncla(paso, p, c.ancla);
    const visible = enR2 ? e.tecleo !== undefined || e.pegado : pR2 >= 1;
    const terminado = enR2 ? e.pegado || (e.tecleo !== undefined && e.tecleo >= 1) : pR2 >= 1;
    if (terminado) normalizados++;
    return { c, e, visible };
  });

  /* r3 · ruta */
  const ruta = rutaDe(d);
  const resuelto = pR3 >= T.r3.resuelto;
  const rutaActiva = RUTAS.find((r) => r.clave === ruta) ?? RUTAS[2];

  /* r4 · patrón */
  const fp = tramo(pR4, T.r4.promedio);
  const fm = tramo(pR4, T.r4.monto);
  const veredicto = pR4 >= T.r4.veredicto;
  const prioridad = pR4 >= T.r4.prioridad;
  const veces = esc.veces.toLocaleString("es-CO", { maximumFractionDigits: 1 });
  const tx = d.transaccion;

  return (
    <div className="absolute inset-0 flex flex-col gap-1 p-1 overflow-hidden text-[10.5px]">
      {/* Cabecera de la ficha */}
      <div className="h-[20px] shrink-0 flex items-center gap-2 px-1 whitespace-nowrap overflow-hidden">
        <span className="text-[11px] font-semibold text-slate-800">
          Alerta <span className="font-mono-jetbrains">{d.alerta.referencia}</span>
        </span>
        <Insignia ancla="mon.chip.origen" texto={`Origen ${d.alerta.origen}`} clase={CLASE_ORIGEN[d.alerta.origen]} />
        <span className="min-w-0 truncate text-[10px] text-slate-500">
          {d.tarjeta.producto} <span className="font-mono-jetbrains">····{d.tarjeta.ultimos4}</span> ·{" "}
          {d.cliente.nombre}
        </span>
        <span className="ml-auto shrink-0">
          <InsigniaEstado estado={EstadoAlerta.PENDIENTE_REVISION} />
        </span>
      </div>

      {/* r2 · campos normalizados */}
      <Tarjeta
        className="shrink-0"
        titulo="Normalización de campos"
        derecha={`${normalizados}/${campos.length} normalizados`}
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-[2px] px-2 py-1">
          {filasCampo.map(({ c, e, visible }) => (
            <div key={c.ancla} className="flex items-center gap-1.5 min-w-0">
              <span className="w-[66px] shrink-0 truncate text-[10px] text-slate-500">{c.etiqueta}</span>
              <CampoTecleado
                className="flex-1"
                ancla={c.ancla}
                valor={c.valor}
                visible={visible}
                tecleo={enR2 ? e.tecleo : undefined}
                pegado={enR2 ? e.pegado : false}
                foco={e.foco}
                resaltado={e.resaltado}
                mono={c.mono}
              />
            </div>
          ))}
        </div>
      </Tarjeta>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-1">
        {/* r3 · enrutamiento por canal */}
        <Tarjeta titulo="Enrutamiento por canal">
          {RUTAS.map((r) => {
            const activa = resuelto && r.clave === ruta;
            const tenue = resuelto && r.clave !== ruta;
            const e = estadoAncla(paso, p, r.ancla);
            return (
              <div
                key={r.clave}
                data-ancla={r.ancla}
                className={`h-[17px] flex items-center gap-1.5 px-2 border-b border-slate-100 whitespace-nowrap text-[10px] ${activa ? "bg-emerald-50" : e.clic || e.foco ? "bg-blue-50" : ""} ${tenue ? "opacity-40" : ""}`}
              >
                <span
                  className={`w-3 h-3 shrink-0 rounded-full flex items-center justify-center ${activa ? "bg-emerald-600 text-white" : "border border-slate-300"}`}
                >
                  {activa && <Check className="w-2 h-2" strokeWidth={3} />}
                </span>
                <span className={`w-[58px] shrink-0 ${activa ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                  {r.red}
                </span>
                <span className="w-[68px] shrink-0 truncate text-slate-500">origen {r.origen}</span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-slate-700">{r.canal}</span>
                {r.regla && <ChipRegla codigo={r.regla} />}
              </div>
            );
          })}
          <div className="h-[15px] px-2 flex items-center text-[9.5px] whitespace-nowrap">
            {resuelto ? (
              <span className="truncate text-emerald-700 font-medium">
                {ruta === "interna"
                  ? "Alerta interna · sin canal de red"
                  : `Enrutada por ${rutaActiva.canal} · origen ${rutaActiva.origen}`}
              </span>
            ) : (
              <span className="text-slate-400 italic">Pendiente de enrutamiento</span>
            )}
          </div>
        </Tarjeta>

        {/* r4 · monto contra el patrón histórico */}
        <Tarjeta
          titulo="Patrón histórico del cliente"
          derecha={
            <>
              <span className="text-amber-600">┆</span> umbral 4× promedio
            </>
          }
        >
          <div className="px-2 py-1 flex flex-col gap-[3px]">
            <div className="h-[16px] flex items-center gap-1.5 whitespace-nowrap text-[9.5px]">
              <span className="w-[74px] shrink-0 text-slate-500">Promedio</span>
              <span data-ancla="mon.barra.promedio" className="relative flex-1 h-[8px] rounded-full bg-slate-100">
                <span className="absolute inset-0 rounded-full overflow-hidden">
                  <span className="block h-full rounded-full bg-blue-500" style={{ width: pct(esc.promedio * fp) }} />
                </span>
              </span>
              <span className="w-[74px] shrink-0 text-right font-mono-jetbrains tabular-nums text-slate-700">
                {fp > 0 ? formatPeso(tx.promedioHistorico) : ""}
              </span>
            </div>
            <div className="h-[16px] flex items-center gap-1.5 whitespace-nowrap text-[9.5px]">
              <span className="w-[74px] shrink-0 text-slate-500">Esta transacción</span>
              <span data-ancla="mon.barra.monto" className="relative flex-1 h-[8px] rounded-full bg-slate-100">
                <span className="absolute inset-0 rounded-full overflow-hidden">
                  <span
                    className={`block h-full rounded-full ${veredicto && tx.atipico ? "bg-[#E31837]" : "bg-slate-600"}`}
                    style={{ width: pct(esc.monto * fm) }}
                  />
                </span>
                <span
                  className="absolute -top-[3px] -bottom-[3px] w-0 border-l border-dashed border-amber-600"
                  style={{ left: pct(esc.umbral) }}
                />
              </span>
              <span className="w-[74px] shrink-0 text-right font-mono-jetbrains tabular-nums text-slate-800">
                {fm > 0 ? formatPeso(tx.monto) : ""}
              </span>
            </div>
            <div className="h-[16px] flex items-center gap-1 whitespace-nowrap">
              {veredicto && (
                <>
                  {tx.atipico ? (
                    <Insignia ancla="mon.chip.patron" texto={`Atípico · ×${veces}`} clase="bg-red-100 text-[#E31837]" />
                  ) : (
                    <Insignia
                      ancla="mon.chip.patron"
                      texto="Dentro del patrón"
                      clase="bg-emerald-100 text-emerald-700"
                    />
                  )}
                  {tx.atipico && <ChipRegla codigo="R06" />}
                </>
              )}
              {prioridad && (
                <>
                  {d.alerta.altoRiesgo && <Insignia texto="ALTO RIESGO" clase="bg-red-100 text-[#E31837] font-bold" />}
                  <Insignia
                    texto={`Prioridad ${d.alerta.prioridad}`}
                    clase={d.alerta.prioridad === "Alta" ? "bg-red-100 text-[#E31837]" : "bg-slate-100 text-slate-700"}
                  />
                </>
              )}
              {!veredicto && <span className="text-[9.5px] text-slate-400 italic">Pendiente de comparación</span>}
            </div>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
