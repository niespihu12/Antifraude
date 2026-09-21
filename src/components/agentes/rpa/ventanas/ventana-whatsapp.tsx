"use client";

import { memo } from "react";
import { BatteryFull, Landmark, Mic, SendHorizontal, Signal, Wifi } from "lucide-react";
import type { PropsVentana } from "../tipos";
import { estadoAncla, progresoEfectivo } from "@/components/agentes/guion";
import { AvatarHumano, ChipRegla, Cursor } from "@/components/agentes/ui";
import {
  CIERRE_SEG,
  LLEGADA,
  T_RESP,
  TEXTO_RESPUESTA,
  estadoEntrega,
  hhmm,
  horaEnvio,
  lineaHSM,
  resumenSLA,
  textoTitular,
  type EstadoEntrega,
} from "@/data/guiones/kari-hsm";
import { CROMO } from "../cromo";
import VentanaSistema from "../ventana-sistema";
import { Dato } from "./comun";
import { BarraSLA, LineaReintento, Ticks, estadoSLA, formatT } from "./kari-piezas";

/**
 * Teléfono del titular durante las esperas humanas (c3 y c5): mockup vertical con el chat de «Centro de
 * Operaciones Antifraude». Llegan los tres mensajes del HSM, el titular los lee y responde «Sí fui yo» / «No fui yo» (o no
 * responde), y al final aparece el cierre del bot. El reloj del teléfono es la hora del envío más los minutos
 * simulados que deriva `lineaHSM` del progreso del paso; nada avanza solo. A los lados, dos rótulos del
 * simulador (fuera del teléfono) con el titular y el SLA.
 *
 * Anclas: wa.msg.{1,2,pregunta} (primer envío) · wa.msg.{4,5,reintento} (reintento) · wa.msg.respuesta ·
 * wa.msg.cierre · wa.campo.mensaje · wa.btn.enviar.
 */

const ETIQUETA = "text-[9.5px] uppercase tracking-wider font-semibold text-slate-400";

function BurbujaTel({
  texto,
  lado,
  hora,
  estado,
  ancla,
  resaltada = false,
}: {
  texto: string;
  lado: "sal" | "ent";
  hora: string;
  estado?: EstadoEntrega;
  ancla: string;
  resaltada?: boolean;
}) {
  const sal = lado === "sal";
  return (
    <div className={`flex shrink-0 ${sal ? "justify-end" : "justify-start"}`}>
      <div
        data-ancla={ancla}
        className={`animate-slide-in-up max-w-[92%] rounded-md px-1.5 py-[3px] text-[9px] leading-[11px] shadow-sm ${sal ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none"} ${resaltada ? "ring-2 ring-amber-400" : ""}`}
      >
        <div className="whitespace-pre-line text-slate-800">{texto}</div>
        <div className="mt-px flex items-center justify-end gap-0.5 text-[7.5px] leading-none text-slate-500">
          <span className="font-mono-jetbrains">{hora}</span>
          {sal && estado && <Ticks estado={estado} className="w-2.5 h-2.5" />}
        </div>
      </div>
    </div>
  );
}

