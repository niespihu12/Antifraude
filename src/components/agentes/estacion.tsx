"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clapperboard,
  Clock,
  CircleCheck,
  CreditCard,
  ExternalLink,
  History,
  LayoutGrid,
  Monitor,
  Undo2,
} from "lucide-react";
import type { AgenteId, Caso, Snapshot } from "@/types/agentes";
import { AGENTES_MAP, ESCENARIO_LABEL, FRANQUICIA_LABEL } from "@/data/agentes-data";
import { formatPeso } from "@/data/agentes-util";
import { AvatarAgente, BarraProgreso, ChipRegla, ChipSistema, IconoEstadoPaso, Spinner } from "./ui";
import { COLOR_RESULTADO, NOMBRE_CORTO, TEXTO_RESULTADO, estadoDePaso, formatDuracion, horaCorta } from "./helpers";
import SuperficieGenerica from "./superficie-generica";
import EscritorioRPA from "./rpa/escritorio-rpa";
import PensamientoAgente from "./rpa/pensamiento-agente";
import { accionesActivas } from "./guion";

interface Props {
  snap: Snapshot;
  teatro?: boolean;
}

type ModoVista = "escritorio" | "tarjetas";
const CLAVE_VISTA = "agentes.vista";

function leerModoVista(): ModoVista {
  try {
    return localStorage.getItem(CLAVE_VISTA) === "tarjetas" ? "tarjetas" : "escritorio";
  } catch {
    return "escritorio";
  }
}

function Stepper({
  caso,
  seleccion,
  onSeleccionar,
}: {
  caso: Caso;
  seleccion: number | null;
  onSeleccionar: (i: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {caso.plan.map((et, i) => {
        const def = AGENTES_MAP[et.agente];
        const hecho = i < caso.etapaIdx || caso.estado === "terminada";
        const actual = i === caso.etapaIdx && caso.estado !== "terminada";
        const viendo = seleccion === i;
        const fallo = hecho && et.pasos.some((p) => caso.pasosHechos[p.id] && !caso.pasosHechos[p.id].ok);
        return (
          <div key={et.agente} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => hecho && onSeleccionar(viendo || actual ? null : i)}
              disabled={!hecho}
              title={hecho ? "Ver lo que hizo este agente" : undefined}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium transition-all ${actual ? "shadow-sm" : ""} ${hecho ? "cursor-pointer hover:shadow-sm" : "cursor-default"}`}
              style={{
                borderColor: hecho || actual ? `${def.color}55` : "#e2e8f0",
                backgroundColor: actual || viendo ? `${def.color}14` : hecho ? "#fff" : "#f8fafc",
                color: hecho || actual ? def.color : "#94a3b8",
                boxShadow: viendo ? `0 0 0 2px #fff, 0 0 0 4px ${def.color}66` : undefined,
              }}
            >
              {hecho ? (
                fallo ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                ) : (
                  <CircleCheck className="w-3 h-3" />
                )
              ) : actual ? (
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: def.color }} />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300" />
              )}
              {NOMBRE_CORTO[et.agente]}
            </button>
            {i < caso.plan.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
          </div>
        );
      })}
    </div>
  );
}

