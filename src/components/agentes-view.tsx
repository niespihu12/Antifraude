"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Keyboard, Play, Projector } from "lucide-react";

import { useSimulation, type SimulationSpeed } from "@/context/simulation-context";
import { AGENTES } from "@/data/agentes-data";
import { useAgentes } from "@/hooks/use-agentes";
import { agentesEngine } from "@/lib/agentes-engine";
import Bandeja from "@/components/agentes/bandeja";
import Bitacora from "@/components/agentes/bitacora";
import CintaAgentes from "@/components/agentes/cinta-agentes";
import Estacion from "@/components/agentes/estacion";
import Expediente from "@/components/agentes/expediente";
import { formatDuracion } from "@/components/agentes/helpers";

/** Pantallas de ≤ 860 px de alto (portátil): lo secundario se oculta para dejar el alto al escritorio. */
const SOLO_ALTO = "[@media(max-height:860px)]:hidden";

function Kpi({
  etiqueta,
  valor,
  color = "#0f172a",
  secundario = false,
}: {
  etiqueta: string;
  valor: string | number;
  color?: string;
  secundario?: boolean;
}) {
  return (
    <div className={`flex flex-col items-end leading-none ${secundario ? SOLO_ALTO : ""}`}>
      <span className="font-mono-jetbrains text-[16px] font-bold" style={{ color }}>
        {valor}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">{etiqueta}</span>
    </div>
  );
}

type Panel = "ambos" | "bitacora" | "expediente" | "teatro";
const CLAVE_PANEL = "agentes.panel";

function leerPanel(): Panel {
  try {
    const v = localStorage.getItem(CLAVE_PANEL);
    return v === "bitacora" || v === "expediente" || v === "teatro" ? v : "ambos";
  } catch {
    return "ambos";
  }
}

const VELOCIDADES: Record<string, SimulationSpeed> = { "1": 1, "2": 2, "5": 5, "0": 10 };

