"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { CircleCheck, CircleX, FilePen, Hash, Maximize2, Minimize2 } from "lucide-react";
import type { Caso, Snapshot } from "@/types/agentes";
import { AGENTES_MAP, FRANQUICIA_LABEL, SISTEMAS, fechaCorta } from "@/data/agentes-data";
import { formatPeso } from "@/data/agentes-util";
import { Cursor } from "./ui";
import { COLOR_RESULTADO, TEXTO_RESULTADO, formatDuracion, horaCorta } from "./helpers";

interface Props {
  snap: Snapshot;
  maximizada: boolean;
  onToggle: () => void;
}

/**
 * Firma de lo que puede cambiar en una sección: el motor muta `caso` en sitio
 * (misma referencia por tick), así que la memoización compara esta clave y no el objeto.
 */
function firmaSeccion(caso: Caso): string {
  return `${caso.id}|${caso.estado}|${caso.etapaIdx}|${caso.pasoIdx}|${Object.keys(caso.pasosHechos).length}`;
}

interface PropsSeccion {
  caso: Caso;
  etapaIdx: number;
  /** Cambia solo cuando avanza el caso: evita re-renderizar la sección en cada tick. */
  firma: string;
}

const Seccion = memo(function Seccion({ caso, etapaIdx, firma }: PropsSeccion) {
  const etapa = caso.plan[etapaIdx];
  const def = AGENTES_MAP[etapa.agente];
  // Pasos hechos con su hora ya formateada: se recalcula solo cuando avanza el caso
  // (`firma` cambia con caso.id y con el número de pasos hechos), no en cada tick.
  const hechos = useMemo(
    () =>
      etapa.pasos
        .filter((p) => caso.pasosHechos[p.id] && !/^Entregando a /.test(p.texto))
        .map((p) => ({ p, h: caso.pasosHechos[p.id], hora: horaCorta(caso.pasosHechos[p.id].t) })),
    // `caso` y `etapa` conservan la referencia entre ticks (el motor muta en sitio): `firma` es la que invalida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caso, etapa, firma],
  );
  const esActual = etapaIdx === caso.etapaIdx && caso.estado !== "terminada";
  const terminada = etapaIdx < caso.etapaIdx || caso.estado === "terminada";
  const t = caso.tiemposEtapa[etapa.agente];
  if (hechos.length === 0 && !esActual) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3"
    >
      <div className="flex items-baseline gap-2 border-b border-slate-200 pb-1">
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
          {etapaIdx + 1}. {def.nombre}
        </span>
        <span className="text-[10px] text-slate-400">{SISTEMAS[def.sistema].nombre}</span>
        <span className="ml-auto text-[10px] font-mono-jetbrains text-slate-400">
          {t?.inicio ? horaCorta(t.inicio) : ""}
          {t?.fin ? ` → ${horaCorta(t.fin)} · ${formatDuracion(t.fin - t.inicio)}` : esActual ? " · en curso" : ""}
        </span>
      </div>
      <ol className="mt-1.5 space-y-1">
        {hechos.map(({ p, h, hora }) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-1.5 text-[11px] leading-snug"
          >
            <span className="shrink-0 mt-[2px]">
              {h.ok ? (
                <CircleCheck className="w-3 h-3 text-emerald-600" />
              ) : (
                <CircleX className="w-3 h-3 text-red-500" />
              )}
            </span>
            <span className="text-slate-700">
              <span className="font-medium text-slate-800">{p.texto.replace(/…$/, "")}</span>
              {h.resultado && <span className="text-slate-500"> — {h.resultado}</span>}
              {p.regla && (
                <span className="ml-1 font-mono-jetbrains text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1">
                  {p.regla}
                </span>
              )}
              <span className="ml-1 font-mono-jetbrains text-[9px] text-slate-400">{hora}</span>
            </span>
          </motion.li>
        ))}
        {esActual && !terminada && (
          <li className="text-[11px] text-slate-400 italic">
            {caso.estado === "en_cola" ? "en cola…" : etapa.pasos[caso.pasoIdx]?.texto}
            <Cursor />
          </li>
        )}
      </ol>
    </motion.section>
  );
});

