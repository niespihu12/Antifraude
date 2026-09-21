"use client";

import { memo } from "react";
import { Circle, CircleCheck, CircleX, Minus, TriangleAlert } from "lucide-react";
import type { ControlChequeo, DatosCaso } from "@/types/agentes";
import { AGENTES_MAP, FRANQUICIA_LABEL } from "@/data/agentes-data";
import { formatPeso } from "@/data/agentes-util";
import { estadoAncla, progresoEfectivo } from "@/components/agentes/guion";
import { BarraProgreso, ChipRegla, Spinner } from "@/components/agentes/ui";
import {
  T_RESUMEN,
  estadoControl,
  resumenIdentificacion,
  resumenRiesgo,
  type EstadoControl,
} from "@/data/guiones/revision";
import VentanaSistema from "../ventana-sistema";
import type { PropsVentana } from "../tipos";
import { ToastEntrega } from "./comun";

/** Título de la barra según la vista: la pantalla ES la revisión, no un sistema. */
const TITULO_VISTA: Record<string, string> = {
  "revision.identificacion": "Revisión de identificación · 4 controles",
  "revision.riesgo": "Revisión de riesgo · 4 controles",
};

/** De dónde sale el dato de cada control (etiqueta discreta de la fila). */
const FUENTE: Record<string, string> = {
  cliente: "CRM Banco",
  celular: "CRM Banco",
  dispositivo: "Banca móvil",
  ubicacion: "Monitor",
  monto: "Histórico del cliente",
  patron: "Histórico 90 días",
  comercio: "Catálogo de comercios",
  cardinal: "Cardinal",
};

const ESTILO: Record<EstadoControl, { caja: string; etiqueta: string; color: string }> = {
  pendiente: { caja: "bg-white/60 border-slate-200", etiqueta: "Pendiente", color: "text-slate-400" },
  revisando: { caja: "bg-blue-50 border-blue-300", etiqueta: "Revisando…", color: "text-blue-700" },
  ok: { caja: "bg-white border-emerald-200", etiqueta: "Superado", color: "text-emerald-700" },
  aviso: { caja: "bg-amber-50 border-amber-300", etiqueta: "Con aviso", color: "text-amber-700" },
  falla: { caja: "bg-red-50 border-red-300", etiqueta: "No superado", color: "text-[#E31837]" },
  na: { caja: "bg-slate-50 border-dashed border-slate-300", etiqueta: "No aplica", color: "text-slate-400" },
};

function IconoControl({ estado }: { estado: EstadoControl }) {
  switch (estado) {
    case "revisando":
      return <Spinner className="w-4 h-4" color="#2563eb" />;
    case "ok":
      return <CircleCheck className="w-4 h-4 text-emerald-600" />;
    case "aviso":
      return <TriangleAlert className="w-4 h-4 text-amber-500" />;
    case "falla":
      return <CircleX className="w-4 h-4 text-[#E31837]" />;
    case "na":
      return <Minus className="w-4 h-4 text-slate-400" />;
    default:
      return <Circle className="w-4 h-4 text-slate-300" />;
  }
}

/* ─── Piezas de los controles de riesgo ─── */