export function AgentesView() {
  const { isRunning, tick, startSimulation, pauseSimulation, setSpeed } = useSimulation();
  const snap = useAgentes();
  const [panel, setPanelState] = useState<Panel>(leerPanel);
  const setPanel = (p: Panel) => {
    setPanelState(p);
    try {
      localStorage.setItem(CLAVE_PANEL, p);
    } catch {
      /* sin almacenamiento */
    }
  };
  const teatro = panel === "teatro";
  const alternarTeatro = () => setPanel(teatro ? "ambos" : "teatro");

  // En teatro se ocultan las pestañas, la barra de estados y el pie, y se aprovecha todo el alto (ver globals.css).
  useEffect(() => {
    document.documentElement.toggleAttribute("data-teatro", teatro);
    return () => document.documentElement.removeAttribute("data-teatro");
  }, [teatro]);

  // Atajos del presentador. El header no maneja el teclado, así que Espacio también se atiende aquí.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key) {
        case " ":
          if (tag === "BUTTON") return;
          if (isRunning) pauseSimulation();
          else startSimulation();
          break;
        case ".":
        case ",":
          agentesEngine.setVelocidad(0.5);
          break;
        case "1":
        case "2":
        case "5":
        case "0":
          setSpeed(VELOCIDADES[e.key]);
          agentesEngine.setVelocidad(VELOCIDADES[e.key]);
          break;
        case "t":
        case "T":
          alternarTeatro();
          break;
        case "f":
        case "F":
          if (document.fullscreenElement) void document.exitFullscreen?.();
          else void document.documentElement.requestFullscreen?.();
          break;
        case "Escape":
          if (teatro) setPanel("ambos");
          break;
        case "n":
        case "N":
          agentesEngine.forzarAlerta();
          break;
        case "ArrowRight": {
          const s = agentesEngine.getSnapshot();
          const activos = s.casos.filter((c) => c.estado !== "terminada");
          if (activos.length === 0) break;
          const i = activos.findIndex((c) => c.id === s.focoId);
          agentesEngine.setFoco(activos[(i + 1) % activos.length].id);
          break;
        }
        default:
          return;
      }
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teatro, isRunning]);

  // La pantalla debe verse viva desde que se abre (solo al entrar: «Detener» sigue deteniendo).
  const yaArranco = useRef(false);
  useEffect(() => {
    if (yaArranco.current) return;
    yaArranco.current = true;
    if (!isRunning && tick === 0) startSimulation();
  }, [isRunning, tick, startSimulation]);

  const agentesActivos = AGENTES.filter((a) => snap.agentes[a.id].activo).length;
  const enCola = AGENTES.reduce((s, a) => s + snap.agentes[a.id].cola.length, 0);
  const esperandoHumano = snap.casos.filter((c) => c.estado === "esperando").length;
  const { stats } = snap;

  return (
    <div
      className={`${teatro ? "h-[calc(100dvh-4.5rem)] gap-2 px-4 pb-2" : "h-[max(calc(100dvh-12.25rem),52rem)] gap-3 px-2"} flex flex-col min-h-0`}
    >
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 shrink-0"
      >
        <div className="min-w-0">
          <h1
            className={`${teatro ? "text-[15px]" : "text-[20px] min-[1500px]:text-[24px]"} whitespace-nowrap font-semibold text-slate-900 leading-tight tracking-tight flex items-center gap-2`}
          >
            <Bot className={`${teatro ? "w-4 h-4" : "w-6 h-6"} text-[#0033A0]`} />
            Proceso antifraude en vivo
          </h1>
          {!teatro && (
            <p className={`text-[12px] text-slate-400 mt-0.5 hidden 2xl:block ${SOLO_ALTO}`}>
              De la alerta de Monitor, VRM o EMS/MS al expediente tipificado: {AGENTES.length} agentes, 7 sistemas, cada
              acción documentada.
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3 min-[1500px]:gap-4 flex-wrap justify-end">
          <Kpi etiqueta="agentes activos" valor={`${agentesActivos}/${AGENTES.length}`} color="#0033A0" />
          {!teatro && <Kpi etiqueta="en cola" valor={enCola} color={enCola > 4 ? "#d97706" : "#0f172a"} />}
          <Kpi etiqueta="esperan humano" valor={esperandoHumano} color={esperandoHumano ? "#d97706" : "#0f172a"} />
          {!teatro && <div className="w-px h-8 bg-slate-200" />}
          {!teatro && <Kpi etiqueta="alertas recibidas" valor={stats.recibidas} secundario />}
          <Kpi etiqueta="expedientes cerrados" valor={stats.terminadas} color="#059669" />
          {!teatro && <Kpi etiqueta="falsos positivos" valor={stats.legitimas} color="#059669" />}
          {!teatro && <Kpi etiqueta="fraudes bloqueados" valor={stats.fraudes} color="#E31837" />}
          {!teatro && (
            <Kpi
              etiqueta="escaladas a analista"
              valor={stats.escaladas}
              color={stats.escaladas ? "#d97706" : "#0f172a"}
              secundario
            />
          )}
          {!teatro && (
            <Kpi
              etiqueta="ciclo promedio"
              valor={stats.cicloPromedioMs ? formatDuracion(stats.cicloPromedioMs) : "—"}
              secundario
            />
          )}
          <Kpi etiqueta="acciones documentadas" valor={stats.accionesTotales} />
          <button
            type="button"
            onClick={alternarTeatro}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors ${teatro ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-700" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
            title="Modo teatro (T): oculta la cola y la columna derecha para el proyector"
          >
            <Projector className="w-3.5 h-3.5" /> {teatro ? "Salir del teatro" : "Modo teatro"}
          </button>
          {teatro && (
            <span
              className="hidden min-[1700px]:flex items-center gap-1 text-[10px] text-slate-400"
              title="Atajos del presentador"
            >
              <Keyboard className="w-3 h-3" /> Espacio pausa · , ½x · 1/2/5/0 velocidad · N alerta · → siguiente · F
              pantalla completa · Esc salir
            </span>
          )}
          {!isRunning && (
            <button
              type="button"
              onClick={startSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Reanudar
            </button>
          )}
        </div>
      </motion.div>

      {/* Mapa de agentes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="shrink-0"
      >
        <CintaAgentes snap={snap} compacta={teatro} />
      </motion.div>

      {/* Cola · Estación · Bitácora/Expediente */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 min-h-0 grid gap-3"
        style={{ gridTemplateColumns: teatro ? "minmax(0, 1fr)" : "260px minmax(0, 1fr) 360px" }}
      >
        {!teatro && <Bandeja snap={snap} />}
        <Estacion snap={snap} teatro={teatro} />
        {!teatro && (
          <div className="flex flex-col gap-3 min-h-0">
            {panel !== "expediente" && (
              <div className={`${panel === "bitacora" ? "flex-1" : "h-[46%]"} min-h-0 flex flex-col`}>
                <Bitacora
                  snap={snap}
                  maximizada={panel === "bitacora"}
                  onToggle={() => setPanel(panel === "bitacora" ? "ambos" : "bitacora")}
                />
              </div>
            )}
            {panel !== "bitacora" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <Expediente
                  snap={snap}
                  maximizada={panel === "expediente"}
                  onToggle={() => setPanel(panel === "expediente" ? "ambos" : "expediente")}
                />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
