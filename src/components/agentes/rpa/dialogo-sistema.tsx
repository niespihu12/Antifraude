"use client";

import { memo, useLayoutEffect, useRef, type ReactNode } from "react";
import { CircleHelp, Info, TriangleAlert, X } from "lucide-react";
import type { AccionUI, PasoPlan } from "@/types/agentes";
import { anclaBoton, estadoAncla, progresoAccion } from "@/components/agentes/guion";
import { BarraProgreso, CampoTecleado, ChipRegla, Spinner } from "@/components/agentes/ui";
import { slugAncla } from "@/data/agentes-util";
import type { Rect } from "./tipos";
import type { TipoCromo } from "./cromo";

const FUENTE_CLASICA = 'Tahoma, "Segoe UI", system-ui, sans-serif';
const BISEL_ALTO = "border border-t-white border-l-white border-b-slate-500 border-r-slate-500";
const BISEL_BAJO = "border border-t-slate-500 border-l-slate-500 border-b-white border-r-white";

export interface PropsDialogo {
  /** Acción 'dialogo' activa (`dialogoActivo(paso, p)`). */
  accion: AccionUI;
  /** Progreso del paso (0–1). */
  progreso: number;
  tipoCromo: TipoCromo;
  paso: PasoPlan;
  /** Color de acento (agente o humano). */
  color: string;
  /** Posición de anclas relativa al escritorio; el menú contextual la usa como respaldo. */
  medir?: (ancla: string) => Rect | undefined;
}

/** Valor que el guion teclea/pega en un campo del diálogo. */
function valorCampo(paso: PasoPlan, ancla: string): string {
  const a = (paso.ui ?? []).find((x) => (x.tipo === "teclear" || x.tipo === "pegar") && x.ancla === ancla);
  return a?.texto ?? "";
}

/* ─── Botón de diálogo (ancla dlg.btn.<slug>; «presionado» mientras estadoAncla().clic) ─── */
function BotonDialogo({
  etiqueta,
  primario,
  presionado,
  clasico,
  color,
}: {
  etiqueta: string;
  primario: boolean;
  presionado: boolean;
  clasico: boolean;
  color: string;
}) {
  if (clasico) {
    return (
      <span
        data-ancla={anclaBoton(etiqueta)}
        className={`h-[22px] min-w-[72px] px-3 inline-flex items-center justify-center text-[11px] text-black bg-[#ece9d8] select-none ${presionado ? `${BISEL_BAJO} translate-y-[1px]` : BISEL_ALTO} ${primario ? "outline outline-1 outline-black -outline-offset-[3px]" : ""}`}
        style={{ fontFamily: FUENTE_CLASICA }}
      >
        {etiqueta}
      </span>
    );
  }
  return (
    <span
      data-ancla={anclaBoton(etiqueta)}
      className={`h-[24px] min-w-[76px] px-3 inline-flex items-center justify-center rounded-md text-[11px] font-medium select-none border transition-shadow ${primario ? "text-white border-transparent" : "bg-white text-slate-700 border-slate-300"} ${presionado ? "shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] translate-y-[1px]" : "shadow-sm"}`}
      style={primario ? { backgroundColor: color, filter: presionado ? "brightness(0.85)" : undefined } : undefined}
    >
      {etiqueta}
    </span>
  );
}

/**
 * Diálogo modal de un sistema (confirmar/error/info/progreso/menu).
 * Todo lo que se ve es función de `progreso`: el contador «{cuenta}», las barras,
 * el campo tecleado y el estado «presionado» de los botones.
 */
