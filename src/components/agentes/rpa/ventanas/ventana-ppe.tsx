"use client";

import { memo, type ReactNode } from "react";
import { Ban, Lock, LockOpen } from "lucide-react";
import type { Caso, PasoPlan } from "@/types/agentes";
import { AGENTES_MAP } from "@/data/agentes-data";
import { fechaCorta, formatPeso } from "@/data/agentes-util";
import { estadoAncla, progresoEfectivo, teclaActiva, type EstadoAncla } from "@/components/agentes/guion";
import { horaCorta } from "@/components/agentes/helpers";
import { CampoTecleado, ChipRegla } from "@/components/agentes/ui";
import {
  A,
  T_D2,
  bloqueoId,
  idOperacionVista,
  marcaTarjeta,
  operacionDe,
  referenciaOperacion,
  type Operacion,
} from "@/data/guiones/ppe-datos";
import VentanaSistema from "../ventana-sistema";
import type { PropsVentana } from "../tipos";
import { ToastEntrega } from "./comun";

/* ═══════════════ Estilo de formulario clásico (ERP de escritorio) ═══════════════ */
const BISEL_BAJO = "border border-t-slate-500 border-l-slate-500 border-b-white border-r-white";
const BISEL_ALTO = "border border-t-white border-l-white border-b-slate-500 border-r-slate-500";
const PANEL = `bg-white ${BISEL_BAJO}`;
const TH = "bg-[#d4d0c8] border border-slate-400 px-1 h-4 text-left font-normal text-[10.5px] whitespace-nowrap";
const TD = "border border-slate-200 px-1 h-[17px] whitespace-nowrap overflow-hidden text-ellipsis";
const ETIQUETA = "w-[88px] shrink-0 text-[10.5px] truncate";

const TONO_INSIGNIA = {
  ambar: "bg-amber-100 text-amber-900 border-amber-400",
  verde: "bg-emerald-100 text-emerald-900 border-emerald-500",
  rojo: "bg-red-100 text-[#a3122a] border-red-400",
} as const;
const COLOR_TONO = { ambar: "#d97706", verde: "#059669", rojo: "#E31837" } as const;
type Tono = keyof typeof TONO_INSIGNIA;

const tonoEstado = (estado: string): Tono => (estado.startsWith("Operativa") ? "verde" : "ambar");

/* ═══════════════ Piezas ═══════════════ */
function Cuerpo({ titulo, detalle, children }: { titulo: string; detalle?: ReactNode; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col text-[11px] text-black">
      <div className="h-[16px] shrink-0 px-2 flex items-center gap-1 leading-none font-bold border-b border-slate-400 bg-[#ece9d8] whitespace-nowrap overflow-hidden">
        <span className="truncate">{titulo}</span>
        {detalle && <span className="font-normal text-slate-600 truncate">{detalle}</span>}
      </div>
      <div className="flex-1 min-h-0 flex gap-1 p-1 overflow-hidden">{children}</div>
    </div>
  );
}

