"use client";

import {
  Clock,
  Pause,
  Play,
  Presentation,
  Shield,
  Square,
} from "lucide-react";

import {
  useSimulation,
  type SimulationSpeed,
} from "@/context/simulation-context";
import { formatBogotaTime, formatNumber } from "@/lib/utils";

const speedOptions: SimulationSpeed[] = [1, 2, 5, 10];

export function Header({
  onPresentationMode,
}: {
  onPresentationMode?: () => void;
}) {
  const {
    isRunning,
    lastTickAtMs,
    pauseSimulation,
    setSpeed,
    speed,
    startSimulation,
    stopSimulation,
    tick,
  } = useSimulation();

  return (
    <header className="fixed top-0 z-50 h-14 w-full border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-4">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-blue-100 text-[#0033A0]">
            <Shield className="size-5" />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-lg font-bold tracking-tight text-[#0033A0]">
              Centro de Operaciones Antifraude
            </p>
            <p className="text-xs text-slate-500">Automatización inteligente de alertas</p>
          </div>
        </div>

        <div className="hidden items-center justify-center xl:flex">
          <div className="badge-compact inline-flex items-center gap-2 rounded border border-emerald-200 bg-emerald-100 uppercase text-emerald-700">
            <span className="size-2 animate-pulse-soft rounded-full bg-emerald-600" />
            Operación <span className="font-mono-jetbrains">24/7</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto">
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 p-1">
            {speedOptions.map((option) => {
              const active = speed === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSpeed(option)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-all ${
                    active
                      ? "bg-[#0033A0] text-white"
                      : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {option}x
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={isRunning ? pauseSimulation : startSimulation}
            className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all ${
              isRunning
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
            aria-label={isRunning ? "Pausar simulación" : "Iniciar simulación"}
          >
            {isRunning ? (
              <Pause className="size-3.5 fill-current" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={stopSimulation}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#E31837] transition-all hover:bg-red-200"
            aria-label="Detener simulación"
          >
            <Square className="size-3.5 fill-current" />
          </button>

          <button
            type="button"
            onClick={onPresentationMode}
            className="hidden shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 transition-all hover:bg-slate-200 lg:flex"
          >
            <Presentation className="size-3.5" />
            Modo Presentación
          </button>

          <div className="hidden shrink-0 items-center gap-2 border-l border-slate-200 pl-3 text-right md:flex">
            <Clock className="size-3.5 text-slate-500" />
            <div>
              <div
                className="font-mono-jetbrains text-sm text-slate-700"
                suppressHydrationWarning
              >
                {formatBogotaTime(lastTickAtMs, { hour12: false })}
              </div>
              <div className="font-mono-jetbrains text-[10px] text-slate-500">
                Tick #{formatNumber(tick)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
