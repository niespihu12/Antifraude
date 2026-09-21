"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Inbox, Radar } from "lucide-react";
import { Franquicia } from "@/types";
import type { Caso, Snapshot } from "@/types/agentes";
import { AGENTES_MAP, FRANQUICIA_LABEL } from "@/data/agentes-data";
import { formatPeso, iniciales } from "@/data/agentes-util";
import { agentesEngine } from "@/lib/agentes-engine";
import DirectorEscena from "./director-escena";
import { COLOR_RESULTADO, NOMBRE_CORTO, TEXTO_RESULTADO, horaMinuto } from "./helpers";

interface Props {
  snap: Snapshot;
}

/** Color por franquicia: el mismo criterio del borde de las tarjetas del pipeline (Visa azul, Mastercard rojo, Monitor gris). */
const COLOR_FRANQUICIA: Record<Franquicia, string> = {
  [Franquicia.VISA]: "#1d4ed8",
  [Franquicia.MASTERCARD]: "#dc2626",
  [Franquicia.MONITOR]: "#475569",
};

function estadoCaso(caso: Caso): { texto: string; color: string; pulso: boolean } {
  if (caso.estado === "terminada" && caso.resultado) {
    return { texto: TEXTO_RESULTADO[caso.resultado], color: COLOR_RESULTADO[caso.resultado], pulso: false };
  }
  const agente = caso.plan[caso.etapaIdx]?.agente;
  if (!agente) return { texto: "Cerrando", color: "#475569", pulso: false };
  const def = AGENTES_MAP[agente];
  if (caso.estado === "esperando") return { texto: "Espera humana", color: "#d97706", pulso: true };
  if (caso.estado === "en_cola") return { texto: `Cola · ${NOMBRE_CORTO[agente]}`, color: def.color, pulso: false };
  return { texto: NOMBRE_CORTO[agente], color: def.color, pulso: true };
}

export default function Bandeja({ snap }: Props) {
  const casos = [...snap.casos].sort((a, b) => b.recibidoEn - a.recibidoEn).slice(0, 30);
  const activos = snap.casos.filter((c) => c.estado !== "terminada").length;
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listaRef.current?.querySelector<HTMLElement>('[data-foco="1"]');
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [snap.focoId]);

  return (
    <div className="bg-white rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] flex flex-col min-h-0 overflow-hidden">
      {/* Cabecera de la cola */}
      <div className="px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#0033A0] text-white flex items-center justify-center shrink-0">
            <Inbox className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-slate-800 leading-tight">Cola de alertas</div>
            <div className="text-[10px] font-mono-jetbrains text-slate-400 truncate">Monitor · BRM · EMS/MS</div>
          </div>
          <div className="text-right">
            <div className="font-mono-jetbrains text-[14px] font-bold text-[#0033A0] leading-none">{activos}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">en curso</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <button
            type="button"
            onClick={() => agentesEngine.forzarAlerta()}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-50 text-[#0033A0] border border-blue-100 text-[11px] font-medium hover:bg-blue-100 transition-colors"
          >
            <Radar className="w-3.5 h-3.5" />
            Alerta entrante
          </button>
          <DirectorEscena compacto />
          <button
            type="button"
            onClick={() => agentesEngine.setAutoSeguir(!snap.autoSeguir)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md border text-[11px] font-medium transition-colors ${
              snap.autoSeguir
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
            }`}
            title={
              snap.autoSeguir
                ? "Siguiendo automáticamente cada alerta nueva"
                : "Seguimiento manual: haz clic en una alerta"
            }
          >
            {snap.autoSeguir ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Auto
          </button>
        </div>
        <div className="mt-1.5 text-[9.5px] text-slate-400 leading-tight">
          Atajos: Espacio pausa · , ½x · 1/2/5/0 velocidad · N alerta · T teatro · → siguiente
        </div>
      </div>

      {/* Lista de alertas */}
      <div ref={listaRef} className="flex-1 overflow-y-auto min-h-0">
        {casos.map((caso) => {
          const sel = caso.id === snap.focoId;
          const est = estadoCaso(caso);
          const noLeida = !caso.pasosHechos["r1"];
          const a = caso.datos.alerta;
          return (
            <motion.button
              key={caso.id}
              type="button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => agentesEngine.setFoco(caso.id)}
              data-foco={sel ? "1" : undefined}
              className={`w-full text-left px-3 py-2 border-b border-slate-100 flex gap-2.5 transition-colors ${
                sel
                  ? "bg-blue-50/80 border-l-[3px] border-l-[#0033A0]"
                  : "border-l-[3px] border-l-transparent hover:bg-slate-50"
              }`}
            >
              <div className="relative shrink-0 mt-0.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ backgroundColor: COLOR_FRANQUICIA[caso.franquicia] }}
                >
                  {iniciales(caso.cliente)}
                </div>
                {noLeida && (
                  <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-[#E31837] ring-2 ring-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[12px] truncate ${noLeida ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}
                  >
                    {caso.cliente}
                  </span>
                  <span className="text-[10px] font-mono-jetbrains text-slate-400 shrink-0">
                    {horaMinuto(caso.recibidoEn)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate leading-tight">
                  {a.motivo} · {caso.datos.transaccion.comercio}
                </div>
                <div className="flex items-center gap-1.5 mt-1 min-w-0">
                  <span className="font-mono-jetbrains text-[10px] text-[#0033A0] whitespace-nowrap">{caso.id}</span>
                  <span className="text-[10px] text-slate-400 font-mono-jetbrains truncate">
                    {formatPeso(caso.monto)}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400 shrink-0">
                    {a.origen} · {FRANQUICIA_LABEL[caso.franquicia]}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full text-[10px] font-medium border"
                    style={{ color: est.color, borderColor: `${est.color}40`, backgroundColor: `${est.color}0f` }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${est.pulso ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: est.color }}
                    />
                    {est.texto}
                  </span>
                  {a.altoRiesgo && (
                    <span className="inline-flex items-center px-1.5 py-[1px] rounded-full text-[10px] font-medium border border-red-200 bg-red-50 text-[#E31837]">
                      Alto riesgo
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
        {casos.length === 0 && <div className="p-6 text-center text-[12px] text-slate-400">Esperando alertas…</div>}
      </div>
    </div>
  );
}
