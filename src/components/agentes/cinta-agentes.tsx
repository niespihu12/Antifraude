"use client";

import { motion } from "framer-motion";
import type { Snapshot } from "@/types/agentes";
import { AGENTES, SISTEMAS } from "@/data/agentes-data";
import { agentesEngine } from "@/lib/agentes-engine";
import { AvatarAgente, BarraProgreso } from "./ui";

interface Props {
  snap: Snapshot;
  /** Modo teatro: menos alto (sin rol ni línea de sistema). */
  compacta?: boolean;
}

/**
 * Mapa vivo del proceso: los cinco agentes en línea, cada uno con la alerta
 * que tiene en manos, lo que está haciendo ahora y cuántas esperan en su cola.
 * Cuando un agente entrega, el identificador de la alerta «viaja» al siguiente nodo.
 */
export default function CintaAgentes({ snap, compacta = false }: Props) {
  const n = AGENTES.length;
  const centro = (i: number) => `${((i + 0.5) / n) * 100}%`;

  return (
    <div
      className={`relative bg-white rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] px-3 ${compacta ? "py-2" : "py-3"}`}
    >
      {/* Línea base del flujo */}
      <div
        className={`absolute left-[10%] right-[10%] ${compacta ? "top-[25px]" : "top-[34px]"} h-[2px] bg-slate-100 rounded-full`}
      />

      {/* Puntos que recorren el flujo continuamente */}
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          className={`absolute left-[10%] right-[10%] ${compacta ? "top-[22px]" : "top-[31px]"} h-2 pointer-events-none overflow-hidden`}
        >
          <motion.div
            className="w-full h-2"
            animate={{ x: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: k * 3 }}
          >
            <span className="block w-2 h-2 rounded-full bg-blue-400/70" />
          </motion.div>
        </div>
      ))}

      {/* Entregas entre agentes */}
      {snap.handoffs.map((h) => {
        const de = AGENTES.findIndex((a) => a.id === h.de);
        const a = AGENTES.findIndex((x) => x.id === h.a);
        return (
          <motion.div
            key={h.id}
            className={`absolute ${compacta ? "top-[14px]" : "top-[22px]"} -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono-jetbrains text-[10px] shadow-md pointer-events-none z-20`}
            initial={{ left: centro(de), opacity: 0 }}
            animate={{ left: centro(a), opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          >
            {h.casoId}
          </motion.div>
        );
      })}

      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {AGENTES.map((a) => {
          const est = snap.agentes[a.id];
          const caso = est.activo ? snap.casos.find((c) => c.id === est.activo) : undefined;
          const activo = !!caso;
          const esFoco = !!caso && caso.id === snap.focoId;
          const paso = caso ? caso.plan[caso.etapaIdx]?.pasos[caso.pasoIdx] : undefined;
          const progreso = caso && paso ? Math.max(0, Math.min(1, 1 - caso.restante / paso.duracion)) : 0;
          const enCola = est.cola.length;

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => caso && agentesEngine.setFoco(caso.id)}
              className={`group flex flex-col items-center text-center px-1 rounded-lg transition-colors ${caso ? "cursor-pointer hover:bg-slate-50" : "cursor-default"}`}
              title={a.descripcion}
            >
              <div className="relative">
                <AvatarAgente id={a.id} size={compacta ? 34 : 44} activo={activo} />
                {enCola > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow ring-2 ring-white">
                    {enCola}
                  </span>
                )}
                {esFoco && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0033A0] ring-2 ring-white" />
                )}
              </div>
              <div
                className={`${compacta ? "mt-1 text-[11px]" : "mt-1.5 text-[12px]"} font-semibold text-slate-800 leading-tight`}
              >
                {a.nombre.replace("Agente ", "")}
              </div>
              {!compacta && (
                <div className="text-[10px] text-slate-400 leading-tight [@media(max-height:860px)]:hidden">
                  {a.rol}
                </div>
              )}
              <div
                className={`mt-1 flex items-center gap-1 ${compacta ? "hidden" : ""} [@media(max-height:860px)]:hidden`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SISTEMAS[a.sistema].color }} />
                <span className="text-[10px] text-slate-500">{SISTEMAS[a.sistema].nombre}</span>
                <span className="text-[10px] text-slate-300">·</span>
                <span className="text-[10px] font-mono-jetbrains text-slate-500">{est.procesadas} hechas</span>
              </div>

              <div className={`${compacta ? "mt-1 min-h-[30px]" : "mt-1.5 min-h-[38px]"} w-full`}>
                {caso && paso ? (
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono-jetbrains text-[10px] font-semibold" style={{ color: a.color }}>
                        {caso.id}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate px-1" title={paso.texto}>
                      {paso.texto}
                    </div>
                    <div className="px-2 mt-1">
                      <BarraProgreso valor={progreso} color={a.color} alto={3} />
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-300 italic mt-1">en espera</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