function ListaPasos({ caso, etapaIdx }: { caso: Caso; etapaIdx: number }) {
  const etapa = caso.plan[etapaIdx];
  if (!etapa) return null;
  const color = AGENTES_MAP[etapa.agente].color;
  return (
    <div className="space-y-0.5">
      {etapa.pasos.map((p, i) => {
        const est = estadoDePaso(caso, etapaIdx, i);
        const hecho = caso.pasosHechos[p.id];
        const activo = est === "en_curso" || est === "esperando";
        const progreso = activo ? Math.max(0, Math.min(1, 1 - caso.restante / p.duracion)) : hecho ? 1 : 0;
        return (
          <div
            key={p.id}
            className={`rounded-md px-2 py-1.5 border ${activo ? "bg-white border-slate-200 shadow-sm" : "border-transparent"}`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-[1px] shrink-0">
                <IconoEstadoPaso estado={est} color={color} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-1.5">
                  <span
                    className={`text-[11px] leading-tight ${est === "pendiente" ? "text-slate-400" : est === "fallo" ? "text-red-700 font-medium" : "text-slate-800 font-medium"}`}
                  >
                    {p.texto}
                  </span>
                  {p.regla && est !== "pendiente" && <ChipRegla codigo={p.regla} />}
                </div>
                {hecho?.resultado && (
                  <div
                    className={`text-[10px] leading-tight mt-0.5 line-clamp-2 ${hecho.ok ? "text-slate-500" : "text-red-600"}`}
                  >
                    {hecho.resultado}
                  </div>
                )}
                {est === "esperando" && (
                  <div className="text-[10px] leading-tight mt-0.5 text-amber-700">
                    Esperando a {p.humano?.nombre} · {formatDuracion(caso.restante)}
                  </div>
                )}
                {activo && est !== "esperando" && (
                  <div className="mt-1">
                    <BarraProgreso valor={progreso} color={color} alto={3} />
                  </div>
                )}
                {(hecho || (p.sistema && est !== "pendiente")) && (
                  <div className="mt-1 flex items-center gap-1.5">
                    {p.sistema && est !== "pendiente" && <ChipSistema id={p.sistema} />}
                    {hecho && (
                      <span className="text-[9px] font-mono-jetbrains text-slate-400">{horaCorta(hecho.t)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Estacion({ snap, teatro = false }: Props) {
  const caso = snap.casos.find((c) => c.id === snap.focoId);
  const ahora = snap.ahora;
  const [modoVista, setModoVista] = useState<ModoVista>(leerModoVista);
  const cambiarModoVista = (m: ModoVista) => {
    setModoVista(m);
    try {
      localStorage.setItem(CLAVE_VISTA, m);
    } catch {
      /* sin almacenamiento */
    }
  };
  // Etapa ya completada que el usuario quiere revisar (solo vale para el caso en foco).
  const [revision, setRevision] = useState<{ casoId: string; idx: number } | null>(null);
  const revisando =
    caso && revision && revision.casoId === caso.id && (revision.idx < caso.etapaIdx || caso.estado === "terminada")
      ? revision.idx
      : null;

  if (!caso) {
    return (
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] flex items-center justify-center text-[12px] text-slate-400">
        Esperando la primera alerta…
      </div>
    );
  }

  const etapaActualIdx = Math.min(caso.etapaIdx, caso.plan.length - 1);
  const etapaVistaIdx = revisando ?? etapaActualIdx;
  const etapa = caso.plan[etapaActualIdx];
  const etapaVista = caso.plan[etapaVistaIdx];
  const agenteId: AgenteId = etapaVista.agente;
  const agenteActualId: AgenteId = etapa.agente;
  const def = AGENTES_MAP[agenteActualId];
  const defVista = AGENTES_MAP[agenteId];
  const estAgente = snap.agentes[agenteActualId];
  const posicion = estAgente.cola.indexOf(caso.id) + 1;
  const ocupadoCon = estAgente.activo ? snap.casos.find((c) => c.id === estAgente.activo) : undefined;
  const pasoActual = etapa.pasos[caso.pasoIdx];
  const transcurrido = (caso.terminadoEn ?? ahora) - caso.recibidoEn;
  const terminada = caso.estado === "terminada";
  const surfaceKey = `${caso.id}-${agenteId}-${revisando ?? "actual"}`;

  // Progreso del paso para el escritorio: cuantizado a 0.02 salvo cuando se está tecleando.
  const escritorio = modoVista === "escritorio";
  const pasoEscritorio =
    revisando !== null || terminada
      ? ([...etapaVista.pasos].reverse().find((p) => p.vista || p.ui?.length) ??
        etapaVista.pasos[etapaVista.pasos.length - 1])
      : caso.estado === "en_cola"
        ? undefined
        : pasoActual;
  // Reloj y hora cuantizados al segundo: así el React.memo del escritorio y las ventanas sí evita renders.
  const relojSimSeg = Math.floor(snap.relojSim / 1000) * 1000;
  const ahoraSeg = Math.floor(ahora / 1000) * 1000;
  const progresoRaw =
    revisando !== null || terminada
      ? 1
      : pasoActual && caso.estado !== "en_cola"
        ? Math.max(0, Math.min(1, 1 - caso.restante / pasoActual.duracion))
        : 0;
  const hayTecleo =
    accionesActivas(pasoEscritorio, progresoRaw).some((a) => a.tipo === "teclear") ||
    accionesActivas(pasoEscritorio, progresoRaw, "humano").some((a) => a.tipo === "teclear");
  // Cuantizado a 0.02 y nunca 1 en un paso vivo (1 significa «estado final» para el escritorio).
  const progresoEscritorio =
    progresoRaw >= 1 ? 1 : Math.min(0.98, hayTecleo ? progresoRaw : Math.floor(progresoRaw * 50) / 50);

  let titulo: React.ReactNode;
  let subtitulo: string;
  if (terminada && caso.resultado) {
    titulo = (
      <>
        Expediente cerrado ·{" "}
        <span style={{ color: COLOR_RESULTADO[caso.resultado] }}>{TEXTO_RESULTADO[caso.resultado].toUpperCase()}</span>
      </>
    );
    subtitulo = `${def.nombre} selló el expediente ${caso.datos.expediente.numero}`;
  } else if (caso.estado === "en_cola") {
    titulo = (
      <>
        {caso.id} en cola de <span style={{ color: def.color }}>{def.nombre}</span>
      </>
    );
    subtitulo = ocupadoCon
      ? `Posición ${posicion} · el agente está terminando ${ocupadoCon.id} (${ocupadoCon.cliente})`
      : `Posición ${posicion} · el agente la toma en un instante`;
  } else if (caso.estado === "esperando") {
    titulo = (
      <>
        Esperando a <span className="text-amber-600">{pasoActual?.humano?.nombre}</span> · {pasoActual?.humano?.rol}
      </>
    );
    subtitulo = `${def.nombre} dejó la alerta en espera y sigue con la siguiente · decisión humana fuera del software`;
  } else {
    titulo = (
      <>
        <span style={{ color: def.color }}>{def.nombre}</span> está trabajando en {caso.id}
      </>
    );
    subtitulo = def.descripcion;
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] flex flex-col min-h-0 overflow-hidden">
      {/* Cabecera de la estación */}
      <div className={`px-4 border-b border-slate-100 ${teatro ? "pt-2 pb-2" : "pt-3 pb-2.5"}`}>
        <div className="flex items-start gap-3">
          <AvatarAgente id={agenteActualId} size={teatro ? 32 : 42} activo={caso.estado === "procesando"} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-slate-900 leading-tight truncate">{titulo}</div>
            {!teatro && (
              <div className="text-[11px] text-slate-500 mt-0.5 truncate [@media(max-height:860px)]:hidden">
                {subtitulo}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 font-mono-jetbrains text-[15px] font-bold text-slate-800 leading-none">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDuracion(transcurrido)}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
              {terminada ? "ciclo total" : "en proceso"}
            </div>
          </div>
        </div>

        <div className={`${teatro ? "mt-1.5" : "mt-2.5"} flex items-center gap-2 flex-wrap`}>
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/pipeline";
            }}
            className="inline-flex items-center gap-1 font-mono-jetbrains text-[11px] font-semibold text-[#0033A0] hover:underline"
            title="Ver la alerta en el pipeline"
          >
            {caso.id} <ExternalLink className="w-3 h-3" />
          </button>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-700 font-medium truncate max-w-[220px]">{caso.cliente}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono-jetbrains text-[11px] text-slate-800">{formatPeso(caso.monto)}</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
            <CreditCard className="w-3 h-3" /> {FRANQUICIA_LABEL[caso.franquicia]}
          </span>
          <span className="inline-flex items-center px-1.5 py-[1px] rounded-full bg-blue-50 text-blue-700 text-[10px] border border-blue-100">
            {caso.estadoAlerta}
          </span>
          {caso.escenario !== "legitima" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-amber-50 text-amber-700 text-[10px] border border-amber-200">
              excepción: {ESCENARIO_LABEL[caso.escenario]}
            </span>
          )}
          <span className="ml-auto text-[10px] text-slate-400">Recibida {horaCorta(caso.recibidoEn)}</span>
          <div
            className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200"
            title="Cómo ver el trabajo del agente"
          >
            <button
              type="button"
              onClick={() => cambiarModoVista("escritorio")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${escritorio ? "bg-white text-[#0033A0] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Monitor className="w-3 h-3" /> Escritorio
            </button>
            <button
              type="button"
              onClick={() => cambiarModoVista("tarjetas")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${!escritorio ? "bg-white text-[#0033A0] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="w-3 h-3" /> Tarjetas
            </button>
          </div>
        </div>

        <div className={`${teatro ? "mt-1.5" : "mt-2.5"} overflow-x-auto pb-0.5 [scrollbar-width:none]`}>
          <Stepper
            caso={caso}
            seleccion={revisando}
            onSeleccionar={(i) => setRevision(i === null ? null : { casoId: caso.id, idx: i })}
          />
        </div>

        {/* Acción en curso */}
        {!terminada && pasoActual && caso.estado !== "en_cola" && (
          <div
            className="mt-2.5 rounded-md border px-2.5 py-1.5 flex items-center gap-2"
            style={{ borderColor: `${def.color}40`, backgroundColor: `${def.color}0a` }}
          >
            {caso.estado === "esperando" ? (
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
            ) : (
              <Spinner color={def.color} />
            )}
            <span className="text-[12px] font-medium text-slate-800 truncate flex-1">
              {pasoActual.texto}
              {caso.estado === "esperando" ? ` · ${pasoActual.humano?.nombre}` : "…"}
            </span>
            {pasoActual.sistema && <ChipSistema id={pasoActual.sistema} />}
            <div className="w-28 shrink-0">
              <BarraProgreso
                valor={Math.max(0, Math.min(1, 1 - caso.restante / pasoActual.duracion))}
                color={caso.estado === "esperando" ? "#d97706" : def.color}
                alto={4}
              />
            </div>
            <span className="font-mono-jetbrains text-[10px] text-slate-500 w-10 text-right shrink-0">
              {formatDuracion(caso.restante)}
            </span>
          </div>
        )}
        {!terminada && pasoActual && caso.estado !== "en_cola" && (
          <PensamientoAgente
            texto={pasoActual.pensamiento}
            progreso={progresoRaw}
            velocidad={snap.velocidad}
            color={def.color}
            humano={caso.estado === "esperando"}
          />
        )}
        {caso.escenaForzada && ahora - caso.recibidoEn < 4000 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex items-center gap-2 rounded-md bg-violet-600 text-white px-2.5 py-1 text-[11px] font-medium"
          >
            <Clapperboard className="w-3.5 h-3.5" /> Escena: {caso.escenaForzada}
          </motion.div>
        )}
      </div>

      {/* Cuerpo */}
      <div
        className={`flex-1 min-h-0 bg-slate-50/60 p-3 ${escritorio ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}
      >
        {revisando !== null && (
          <div
            className="mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px]"
            style={{ borderColor: `${defVista.color}55`, backgroundColor: `${defVista.color}0d` }}
          >
            <History className="w-3.5 h-3.5" style={{ color: defVista.color }} />
            <span className="text-slate-700">
              Revisando lo que hizo <b style={{ color: defVista.color }}>{defVista.nombre}</b> con esta alerta (etapa
              completada).
            </span>
            <button
              type="button"
              onClick={() => setRevision(null)}
              className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Undo2 className="w-3 h-3" /> Volver a la etapa actual
            </button>
          </div>
        )}
        {caso.estado === "en_cola" && revisando === null && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
            <Spinner color={def.color} />
            <span>
              <b>{def.nombre}</b> tiene {estAgente.cola.length} en cola
              {ocupadoCon ? (
                <>
                  {" "}
                  y está procesando <b className="font-mono-jetbrains">{ocupadoCon.id}</b>:{" "}
                  <i>{estAgente.ultimaAccion}</i>
                </>
              ) : (
                ""
              )}
              .
            </span>
          </div>
        )}
        <div
          className={
            escritorio ? "flex-1 min-h-0 flex gap-3" : "grid grid-cols-1 2xl:grid-cols-[1fr_260px] gap-3 items-start"
          }
        >
          <motion.div
            key={surfaceKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={escritorio ? "flex-1 min-w-0 min-h-0 flex flex-col" : "min-w-0"}
          >
            {escritorio ? (
              <EscritorioRPA
                caso={caso}
                etapaIdx={etapaVistaIdx}
                paso={pasoEscritorio}
                progreso={progresoEscritorio}
                velocidad={snap.velocidad}
                relojSim={relojSimSeg}
                ahora={ahoraSeg}
                corriendo={snap.corriendo}
                revisando={revisando !== null}
                teatro={teatro}
              />
            ) : (
              <SuperficieGenerica caso={caso} agente={agenteId} />
            )}
          </motion.div>
          {!(escritorio && teatro) && (
            <div
              className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${escritorio ? "w-[260px] shrink-0 min-h-0 flex-col overflow-y-auto hidden min-[1900px]:flex" : ""}`}
            >
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Pasos del agente
                </span>
                <span className="text-[10px] font-mono-jetbrains text-slate-500">
                  {etapaVista.pasos.filter((p) => caso.pasosHechos[p.id]).length}/{etapaVista.pasos.length}
                </span>
              </div>
              <div className="p-1.5">
                <ListaPasos caso={caso} etapaIdx={etapaVistaIdx} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