function Insignia({ tono, children }: { tono: Tono; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center h-[15px] px-1.5 border text-[10.5px] font-semibold leading-none whitespace-nowrap ${TONO_INSIGNIA[tono]}`}
    >
      {children}
    </span>
  );
}

/** Etiqueta a la izquierda + campo clásico que el agente teclea o pega. */
function CampoFila({
  etiqueta,
  ancla,
  valor,
  e,
  visible,
  mono = true,
}: {
  etiqueta: string;
  ancla: string;
  valor: string;
  e: EstadoAncla;
  visible: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className={ETIQUETA}>{etiqueta}</span>
      <CampoTecleado
        ancla={ancla}
        valor={valor}
        tecleo={e.tecleo}
        foco={e.foco}
        pegado={e.pegado}
        resaltado={e.resaltado}
        mascara={e.mascara}
        visible={visible}
        mono={mono}
        clasico
        className="flex-1"
      />
    </div>
  );
}

/** Campo de solo lectura (lo rellena el sistema). */
function CampoLectura({
  etiqueta,
  ancla,
  resaltado = false,
  ancho = ETIQUETA,
  alto = "h-5",
  children,
}: {
  etiqueta: string;
  ancla?: string;
  resaltado?: boolean;
  ancho?: string;
  alto?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className={ancho}>{etiqueta}</span>
      <div
        data-ancla={ancla}
        className={`flex-1 min-w-0 ${alto} flex items-center gap-1.5 px-1.5 text-[11.5px] overflow-hidden ${BISEL_BAJO} ${resaltado ? "bg-amber-100" : "bg-[#f4f4f0]"}`}
      >
        {children}
      </div>
    </div>
  );
}

/** Lista desplegable de PPE: el valor aparece cuando el agente hace clic en ella. */
function Combo({
  etiqueta,
  ancla,
  valor,
  visible,
  foco,
}: {
  etiqueta: string;
  ancla: string;
  valor: string;
  visible: boolean;
  foco: boolean;
}) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className={ETIQUETA}>{etiqueta}</span>
      <div
        data-ancla={ancla}
        className={`flex-1 min-w-0 h-5 flex items-center bg-white ${foco ? "border border-dotted border-black" : BISEL_BAJO}`}
      >
        <span className="flex-1 min-w-0 truncate px-1.5 text-[11.5px] text-slate-800">
          {visible ? valor : <span className="text-slate-400">Seleccione…</span>}
        </span>
        <span className={`h-full w-4 shrink-0 flex items-center justify-center text-[7px] bg-[#ece9d8] ${BISEL_ALTO}`}>
          ▼
        </span>
      </div>
    </div>
  );
}

function Boton({
  ancla,
  texto,
  presionado = false,
  primario = false,
}: {
  ancla: string;
  texto: string;
  presionado?: boolean;
  primario?: boolean;
}) {
  return (
    <span
      data-ancla={ancla}
      className={`h-5 px-2.5 inline-flex items-center justify-center text-[10.5px] bg-[#ece9d8] select-none whitespace-nowrap ${presionado ? `${BISEL_BAJO} translate-y-[1px]` : BISEL_ALTO} ${primario ? "outline outline-1 outline-black -outline-offset-[3px]" : ""}`}
    >
      {texto}
    </span>
  );
}

function FilaResumen({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex gap-1.5 min-w-0 leading-[14px]">
      <span className="w-[54px] shrink-0 text-slate-500">{k}</span>
      <span className={`min-w-0 truncate text-slate-900 ${mono ? "font-mono-jetbrains text-[10px]" : ""}`}>{v}</span>
    </div>
  );
}

/** Hora (epoch ms) de la operación: la del paso hecho o, mientras se ejecuta, la de su cambio al comprobante (t = 0.8). */
function horaOperacion(caso: Caso, op: Operacion, pasoPlan?: PasoPlan): number {
  return caso.pasosHechos[op.id]?.t ?? caso.ultimoEvento + Math.round(0.8 * (pasoPlan?.duracion ?? 0));
}

/* ═══════════════ ppe.consulta · estado de la tarjeta (d2) ═══════════════ */
function VistaConsulta({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d = caso.datos;
  const pasoD2 = paso?.id === "d2" ? paso : undefined;
  const pv = pasoD2 ? p : 1;
  const eTarjeta = estadoAncla(pasoD2, pv, A.tarjeta);
  const ePanel = estadoAncla(pasoD2, pv, A.panelBloqueos);
  const consultado = pv >= T_D2.resultado;
  const buscando = !consultado && pv >= T_D2.enter;
  const blq = d.ppe.bloqueoTemporal;
  const tBloqueo = caso.pasosHechos.r5?.t ?? d.alerta.emitidaEn;
  const buscar = teclaActiva(pasoD2, pv) === "F2";
  const dash = <span className="text-slate-400">—</span>;
  const nombre = (v: string, mono = false) => (
    <span className={`truncate ${mono ? "font-mono-jetbrains text-[10.5px]" : ""}`}>{v}</span>
  );

  return (
    <Cuerpo titulo="Consulta de tarjeta" detalle={`— ${d.sesion.usuario}`}>
      {/* Búsqueda */}
      <aside className={`w-[176px] shrink-0 ${PANEL} p-1.5 flex flex-col gap-1.5 overflow-hidden`}>
        <div className="text-[10.5px] text-slate-500 border-b border-dotted border-slate-300 pb-0.5">Búsqueda</div>
        <CampoTecleado
          etiqueta="N.º de tarjeta"
          ancla={A.tarjeta}
          valor={d.tarjeta.mascara}
          tecleo={eTarjeta.tecleo}
          foco={eTarjeta.foco}
          pegado={eTarjeta.pegado}
          resaltado={eTarjeta.resaltado}
          visible={consultado || eTarjeta.tecleo !== undefined || eTarjeta.pegado}
          clasico
        />
        <div className="text-[10px] leading-[13px] text-slate-500">
          Digite la tarjeta y presione Enter.
          <br />
          {consultado ? (
            "1 tarjeta encontrada."
          ) : buscando ? (
            <span className="text-[#0a246a]">Consultando SRV-PPE…</span>
          ) : (
            "Sin resultados."
          )}
        </div>
        <div className="mt-auto flex justify-end">
          <Boton ancla={A.buscar} texto="Buscar (F2)" presionado={buscar} />
        </div>
      </aside>

      {/* Ficha y bloqueos */}
      <section className={`flex-1 min-w-0 ${PANEL} p-1 flex flex-col gap-1 overflow-hidden`}>
        <div className="grid grid-cols-[1.1fr_1fr] gap-x-2 gap-y-[2px]">
          <CampoLectura etiqueta="Tarjeta" ancho="w-[56px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? nombre(d.tarjeta.mascara, true) : dash}
          </CampoLectura>
          <CampoLectura etiqueta="Titular" ancho="w-[50px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? nombre(d.cliente.nombre) : dash}
          </CampoLectura>
          <CampoLectura etiqueta="Franquicia" ancho="w-[56px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? nombre(marcaTarjeta(d)) : dash}
          </CampoLectura>
          <CampoLectura etiqueta="Cédula" ancho="w-[50px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? nombre(d.cliente.cedula, true) : dash}
          </CampoLectura>
          <CampoLectura etiqueta="Producto" ancho="w-[56px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? nombre(d.tarjeta.producto) : dash}
          </CampoLectura>
          <CampoLectura etiqueta="Estado" ancho="w-[50px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? (
              <Insignia tono={blq ? "ambar" : "verde"}>{blq ? "Bloqueada · temporal" : "Operativa"}</Insignia>
            ) : (
              dash
            )}
          </CampoLectura>
          <CampoLectura etiqueta="Límite" ancho="w-[56px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? nombre(formatPeso(d.tarjeta.limite), true) : dash}
          </CampoLectura>
          <CampoLectura etiqueta="Desbloq." ancho="w-[50px] shrink-0 text-[10.5px]" alto="h-[18px]">
            {consultado ? nombre(`${d.cliente.desbloqueosLegitimos} legítimos previos`) : dash}
          </CampoLectura>
        </div>

        <div
          data-ancla={A.panelBloqueos}
          className={`${BISEL_BAJO} bg-white ${ePanel.resaltado ? "outline outline-2 outline-amber-400 -outline-offset-2" : ""}`}
        >
          <div className="h-[15px] px-1.5 flex items-center gap-1.5 bg-[#f4f4f0] border-b border-slate-300 text-[10.5px] font-semibold leading-none whitespace-nowrap">
            Bloqueos vigentes
            {consultado && <span className="font-normal text-slate-500">· {blq ? "1 registro" : "ninguno"}</span>}
          </div>
          <table className="w-full table-fixed border-collapse text-[10.5px]">
            <colgroup>
              <col style={{ width: 92 }} />
              <col style={{ width: 118 }} />
              <col />
              <col style={{ width: 66 }} />
            </colgroup>
            <thead>
              <tr>
                <th className={TH}>Bloqueo</th>
                <th className={TH}>Tipo</th>
                <th className={TH}>Motivo</th>
                <th className={TH}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {consultado && blq ? (
                <tr data-ancla={A.filaBloqueo} className="bg-amber-50">
                  <td className={`${TD} font-mono-jetbrains`}>{blq.id}</td>
                  <td className={TD}>Preventivo temporal</td>
                  <td className={TD}>{blq.motivo}</td>
                  <td className={`${TD} font-mono-jetbrains`}>{horaCorta(tBloqueo)}</td>
                </tr>
              ) : (
                <tr data-ancla={A.filaBloqueo}>
                  <td className={`${TD} italic text-slate-500`} colSpan={4}>
                    {consultado
                      ? "Sin bloqueos activos"
                      : buscando
                        ? "Consultando…"
                        : "Digite la tarjeta y presione Enter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Cuerpo>
  );
}

/* ═══════════════ ppe.bloqueo · «Gestión de bloqueo» ═══════════════ */
function VistaBloqueo({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d = caso.datos;
  const id = idOperacionVista(caso, paso);
  const op = id ? operacionDe(id, d, caso.escenario) : undefined;
  const pasoOp = paso && id && paso.id === id ? paso : undefined;
  const pv = pasoOp ? p : 1;
  const est = (ancla: string) => estadoAncla(pasoOp, pv, ancla);
  const eTarjeta = est(A.tarjeta);
  const eRef = est(A.referencia);
  const eBloqueo = est(A.bloqueo);
  const eTipo = est(A.tipo);
  const eMotivo = est(A.motivo);
  const eAplicar = est(A.aplicar);
  const tConsulta = pasoOp?.ui?.find((a) => a.tipo === "resaltar" && a.ancla === A.bloqueo)?.t;
  const consultado = !!op && (!pasoOp || tConsulta === undefined || pv >= tConsulta);
  const alcanzado = (ancla: string) =>
    !!op && (!pasoOp || (pasoOp.ui ?? []).some((a) => a.tipo === "clic" && a.ancla === ancla && a.t <= pv));
  const escrito = (e: EstadoAncla) => !!op && (!pasoOp || e.tecleo !== undefined || e.pegado);
  const aplicando = teclaActiva(pasoOp, pv) === "F9" || eAplicar.clic;
  const agente = op ? AGENTES_MAP[op.agente] : undefined;

  return (
    <Cuerpo titulo="Gestión de bloqueo" detalle={`— ${d.sesion.usuario}`}>
      {/* Formulario */}
      <section className={`flex-1 min-w-0 ${PANEL} p-1.5 flex flex-col gap-[5px] overflow-hidden`}>
        <CampoFila
          etiqueta="Tarjeta"
          ancla={A.tarjeta}
          valor={d.tarjeta.mascara}
          e={eTarjeta}
          visible={escrito(eTarjeta)}
        />
        <CampoLectura etiqueta="Estado actual" ancla={A.bloqueo} resaltado={eBloqueo.resaltado}>
          {consultado && op ? (
            <>
              <Insignia tono={tonoEstado(op.antes)}>{op.antes}</Insignia>
              <span className="min-w-0 truncate font-mono-jetbrains text-[10.5px] text-slate-700">
                {op.bloqueoAntes === "Ninguno" ? "sin bloqueos" : op.bloqueoAntes}
              </span>
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </CampoLectura>
        <Combo
          etiqueta="Tipo de operación"
          ancla={A.tipo}
          valor={op?.tipo ?? ""}
          visible={alcanzado(A.tipo)}
          foco={eTipo.foco}
        />
        <Combo
          etiqueta="Motivo"
          ancla={A.motivo}
          valor={op?.motivo ?? ""}
          visible={alcanzado(A.motivo)}
          foco={eMotivo.foco}
        />
        <CampoFila etiqueta="Referencia" ancla={A.referencia} valor={caso.id} e={eRef} visible={escrito(eRef)} />
        <div className="mt-auto flex items-center justify-end gap-1.5">
          <Boton ancla={A.cancelar} texto="Cancelar (Esc)" />
          <Boton ancla={A.aplicar} texto="Aplicar (F9)" primario presionado={aplicando} />
        </div>
      </section>

      {/* Resumen de la solicitud */}
      <aside className={`w-[196px] shrink-0 ${PANEL} p-1.5 flex flex-col gap-[3px] overflow-hidden text-[10.5px]`}>
        <div className="text-slate-500 border-b border-dotted border-slate-300 pb-0.5 mb-0.5">Solicitud</div>
        <FilaResumen k="Titular" v={d.cliente.nombre} />
        <FilaResumen k="Cédula" v={d.cliente.cedula} mono />
        <FilaResumen k="Tarjeta" v={`${marcaTarjeta(d)} · ${d.tarjeta.producto.replace("Crédito ", "")}`} />
        <FilaResumen k="Alerta" v={caso.id} mono />
        <FilaResumen k="Monto" v={formatPeso(d.transaccion.monto)} mono />
        <FilaResumen k="Solicita" v={agente?.nombre ?? "—"} />
        <div className="mt-auto flex items-center gap-1.5 min-w-0">
          {op ? <ChipRegla codigo={op.regla} /> : null}
          <span className="truncate text-slate-600">{op ? op.motivo.split(" · ")[1] : ""}</span>
        </div>
      </aside>
    </Cuerpo>
  );
}

/* ═══════════════ ppe.confirmacion · comprobante de la operación ═══════════════ */
function VistaConfirmacion({ caso, paso }: { caso: Caso; paso?: PasoPlan }) {
  const d = caso.datos;
  const id = idOperacionVista(caso, paso);
  if (!id) {
    return (
      <Cuerpo titulo="Comprobante de operación" detalle={`— ${d.sesion.usuario}`}>
        <section className={`flex-1 ${PANEL} p-2 text-slate-500 italic`}>
          Sin operaciones registradas para la tarjeta.
        </section>
      </Cuerpo>
    );
  }
  const op = operacionDe(id, d, caso.escenario);
  const pasoPlan = caso.plan.flatMap((e) => e.pasos).find((x) => x.id === id);
  const t = horaOperacion(caso, op, pasoPlan);
  const referencia = referenciaOperacion(id, d);
  const color = COLOR_TONO[op.tono];
  const Icono = op.efecto === "desbloqueo" ? LockOpen : op.efecto === "definitivo" ? Ban : Lock;
  // El bloqueo preventivo (nuevo o mantenido) lleva el id de la alerta; desbloqueo y definitivo citan el que había.
  const bloqueo = op.efecto === "preventivo" ? bloqueoId(d) : op.bloqueoAntes;

  return (
    <Cuerpo titulo="Comprobante de operación" detalle={`— ${d.sesion.usuario}`}>
      <section className={`flex-1 min-w-0 ${PANEL} p-1.5 flex flex-col gap-[4px] overflow-hidden`}>
        <CampoLectura etiqueta="Operación" ancho="w-[74px] shrink-0 text-[10.5px]">
          <span className="truncate font-semibold">{op.tipo}</span>
        </CampoLectura>
        <div className="grid grid-cols-2 gap-x-2 gap-y-[4px]">
          <CampoLectura etiqueta="Referencia" ancla={A.comprobante} ancho="w-[58px] shrink-0 text-[10.5px]">
            <span className="truncate font-mono-jetbrains text-[10.5px] font-bold">{referencia}</span>
          </CampoLectura>
          <CampoLectura etiqueta="Bloqueo" ancho="w-[44px] shrink-0 text-[10.5px]">
            <span className="truncate font-mono-jetbrains text-[10.5px]">{bloqueo === "Ninguno" ? "—" : bloqueo}</span>
          </CampoLectura>
          <CampoLectura etiqueta="Fecha" ancho="w-[58px] shrink-0 text-[10.5px]">
            <span className="truncate font-mono-jetbrains text-[10.5px]">{fechaCorta(t)}</span>
          </CampoLectura>
          <CampoLectura etiqueta="Hora" ancho="w-[44px] shrink-0 text-[10.5px]">
            <span className="truncate font-mono-jetbrains text-[10.5px]">{horaCorta(t)}</span>
          </CampoLectura>
          <CampoLectura etiqueta="Solicitud" ancho="w-[58px] shrink-0 text-[10.5px]">
            <span className="truncate font-mono-jetbrains text-[10.5px]">{caso.id}</span>
          </CampoLectura>
          <CampoLectura etiqueta="Usuario" ancho="w-[44px] shrink-0 text-[10.5px]">
            <span className="truncate font-mono-jetbrains text-[10.5px]">{d.sesion.usuario}</span>
          </CampoLectura>
        </div>
        <CampoLectura etiqueta="Tarjeta" ancho="w-[74px] shrink-0 text-[10.5px]">
          <span className="shrink-0 font-mono-jetbrains text-[10.5px]">{d.tarjeta.mascara}</span>
          <span className="truncate text-slate-600">
            · {marcaTarjeta(d)} · {d.cliente.nombre}
          </span>
        </CampoLectura>
        <div className="mt-auto flex items-center gap-1.5 min-w-0 text-[10.5px] text-slate-600">
          <ChipRegla codigo={op.regla} />
          <span className="truncate">{op.motivo.split(" · ")[1]}</span>
        </div>
      </section>

      <aside
        className={`w-[196px] shrink-0 ${PANEL} p-2 flex flex-col items-center justify-center gap-1 text-center overflow-hidden`}
      >
        <Icono className="w-8 h-8" style={{ color }} strokeWidth={1.75} />
        <div className="text-[9.5px] uppercase tracking-wide text-slate-500">Estado resultante</div>
        <div className="text-[12.5px] font-bold leading-tight" style={{ color }}>
          {op.resultado}
        </div>
        <div className="mt-1 text-[10.5px] leading-[14px] text-slate-600">
          Estado de la alerta
          <br />
          <span className="font-semibold text-slate-900">{pasoPlan?.estado ?? "Sin cambio de estado"}</span>
        </div>
      </aside>
    </Cuerpo>
  );
}

/**
 * Ventana «PPE» (ERP clásico, barra de teclas F): consulta del estado de la tarjeta (d2), formulario
 * «Gestión de bloqueo» de las operaciones (r5, d3_*, d5_*) y comprobante. Todo es función pura de `progreso`,
 * de `caso.datos` y de los pasos ya hechos; nada avanza por sí solo.
 */
function VentanaPPE({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  return (
    <VentanaSistema
      ventana="ppe"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={caso.datos.sesion}
      relojSim={relojSim}
      medir={medir}
    >
      {vista === "ppe.consulta" ? (
        <VistaConsulta caso={caso} paso={paso} p={p} />
      ) : vista === "ppe.confirmacion" ? (
        <VistaConfirmacion caso={caso} paso={paso} />
      ) : (
        <VistaBloqueo caso={caso} paso={paso} p={p} />
      )}
      <ToastEntrega paso={paso} progreso={p} />
    </VentanaSistema>
  );
}

export default memo(VentanaPPE);