function VentanaWhatsapp({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const lin = lineaHSM(caso, paso, p);
  const r = resumenSLA(d, lin);
  const h0 = horaEnvio(d);
  const reloj = hhmm(h0 + lin.seg * 1000);
  const resp = d.hsm.respuesta;
  const respSeg = (d.hsm.respuestaMin ?? 0) * 60;

  /* Qué hay en el chat */
  const llega1 = LLEGADA.c3.map((t) => lin.pc.c3 >= t);
  const llega2 = LLEGADA.c5.map((t) => lin.pc.c5 >= t);
  const hayMensajes = llega1[0];
  const respuestaVisible = resp !== "ninguna" && lin.pc.c3 >= T_RESP.enviar;
  const estadoResp = estadoEntrega(lin.pc.c3, T_RESP.enviar, T_RESP.entregado);
  const cierreVisible = resp !== "ninguna" && !!d.hsm.cierre && lin.pc.c3 >= T_RESP.cierre;
  const botEscribe = resp !== "ninguna" && lin.pc.c3 >= T_RESP.escribiendo && lin.pc.c3 < T_RESP.cierre;
  const res = (ancla: string) => estadoAncla(paso, p, ancla).resaltado;

  /* Compositor: el tecleo del titular es función del progreso; al tocar «enviar» el campo se vacía */
  const eCampo = estadoAncla(paso, p, "wa.campo.mensaje");
  const eEnviar = estadoAncla(paso, p, "wa.btn.enviar");
  const valorRespuesta = resp === "ninguna" ? "" : TEXTO_RESPUESTA[resp];
  const escribiendo = paso?.id === "c3" && eCampo.tecleo !== undefined && p < T_RESP.enviar;
  const textoCampo = escribiendo
    ? valorRespuesta.slice(0, Math.floor((eCampo.tecleo ?? 0) * valorRespuesta.length))
    : "";
  const tecleando = escribiendo && (eCampo.tecleo ?? 0) < 1;

  const sla = estadoSLA(r, d.hsm.respuestaMin);

  return (
    <VentanaSistema
      ventana="whatsapp"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
    >
      <div
        className="@container absolute inset-0 flex items-center justify-center gap-3 overflow-hidden px-2 py-1.5"
        style={{ backgroundColor: CROMO.whatsapp.fondo }}
      >
        {/* Rótulo del titular (simulador) */}
        <div className="hidden @min-[560px]:flex w-[172px] shrink-0 flex-col justify-center">
          <div className="rounded-md border border-slate-300 bg-white/85 p-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <AvatarHumano nombre={d.titular.nombre} size={22} color={d.titular.color} />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[10.5px] font-semibold text-slate-800">{d.titular.nombre}</div>
                <div className="text-[9.5px] text-slate-500">Titular de la tarjeta</div>
              </div>
            </div>
            <div className="space-y-px text-[10px]">
              <Dato k="Celular" v={d.hsm.entregadoA || "—"} mono />
              <Dato k="Reloj del teléfono" v={reloj} mono />
            </div>
            <div className="text-[10px] font-medium leading-tight text-slate-700">{textoTitular(d, lin)}</div>
          </div>
        </div>

        {/* Teléfono */}
        <div className="relative h-full max-h-[400px] w-[172px] shrink-0 rounded-[18px] bg-slate-900 p-1 shadow-lg">
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[14px] bg-[#ece5dd]">
            <div className="flex h-3.5 shrink-0 items-center justify-between bg-emerald-900 px-2 text-[8.5px] leading-none text-white">
              <span className="font-mono-jetbrains tabular-nums">{reloj}</span>
              <span className="flex items-center gap-0.5">
                <Signal className="w-2 h-2" />
                <Wifi className="w-2 h-2" />
                <BatteryFull className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="flex h-7 shrink-0 items-center gap-1.5 bg-emerald-800 px-1.5 text-white">
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Landmark className="w-2.5 h-2.5" />
              </span>
              <div className="min-w-0 leading-none">
                <div className="truncate text-[9px] font-semibold">Centro de Operaciones Antifraude</div>
                <div className="mt-0.5 text-[7.5px] text-emerald-100">
                  {botEscribe ? "escribiendo…" : "Cuenta de empresa"}
                </div>
              </div>
            </div>

            {/* Chat: lo más reciente abajo; lo anterior sale por arriba como en un teléfono real */}
            <div className="flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden px-1.5 py-1 mask-[linear-gradient(to_bottom,transparent,black_12px)]">
              {hayMensajes && (
                <span className="self-center shrink-0 rounded-full bg-white/85 px-1.5 py-px text-[8px] text-slate-500 shadow-sm">
                  Hoy
                </span>
              )}
              {d.hsm.mensajes.map(
                (m, i) =>
                  llega1[i] && (
                    <BurbujaTel
                      key={`a${i}`}
                      texto={m}
                      lado="ent"
                      hora={hhmm(h0)}
                      ancla={i === 2 ? "wa.msg.pregunta" : `wa.msg.${i + 1}`}
                      resaltada={i === 2 && res("wa.msg.pregunta")}
                    />
                  ),
              )}
              {respuestaVisible && (
                <BurbujaTel
                  texto={valorRespuesta}
                  lado="sal"
                  hora={hhmm(h0 + respSeg * 1000)}
                  estado={estadoResp}
                  ancla="wa.msg.respuesta"
                />
              )}
              {cierreVisible && d.hsm.cierre && (
                <BurbujaTel
                  texto={d.hsm.cierre}
                  lado="ent"
                  hora={hhmm(h0 + (respSeg + CIERRE_SEG) * 1000)}
                  ancla="wa.msg.cierre"
                />
              )}
              {d.hsm.mensajes.map(
                (m, i) =>
                  llega2[i] && (
                    <BurbujaTel
                      key={`b${i}`}
                      texto={m}
                      lado="ent"
                      hora={hhmm(h0 + d.hsm.reintentoMin * 60_000)}
                      ancla={i === 2 ? "wa.msg.reintento" : `wa.msg.${i + 4}`}
                      resaltada={i === 2 && res("wa.msg.reintento")}
                    />
                  ),
              )}
            </div>

            {/* Compositor */}
            <div className="flex h-7 shrink-0 items-center gap-1 bg-[#f0f0f0] px-1">
              <div
                data-ancla="wa.campo.mensaje"
                className={`flex h-5 min-w-0 flex-1 items-center rounded-full bg-white px-2 text-[9px] ${eCampo.foco ? "ring-1 ring-emerald-500" : ""}`}
              >
                {textoCampo ? (
                  <span className="truncate text-slate-800">
                    {textoCampo}
                    {tecleando && <Cursor />}
                  </span>
                ) : (
                  <span className="text-slate-400">Mensaje</span>
                )}
              </div>
              <span
                data-ancla="wa.btn.enviar"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white ${eEnviar.clic ? "brightness-75 scale-95" : ""}`}
              >
                {textoCampo ? <SendHorizontal className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
              </span>
            </div>
          </div>
        </div>

        {/* Rótulo del tiempo simulado y del SLA (simulador) */}
        <div className="hidden @min-[560px]:flex w-[172px] shrink-0 flex-col justify-center">
          <div className="rounded-md border border-slate-300 bg-white/85 p-2 space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <span className={ETIQUETA}>Tiempo simulado</span>
              <span className="font-mono-jetbrains text-[10px] tabular-nums text-slate-800">{formatT(lin.seg)}</span>
            </div>
            <BarraSLA r={r} />
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-slate-500">SLA</span>
              <span
                className={`rounded-full px-1.5 py-px text-[9.5px] font-medium leading-tight whitespace-nowrap ${sla.clase}`}
              >
                {sla.texto}
              </span>
            </div>
            <LineaReintento r={r} />
            {r.vencido && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-[#E31837]">
                Vence el SLA de {r.slaMin} min <ChipRegla codigo="R05" />
              </div>
            )}
          </div>
        </div>
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaWhatsapp);
