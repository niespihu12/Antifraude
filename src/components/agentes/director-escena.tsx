"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clapperboard, Play } from "lucide-react";
import { ESCENAS, FRANQUICIA_LABEL, PROBABILIDAD_ESCENARIO } from "@/data/agentes-data";
import { agentesEngine } from "@/lib/agentes-engine";

const GUION_DEMO = 5;

/**
 * Director de escena: el presentador decide qué alerta entra ahora (franquicia y
 * escenario) en vez de esperar a que el azar lo produzca. Solo sobreescribe ese
 * caso: el sorteo de los siguientes no cambia.
 */
export default function DirectorEscena({ compacto = false }: { compacto?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  // El panel vive en un portal (la cola tiene overflow-hidden): se mide el botón solo al abrir, nunca por tick.
  const botonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, maxH: 400 });
  const alternar = () => {
    const r = botonRef.current?.getBoundingClientRect();
    if (r) {
      // Debajo del botón si cabe una lista útil; si no, pegado al borde superior y con todo el alto.
      const espacio = window.innerHeight - r.bottom - 12;
      const debajo = espacio >= 420;
      setPos({
        top: debajo ? r.bottom + 4 : 8,
        left: Math.max(8, Math.min(r.left, window.innerWidth - 348)),
        maxH: debajo ? espacio : window.innerHeight - 16,
      });
    }
    setAbierto((v) => !v);
  };
  const guion = ESCENAS.slice(0, GUION_DEMO);
  const resto = ESCENAS.slice(GUION_DEMO);

  const reproducir = (id: string) => {
    const e = ESCENAS.find((x) => x.id === id);
    if (e) agentesEngine.forzarAlerta({ franquicia: e.franquicia, escenario: e.escenario }, e.etiqueta);
    setAbierto(false);
  };

  return (
    <div className="relative">
      <button
        ref={botonRef}
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md border text-[11px] font-medium bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 transition-colors"
        title="Elegir qué alerta entra ahora (franquicia y escenario)"
      >
        <Clapperboard className="w-3.5 h-3.5" />
        {!compacto && "Escena…"}
      </button>
      {abierto &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Cerrar el director de escena"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setAbierto(false)}
            />
            <div
              className="fixed z-50 w-[340px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
              style={{ top: pos.top, left: pos.left, maxHeight: pos.maxH }}
            >
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400">Guion de la demo</div>
              {guion.map((e, i) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => reproducir(e.id)}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-50"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-slate-800">{e.etiqueta}</span>
                      {e.reglas.map((r) => (
                        <span
                          key={r}
                          className="rounded border border-amber-200 bg-amber-50 px-1 font-mono text-[9px] font-semibold text-amber-700"
                        >
                          {r}
                        </span>
                      ))}
                    </span>
                    <span className="block text-[10px] leading-snug text-slate-500">{e.sinopsis}</span>
                  </span>
                  <Play className="mt-1 h-3 w-3 shrink-0 fill-current text-violet-600" />
                </button>
              ))}
              <div className="my-1 border-t border-slate-100" />
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400">Otras escenas</div>
              {resto.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => reproducir(e.id)}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-slate-800">{e.etiqueta}</span>
                      <span className="rounded border border-slate-200 bg-slate-50 px-1 text-[9px] text-slate-600">
                        {FRANQUICIA_LABEL[e.franquicia]}
                      </span>
                    </span>
                    <span className="block text-[10px] leading-snug text-slate-500">{e.sinopsis}</span>
                  </span>
                  <Play className="mt-1 h-3 w-3 shrink-0 fill-current text-violet-600" />
                </button>
              ))}
              <div className="my-1 border-t border-slate-100" />
              <div className="px-2 py-1 font-mono text-[9.5px] leading-snug text-slate-400">
                Sin director, cada escenario aparece según su probabilidad natural:{" "}
                {(Object.entries(PROBABILIDAD_ESCENARIO) as [keyof typeof PROBABILIDAD_ESCENARIO, number][])
                  .map(([k, p]) => `${k.replace("_", " ")} ${Math.round(p * 100)} %`)
                  .join(" · ")}
                .
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