function DialogoSistema({ accion, progreso, tipoCromo, paso, color, medir }: PropsDialogo) {
  const dlg = accion.dialogo;
  const clasico = tipoCromo === "clasico";
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const esMenu = dlg?.tipo === "menu";
  const anclaMenu = accion.ancla;
  const nItems = dlg?.items?.length ?? 0;

  // Menú contextual: se mide UNA vez por diálogo (no por tick), relativo al
  // overlay, y la posición se escribe directamente en el DOM (sin estado).
  useLayoutEffect(() => {
    if (!esMenu) return;
    const overlay = overlayRef.current;
    const menu = menuRef.current;
    if (!overlay || !menu) return;
    const ro = overlay.getBoundingClientRect();
    let x: number | undefined;
    let y: number | undefined;
    const objetivo = anclaMenu
      ? overlay.parentElement?.querySelector<HTMLElement>(`[data-ancla="${anclaMenu}"]`)
      : null;
    if (objetivo) {
      const r = objetivo.getBoundingClientRect();
      x = r.left - ro.left + Math.min(12, r.width / 2);
      y = r.top - ro.top + r.height / 2;
    } else if (anclaMenu && medir) {
      const r = medir(anclaMenu);
      if (r) {
        x = r.x + Math.min(12, r.w / 2);
        y = r.y + r.h / 2;
      }
    }
    if (x === undefined || y === undefined) {
      // Sin ancla: esquina superior izquierda del cuerpo.
      menu.style.left = "24px";
      menu.style.top = "24px";
      return;
    }
    const anchoMenu = menu.offsetWidth || 190;
    const altoMenu = menu.offsetHeight || nItems * 22 + 8;
    x = Math.max(4, Math.min(x + 8, ro.width - anchoMenu - 4));
    y = Math.max(4, Math.min(y + 8, ro.height - altoMenu - 4));
    menu.style.left = `${Math.round(x)}px`;
    menu.style.top = `${Math.round(y)}px`;
  }, [esMenu, anclaMenu, paso.id, medir, nItems]);

  if (!dlg) return null;
  const pa = progresoAccion(accion, progreso);
  const presionado = (etiqueta: string) => estadoAncla(paso, progreso, anclaBoton(etiqueta)).clic;

  /* ── Menú contextual ── */
  if (dlg.tipo === "menu") {
    const items = dlg.items ?? [];
    return (
      <div ref={overlayRef} className="absolute inset-0 z-30" aria-hidden>
        <div
          ref={menuRef}
          key={`${paso.id}-menu`}
          data-ancla="dlg.caja.menu"
          className={`absolute left-6 top-6 min-w-[170px] max-w-[240px] py-1 text-[11px] select-none animate-scale-pulse ${clasico ? `bg-[#ece9d8] ${BISEL_ALTO} shadow-[2px_2px_0_rgba(0,0,0,0.35)]` : "bg-white rounded-md border border-slate-200 shadow-lg"}`}
          style={{ fontFamily: clasico ? FUENTE_CLASICA : undefined }}
        >
          {items.map((it, i) => {
            const pres = presionado(it);
            return (
              <div key={`${it}-${i}`}>
                {i > 0 && (
                  <div
                    className={`my-[3px] mx-1 border-t ${clasico ? "border-slate-400 border-b border-b-white" : "border-slate-100"}`}
                  />
                )}
                <div
                  data-ancla={anclaBoton(it)}
                  className={`h-[22px] px-2.5 flex items-center whitespace-nowrap truncate ${pres ? (clasico ? "bg-[#0a246a] text-white" : "text-white") : "text-slate-800"}`}
                  style={pres && !clasico ? { backgroundColor: color } : undefined}
                >
                  {it}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Cabecera por tipo ── */
  const Icono = dlg.tipo === "error" ? TriangleAlert : dlg.tipo === "confirmar" ? CircleHelp : Info;
  const colorIcono =
    dlg.tipo === "error"
      ? "#dc2626"
      : dlg.tipo === "confirmar" || dlg.tipo === "info" || dlg.tipo === "progreso"
        ? "#2563eb"
        : color;
  const cuerpo = dlg.cuerpo?.replace(/\{cuenta\}/g, String(Math.ceil(30 * (1 - pa))));
  const botones =
    dlg.botones ??
    (dlg.tipo === "error" || dlg.tipo === "info"
      ? ["Aceptar"]
      : dlg.tipo === "progreso"
        ? []
        : ["Aceptar", "Cancelar"]);
  const anclaCampo = dlg.campo ? `dlg.campo.${slugAncla(dlg.campo)}` : undefined;
  const eCampo = anclaCampo ? estadoAncla(paso, progreso, anclaCampo) : undefined;

  let contenido: ReactNode;
  if (dlg.tipo === "progreso") {
    const items = dlg.items?.length ? dlg.items : [dlg.titulo];
    contenido = (
      <div className="space-y-1.5 min-w-[260px]">
        {items.map((it, i) => (
          <div key={`${it}-${i}`} className="space-y-0.5">
            <div className="flex items-center justify-between gap-2 text-[10.5px]">
              <span className="truncate text-slate-700 flex items-center gap-1">
                {pa < 1 ? (
                  <Spinner className="w-3 h-3" color={color} />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                )}
                {it}
              </span>
              <span className="font-mono text-slate-500 tabular-nums">{Math.round(pa * 100)} %</span>
            </div>
            <BarraProgreso valor={pa} color={color} alto={clasico ? 10 : 5} />
          </div>
        ))}
      </div>
    );
  } else {
    contenido = (
      <div className="space-y-2">
        {cuerpo && <p className="text-[11px] text-slate-700 whitespace-pre-line leading-snug">{cuerpo}</p>}
        {dlg.items?.length ? (
          <ul className="text-[10.5px] text-slate-600 list-disc pl-4 space-y-0.5">
            {dlg.items.map((it, i) => (
              <li key={`${it}-${i}`}>{it}</li>
            ))}
          </ul>
        ) : null}
        {anclaCampo && eCampo && (
          <CampoTecleado
            etiqueta={dlg.campo}
            valor={valorCampo(paso, anclaCampo)}
            ancla={anclaCampo}
            tecleo={eCampo.tecleo}
            foco={eCampo.foco}
            pegado={eCampo.pegado}
            resaltado={eCampo.resaltado}
            mascara={eCampo.mascara}
            visible={eCampo.tecleo !== undefined || eCampo.pegado}
            mono={false}
            clasico={clasico}
          />
        )}
      </div>
    );
  }

  const caja = clasico
    ? `bg-[#ece9d8] ${BISEL_ALTO} shadow-[3px_3px_0_rgba(0,0,0,0.35)]`
    : "bg-white rounded-lg shadow-xl border border-slate-200";

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 bg-slate-900/25 z-30 flex items-center justify-center p-2"
      aria-hidden
    >
      <div
        key={`${paso.id}-${dlg.tipo}`}
        data-ancla={`dlg.caja.${dlg.tipo}`}
        className={`min-w-[300px] max-w-[420px] max-h-full overflow-hidden flex flex-col animate-slide-in-up ${caja}`}
        style={{ fontFamily: clasico ? FUENTE_CLASICA : undefined }}
      >
        {/* Barra de título */}
        {clasico ? (
          <div
            className="h-[18px] shrink-0 flex items-center justify-between px-1.5 text-white text-[11px] font-bold"
            style={{ background: "linear-gradient(90deg, #0a246a, #a6caf0)" }}
          >
            <span className="truncate">{dlg.titulo}</span>
            <span
              className={`w-[14px] h-[14px] inline-flex items-center justify-center bg-[#ece9d8] text-black ${BISEL_ALTO}`}
            >
              <X className="w-2.5 h-2.5" />
            </span>
          </div>
        ) : (
          <div className="h-[28px] shrink-0 flex items-center justify-between px-3 border-b border-slate-100">
            <span className="text-[11.5px] font-semibold text-slate-800 truncate">{dlg.titulo}</span>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </div>
        )}

        {/* Cuerpo */}
        <div className="flex-1 min-h-0 overflow-hidden px-3 py-2.5 flex items-start gap-2.5">
          {dlg.tipo !== "progreso" && <Icono className="w-6 h-6 shrink-0 mt-0.5" style={{ color: colorIcono }} />}
          <div className="min-w-0 flex-1 space-y-1.5">
            {dlg.regla && <ChipRegla codigo={dlg.regla} />}
            {contenido}
          </div>
        </div>

        {/* Botones */}
        {botones.length > 0 && (
          <div
            className={`shrink-0 flex items-center justify-end gap-2 px-3 py-2 ${clasico ? "" : "bg-slate-50 border-t border-slate-100"}`}
          >
            {botones.map((b, i) => (
              <BotonDialogo
                key={b}
                etiqueta={b}
                primario={i === 0}
                presionado={presionado(b)}
                clasico={clasico}
                color={dlg.tipo === "error" && i === 0 ? "#dc2626" : color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(DialogoSistema);