export default function Expediente({ snap, maximizada, onToggle }: Props) {
  const caso = snap.casos.find((c) => c.id === snap.focoId);
  const firma = caso ? firmaSeccion(caso) : "";
  const d = caso?.datos;

  return (
    <div className="bg-white rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] flex flex-col min-h-0 h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
        <FilePen className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
          Expediente documentado
        </span>
        {caso && caso.estado !== "terminada" && (
          <span className="text-[10px] text-slate-400 italic">escribiéndose…</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="ml-auto text-slate-400 hover:text-slate-700 transition-colors"
          title={maximizada ? "Restaurar" : "Ampliar"}
        >
          {maximizada ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-100/60">
        {!caso || !d ? (
          <div className="text-[11px] text-slate-400 italic">Sin alerta en foco.</div>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm px-4 py-4 min-h-full">
            {/* Encabezado tipo documento */}
            <div className="flex items-start justify-between gap-3 border-b-2 border-slate-800 pb-2">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Centro de Operaciones Antifraude</div>
                <div className="text-[14px] font-bold text-slate-900 leading-tight mt-0.5">
                  Expediente {d.expediente.numero}
                </div>
                <div className="text-[10px] text-slate-500">
                  Generado automáticamente por {AGENTES_MAP.registro.nombre}
                </div>
              </div>
              {caso.estado === "terminada" && caso.resultado && (
                <div
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 rounded rotate-[-4deg]"
                  style={{ color: COLOR_RESULTADO[caso.resultado], borderColor: COLOR_RESULTADO[caso.resultado] }}
                >
                  {TEXTO_RESULTADO[caso.resultado]}
                </div>
              )}
            </div>

            <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div className="flex gap-1">
                <dt className="text-slate-400 w-[72px] shrink-0">Alerta</dt>
                <dd className="font-mono-jetbrains text-slate-800">{caso.id}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-slate-400 w-[72px] shrink-0">Origen</dt>
                <dd className="text-slate-800">
                  {d.alerta.origen} · {FRANQUICIA_LABEL[caso.franquicia]}
                </dd>
              </div>
              <div className="flex gap-1 col-span-2">
                <dt className="text-slate-400 w-[72px] shrink-0">Titular</dt>
                <dd className="text-slate-800">
                  {caso.cliente} · CC {d.cliente.cedula}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-slate-400 w-[72px] shrink-0">Tarjeta</dt>
                <dd className="font-mono-jetbrains text-slate-800">{caso.tarjeta}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-slate-400 w-[72px] shrink-0">Monto</dt>
                <dd className="font-mono-jetbrains text-slate-800">{formatPeso(caso.monto)}</dd>
              </div>
              <div className="flex gap-1 col-span-2">
                <dt className="text-slate-400 w-[72px] shrink-0">Comercio</dt>
                <dd className="text-slate-800">
                  {d.transaccion.comercio} · {d.transaccion.ciudad}, {d.transaccion.pais}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-slate-400 w-[72px] shrink-0">Recibida</dt>
                <dd className="font-mono-jetbrains text-slate-800">
                  {fechaCorta(caso.recibidoEn)} {horaCorta(caso.recibidoEn)}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-slate-400 w-[72px] shrink-0">Caso CRM</dt>
                <dd className="font-mono-jetbrains text-slate-800">
                  {caso.pasosHechos["g1"] || caso.pasosHechos["g2"] ? d.registro.casoCrm : "—"}
                </dd>
              </div>
            </dl>

            {caso.plan.map((_, i) => (
              <Seccion key={i} caso={caso} etapaIdx={i} firma={firma} />
            ))}

            {caso.estado === "terminada" && caso.resultado && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-4 border-t-2 border-slate-800 pt-2"
              >
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Acta de cierre</div>
                <p className="mt-1 text-[11px] text-slate-700 leading-relaxed">
                  La alerta <b className="font-mono-jetbrains">{caso.id}</b> de <b>{caso.cliente}</b> concluyó su
                  proceso con resultado{" "}
                  <b style={{ color: COLOR_RESULTADO[caso.resultado] }}>
                    {TEXTO_RESULTADO[caso.resultado].toUpperCase()}
                  </b>{" "}
                  en {formatDuracion((caso.terminadoEn ?? 0) - caso.recibidoEn)}, con{" "}
                  {Object.keys(caso.pasosHechos).length} acciones documentadas y {caso.excepciones}{" "}
                  {caso.excepciones === 1 ? "excepción" : "excepciones"}
                  {caso.excepciones > 0 ? " gestionada(s) según las reglas de negocio" : ""}. {d.registro.causa}.
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono-jetbrains text-slate-500">
                  <Hash className="w-3 h-3" /> SHA-256 {d.expediente.hash.slice(0, 32)}…
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Sellado por {AGENTES_MAP.registro.nombre} · {horaCorta(caso.terminadoEn ?? 0)}
                </div>
              </motion.section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
