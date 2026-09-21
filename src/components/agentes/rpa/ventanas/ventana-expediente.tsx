"use client";

import { memo } from "react";
import { Circle, CircleCheck, FolderLock, Hash } from "lucide-react";
import type { Caso } from "@/types/agentes";
import { AGENTES_MAP } from "@/data/agentes-data";
import { estadoAncla, progresoEfectivo, type EstadoAncla } from "@/components/agentes/guion";
import { COLOR_RESULTADO, TEXTO_RESULTADO, formatDuracion, horaCorta } from "@/components/agentes/helpers";
import { ChipRegla, Sello, TextoEnVivo } from "@/components/agentes/ui";
import {
  ANCLA_ACTA,
  ANCLA_HASH,
  ANCLA_SELLAR,
  PASO_SECCION,
  SECCIONES_EXPEDIENTE,
  T_G5,
  anclaFila,
  resumenSeccion,
  tSeccion,
  tiempoSeccion,
} from "@/data/guiones/expediente-datos";
import VentanaSistema from "../ventana-sistema";
import type { PropsVentana } from "../tipos";
import { ToastEntrega } from "./comun";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type EstadoFila = "hecha" | "activa" | "pendiente";

/* ─── Tabla de secciones (izquierda) ─── */
function Fila({
  slug,
  etiqueta,
  resumen,
  hora,
  estado,
  color,
}: {
  slug: string;
  etiqueta: string;
  resumen: string;
  hora?: number;
  estado: EstadoFila;
  color: string;
}) {
  return (
    <div
      data-ancla={anclaFila(slug)}
      className={`h-[21px] shrink-0 flex items-center gap-1.5 px-1.5 border-b border-slate-100 text-[10px] leading-none ${estado === "activa" ? "bg-blue-50" : ""}`}
    >
      <span className="w-3 h-3 shrink-0 flex items-center justify-center">
        {estado === "hecha" ? (
          <CircleCheck className="w-3 h-3 text-emerald-600" />
        ) : estado === "activa" ? (
          <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: color }} />
        ) : (
          <Circle className="w-3 h-3 text-slate-300" />
        )}
      </span>
      <span
        className={`w-[100px] shrink-0 truncate font-medium ${estado === "pendiente" ? "text-slate-400" : "text-slate-700"}`}
      >
        {etiqueta}
      </span>
      <span className="flex-1 min-w-0 truncate text-slate-600">
        {estado === "hecha" ? resumen : <span className="text-slate-300">—</span>}
      </span>
      <span className="w-[50px] shrink-0 text-right font-mono-jetbrains text-[9.5px] text-slate-400">
        {estado === "hecha" && hora ? horaCorta(hora) : ""}
      </span>
    </div>
  );
}

/** Sello SHA-256: el agente lo pega (Ctrl+V); ocupa dos líneas de 64 caracteres hexadecimales. */
function CampoHash({ hash, e, visible }: { hash: string; e: EstadoAncla; visible: boolean }) {
  return (
    <div
      data-ancla={ANCLA_HASH}
      className={`h-[34px] px-1.5 py-[3px] bg-white rounded overflow-hidden font-mono-jetbrains text-[9px] leading-[11px] break-all text-slate-800 ${e.foco ? "border-2 border-blue-600" : "border border-slate-300"} ${e.resaltado ? "!bg-amber-100" : ""}`}
    >
      {visible ? hash : <span className="text-[10px] text-slate-400">Pendiente de calcular…</span>}
    </div>
  );
}

/** Acta de cierre: cifras a partir del plan y de lo ya hecho (el propio sellado cuenta como una acción). */
function textoActa(caso: Caso, resultado: "legitima" | "fraude", duracionMs: number): string {
  const acciones = caso.plan
    .flatMap((e) => e.pasos)
    .filter((x) => !/^Entregando a /.test(x.texto) && (caso.pasosHechos[x.id] || x.id === "g5")).length;
  const exc = caso.excepciones;
  return `Alerta ${caso.id} cerrada como ${TEXTO_RESULTADO[resultado].toUpperCase()} en ${formatDuracion(duracionMs)}: ${acciones} acciones documentadas y ${exc} ${exc === 1 ? "excepción" : "excepciones"}. ${caso.datos.registro.causa}.`;
}

/**
 * Ventana «Expediente digital · Trazabilidad 24/7» (g5): las siete secciones del expediente se consolidan una a
 * una, el agente pega el sello SHA-256 y se redacta el acta de cierre con el resultado. Todo es función pura de
 * `progreso` y de lo ya hecho en `caso.pasosHechos`; a progreso 1 (revisión, velocidad ≥ ×5) muestra el estado final.
 */