/** Monto de la compra frente al promedio histórico del cliente (R06). Las barras crecen mientras se revisa. */
function BarrasMonto({
  monto,
  promedio,
  sub,
  atipico,
}: {
  monto: number;
  promedio: number;
  sub: number;
  atipico: boolean;
}) {
  const max = Math.max(monto, promedio, 1);
  const filas = [
    { etiqueta: "Monto", valor: monto, color: atipico ? "bg-amber-500" : "bg-emerald-500" },
    { etiqueta: "Prom.", valor: promedio, color: "bg-slate-400" },
  ];
  return (
    <div className="shrink-0 w-[132px] space-y-[3px]" aria-hidden>
      {filas.map((f) => (
        <div key={f.etiqueta} className="flex items-center gap-1 text-[9px] leading-none text-slate-500">
          <span className="w-[26px]">{f.etiqueta}</span>
          <div className="flex-1 h-[7px] bg-slate-100 rounded-[1px] overflow-hidden">
            <div className={`h-full ${f.color}`} style={{ width: `${Math.round((f.valor / max) * sub * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Medidor semicircular del score Cardinal (0–100) con la marca del umbral. */
function Medidor({ score, sub, umbral = 70 }: { score: number; sub: number; umbral?: number }) {
  const R = 19;
  const cx = 26;
  const cy = 24;
  const ang = (v: number) => Math.PI * (1 - v / 100);
  const px = (v: number, r: number) => (cx + r * Math.cos(ang(v))).toFixed(2);
  const py = (v: number, r: number) => (cy - r * Math.sin(ang(v))).toFixed(2);
  const arco = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  const color = score >= umbral ? "#dc2626" : score >= 50 ? "#d97706" : "#059669";
  return (
    <div className="shrink-0 flex items-center gap-1" aria-hidden>
      <svg width="52" height="28" viewBox="0 0 52 28">
        <path d={arco} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <path
          d={arco}
          fill="none"
          stroke={color}
          strokeWidth="5"
          pathLength={100}
          strokeDasharray={`${(score * sub).toFixed(1)} 100`}
        />
        <line
          x1={px(umbral, R - 4)}
          y1={py(umbral, R - 4)}
          x2={px(umbral, R + 3)}
          y2={py(umbral, R + 3)}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      </svg>
      <span className="font-mono text-[11px] font-bold leading-none tabular-nums" style={{ color }}>
        {Math.round(score * sub)}
        <span className="font-normal text-slate-400">/100</span>
      </span>
    </div>
  );
}

function Extras({
  control,
  estado,
  sub,
  d,
}: {
  control: ControlChequeo;
  estado: EstadoControl;
  sub: number;
  d: DatosCaso;
}) {
  if (estado === "pendiente" || estado === "na") return null;
  switch (control.id) {
    case "monto":
      return (
        <BarrasMonto
          monto={d.transaccion.monto}
          promedio={d.transaccion.promedioHistorico}
          sub={sub}
          atipico={d.transaccion.atipico}
        />
      );
    case "comercio":
      return (
        <span className="shrink-0 px-1.5 py-[1px] rounded border border-slate-300 bg-white font-mono text-[10px] text-slate-600">
          MCC {d.transaccion.mcc}
        </span>
      );
    case "cardinal":
      return d.scoreCardinal !== null ? <Medidor score={d.scoreCardinal} sub={sub} /> : null;
    default:
      return null;
  }
}

/** Un control de la lista de chequeo: pendiente → revisando (spinner) → ✓ / ⚠ / ✗ / no aplica. */
function FilaControl({ control, k, p, d }: { control: ControlChequeo; k: number; p: number; d: DatosCaso }) {
  const { estado, sub } = estadoControl(control, k, p);
  const s = ESTILO[estado];
  const apagado = estado === "pendiente" || estado === "na";
  const detalle =
    estado === "pendiente"
      ? "Pendiente de revisión"
      : estado === "revisando"
        ? `Consultando ${FUENTE[control.id] ?? "fuente"}…`
        : control.detalle;
  return (
    <div
      data-ancla={`rev.fila.${control.id}`}
      className={`min-h-0 overflow-hidden flex items-center gap-2 px-2 rounded border ${s.caja}`}
    >
      <span className="shrink-0 w-4 h-4 flex items-center justify-center">
        <IconoControl estado={estado} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap leading-[15px]">
          <span className={`text-[11.5px] font-semibold ${apagado ? "text-slate-500" : "text-slate-800"}`}>
            {k + 1}. {control.nombre}
          </span>
          {control.regla && (estado === "aviso" || estado === "falla") && <ChipRegla codigo={control.regla} />}
          <span className="text-[10px] text-slate-400 truncate">· {FUENTE[control.id] ?? "Sistema"}</span>
        </div>
        <div
          className={`truncate text-[10.5px] leading-[13px] ${estado === "pendiente" || estado === "revisando" ? "italic text-slate-400" : estado === "na" ? "text-slate-400" : "text-slate-600"}`}
        >
          {detalle}
        </div>
      </div>
      <Extras control={control} estado={estado} sub={sub} d={d} />
      <span className={`shrink-0 w-[68px] text-right text-[10.5px] font-semibold ${s.color}`}>{s.etiqueta}</span>
    </div>
  );
}

/* ═══════════════ Ventana ═══════════════ */
/**
 * Lista de chequeo «ítem por ítem»: la pantalla ES la revisión (identificación en i2, riesgo en d1).
 * Cada control se pinta como función pura del progreso del paso (`estadoControl`); lo ya hecho
 * (`caso.pasosHechos`) se ve completo y lo que aún no empezó, pendiente.
 */
function VentanaRevision({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const esRiesgo = vista === "revision.riesgo";
  const controles = esRiesgo ? d.riesgo : d.identificacion;
  const idPaso = esRiesgo ? "d1" : "i2";
  const hecho = !!caso.pasosHechos[idPaso];
  const vivo = !hecho && paso?.id === idPaso;
  const pv = hecho ? 1 : vivo ? p : 0;
  const resumen = esRiesgo ? resumenRiesgo(d) : resumenIdentificacion(d);
  const color = AGENTES_MAP[esRiesgo ? "decision" : "identificacion"].color;

  const estados = controles.map((x, k) => estadoControl(x, k, pv));
  const revisados = estados.filter((e) => e.estado !== "pendiente" && e.estado !== "revisando").length;
  const fraccion =
    estados.reduce((s, e) => s + (e.estado === "pendiente" ? 0 : e.estado === "revisando" ? e.sub : 1), 0) /
    controles.length;
  const resumido = pv >= T_RESUMEN;
  const resaltado = paso ? estadoAncla(paso, p, "rev.resumen").resaltado : false;
  const claseResumen = !resumido
    ? "bg-white/60 border-slate-200 text-slate-500"
    : resumen.nivel === "error"
      ? "bg-red-50 border-red-300 text-[#E31837]"
      : resumen.nivel === "aviso"
        ? "bg-amber-50 border-amber-300 text-amber-800"
        : "bg-emerald-50 border-emerald-300 text-emerald-800";
  const IconoResumen = resumen.nivel === "error" ? CircleX : resumen.nivel === "aviso" ? TriangleAlert : CircleCheck;

  return (
    <VentanaSistema
      ventana="revision"
      titulo={TITULO_VISTA[vista]}
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
      color={color}
      elementos={controles.length}
    >
      <div className="absolute inset-0 flex flex-col gap-1 p-1.5 text-[11px] text-slate-800">
        {/* Cabecera: alerta revisada y avance */}
        <div className="h-[22px] shrink-0 flex items-center gap-2 px-1 text-[10.5px] whitespace-nowrap overflow-hidden">
          <span className="font-semibold text-slate-700">Alerta</span>
          <span className="font-mono text-slate-900">{caso.id}</span>
          <span className="text-slate-500 truncate">
            · {caso.cliente} · {FRANQUICIA_LABEL[caso.franquicia]} ····{d.tarjeta.ultimos4} · {formatPeso(caso.monto)}
          </span>
          <span className="ml-auto shrink-0 flex items-center gap-1.5">
            <span className="font-mono tabular-nums text-slate-700">
              {revisados}/{controles.length}
            </span>
            <span className="w-[90px]">
              <BarraProgreso valor={fraccion} color={color} />
            </span>
          </span>
        </div>

        {/* Lista de chequeo */}
        <div
          className="flex-1 min-h-0 grid gap-[3px]"
          style={{ gridTemplateRows: `repeat(${controles.length}, minmax(0, 1fr))` }}
        >
          {controles.map((x, k) => (
            <FilaControl key={x.id} control={x} k={k} p={pv} d={d} />
          ))}
        </div>

        {/* Resumen */}
        <div
          data-ancla="rev.resumen"
          className={`h-[26px] shrink-0 flex items-center gap-2 px-2 rounded border text-[11.5px] whitespace-nowrap overflow-hidden ${claseResumen} ${resaltado ? "outline-2 outline-amber-400 -outline-offset-2" : ""}`}
        >
          {resumido ? (
            <>
              <IconoResumen className="w-4 h-4 shrink-0" />
              <span className="font-semibold truncate">{resumen.texto}</span>
              {!esRiesgo && resumen.avisos > 0 && (
                <span className="text-[10.5px] font-normal shrink-0">· {resumen.avisos} con aviso</span>
              )}
              {!esRiesgo && (
                <span className="ml-auto shrink-0 text-[10.5px] font-normal text-slate-600">
                  Continúa: {resumen.regla ? "monitoreo manual" : "Comunicación"}
                </span>
              )}
            </>
          ) : (
            <>
              {vivo && <Spinner className="w-3.5 h-3.5 shrink-0" color={color} />}
              <span className="italic truncate">
                {vivo || revisados > 0
                  ? `Revisión en curso · ${revisados}/${controles.length}`
                  : "En espera de revisión"}
              </span>
            </>
          )}
        </div>
      </div>
      <ToastEntrega paso={paso} progreso={p} />
    </VentanaSistema>
  );
}

export default memo(VentanaRevision);