function VentanaExpediente({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const color = AGENTES_MAP.registro.color;
  const pasoG5 = paso?.id === "g5" ? paso : undefined;
  const pv = pasoG5 ? p : 1;
  const eHash = estadoAncla(pasoG5, pv, ANCLA_HASH);
  const eSellar = estadoAncla(pasoG5, pv, ANCLA_SELLAR);
  const n = SECCIONES_EXPEDIENTE.length;
  const estadoFila = (i: number): EstadoFila =>
    pv >= tSeccion(i) + PASO_SECCION ? "hecha" : pv >= tSeccion(i) ? "activa" : "pendiente";
  const consolidadas = SECCIONES_EXPEDIENTE.filter((_, i) => estadoFila(i) === "hecha").length;

  const sellado = pv >= T_G5.sello;
  const hashVisible = pv >= T_G5.pegar || eHash.pegado || eHash.tecleo !== undefined;
  const resultado = caso.resultado ?? d.desenlace;
  const colorResultado = COLOR_RESULTADO[resultado];
  const planG5 = caso.plan.flatMap((e) => e.pasos).find((x) => x.id === "g5");
  const tSello = caso.pasosHechos.g5?.t ?? caso.ultimoEvento + Math.round(T_G5.sello * (planG5?.duracion ?? 0));
  const acta = textoActa(caso, resultado, tSello - caso.recibidoEn);
  const pActa = pv >= 1 ? 1 : clamp01((pv - T_G5.acta) / (T_G5.actaFin - T_G5.acta));

  return (
    <VentanaSistema
      ventana="expediente"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
      color={color}
      elementos={n}
    >
      <div className="absolute inset-0 flex flex-col text-[11px]">
        {/* Cabecera del expediente */}
        <div className="h-[20px] shrink-0 px-2 flex items-center gap-1.5 bg-white border-b border-slate-200 text-[10.5px] leading-none whitespace-nowrap overflow-hidden">
          <FolderLock className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-800 shrink-0">Expediente</span>
          <span className="font-mono-jetbrains text-slate-800 shrink-0">{d.expediente.numero}</span>
          <span className="text-slate-400 shrink-0">·</span>
          <span className="truncate text-slate-600">
            Alerta <span className="font-mono-jetbrains">{caso.id}</span> · {d.cliente.nombre}
          </span>
          <span className="ml-auto flex items-center gap-1 shrink-0 text-slate-500">
            Trazabilidad 24/7 <ChipRegla codigo="R12" />
          </span>
        </div>

        <div className="flex-1 min-h-0 flex gap-2 p-1.5">
          {/* Secciones consolidadas */}
          <div className="flex-1 min-w-0 flex flex-col bg-white border border-slate-200 rounded overflow-hidden">
            <div className="h-4 shrink-0 px-1.5 flex items-center gap-1.5 bg-slate-50 border-b border-slate-200 text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
              <span className="w-3 shrink-0" />
              <span className="w-[100px] shrink-0">Sección</span>
              <span className="flex-1">Resumen</span>
              <span className="w-[50px] shrink-0 text-right">Hora</span>
            </div>
            {SECCIONES_EXPEDIENTE.map((s, i) => (
              <Fila
                key={s.slug}
                slug={s.slug}
                etiqueta={s.etiqueta}
                resumen={resumenSeccion(caso, s.slug)}
                hora={tiempoSeccion(caso, s)}
                estado={estadoFila(i)}
                color={color}
              />
            ))}
            <div className="mt-auto h-4 shrink-0 px-1.5 flex items-center text-[9.5px] text-slate-500 bg-slate-50 border-t border-slate-200 leading-none">
              <span className="font-mono-jetbrains tabular-nums mr-1">
                {consolidadas}/{n}
              </span>
              secciones consolidadas
            </div>
          </div>

          {/* Sello de integridad y acta de cierre */}
          <div className="w-[214px] shrink-0 flex flex-col gap-1 bg-white border border-slate-200 rounded p-1.5 overflow-hidden">
            <div className="h-5 shrink-0 flex items-center justify-between gap-1">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                Sello SHA-256
              </span>
              <span
                data-ancla={ANCLA_SELLAR}
                className={`h-5 px-2 inline-flex items-center gap-1 rounded text-white text-[10.5px] font-medium shadow-sm shrink-0 ${eSellar.clic ? "brightness-90 translate-y-px" : ""} ${sellado ? "opacity-60" : ""}`}
                style={{ backgroundColor: color }}
              >
                <Hash className="w-3 h-3" /> {sellado ? "Sellado" : "Sellar"}
              </span>
            </div>
            <CampoHash hash={d.expediente.hash} e={eHash} visible={hashVisible} />

            <div className="mt-0.5 pt-1 border-t border-slate-200 flex items-center justify-between gap-1 min-h-[24px]">
              <span className="text-[10.5px] font-semibold text-slate-700">Acta de cierre</span>
              {pv >= T_G5.resultado && (
                <Sello
                  texto={TEXTO_RESULTADO[resultado].toUpperCase()}
                  color={colorResultado}
                  className="!text-[10px] !px-2 !py-0.5 !border-2"
                />
              )}
            </div>
            <p
              data-ancla={ANCLA_ACTA}
              className="text-[10px] leading-[13px] text-slate-700 max-h-[66px] overflow-hidden"
            >
              {pv >= T_G5.acta ? (
                <TextoEnVivo texto={acta} progreso={pActa} />
              ) : (
                <span className="text-slate-400 italic">Se redacta al sellar el expediente.</span>
              )}
            </p>
          </div>
        </div>
      </div>
      <ToastEntrega paso={paso} progreso={p} />
    </VentanaSistema>
  );
}

export default memo(VentanaExpediente);
