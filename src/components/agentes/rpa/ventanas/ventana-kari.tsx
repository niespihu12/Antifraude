"use client";

import { memo, type ReactNode } from "react";
import { BarChart3, CalendarClock, Check, FileText, MessageSquare, Settings } from "lucide-react";
import type { Caso, PasoPlan } from "@/types/agentes";
import type { PropsVentana } from "../tipos";
import { estadoAncla, progresoEfectivo } from "@/components/agentes/guion";
import { formatDuracion } from "@/components/agentes/helpers";
import { CampoTecleado, ChipRegla } from "@/components/agentes/ui";
import { FRANQUICIA_LABEL } from "@/data/agentes-data";
import { iniciales } from "@/data/agentes-util";
import {
  CIERRE_SEG,
  KARI_ENVIO,
  T_C1,
  T_C6,
  T_RESP,
  TEXTO_RESPUESTA,
  elegirDeterminista,
  estadoEntrega,
  hhmm,
  horaEnvio,
  lineaHSM,
  resumenSLA,
  segmentarMensaje,
  variablesPlantilla,
  type EstadoEntrega,
  type LineaHSM,
  type ResumenSLA,
} from "@/data/guiones/kari-hsm";
import { CROMO } from "../cromo";
import VentanaSistema from "../ventana-sistema";
import { Dato, ToastEntrega } from "./comun";
import { BarraSLA, LineaReintento, Ticks, estadoSLA, formatT } from "./kari-piezas";

/**
 * Kari AI · consola de conversaciones de WhatsApp Business del bot.
 * kari.plantilla (c1): la plantilla HSM aprobada `alerta_transaccional` con sus cinco variables que se rellenan
 * una a una y la vista previa de los tres mensajes reales; termina programando el envío.
 * kari.conversacion (c2, c4, c6): el hilo tal como lo ve el bot (burbujas salientes con su estado de entrega,
 * respuesta del titular y cierre) y el panel de SLA (40 min) y reintento (15 min) en tiempo simulado.
 * Todo lo visible es función pura del progreso del paso y de lo que ya hicieron los pasos previos.
 */

const BASE_URL = "kari.antifraude.corp.local/hsm";
const FONDO_CHAT = "#e6efe2";
const ETIQUETA = "text-[9.5px] uppercase tracking-wider font-semibold text-slate-400";

interface PropsVista {
  caso: Caso;
  paso?: PasoPlan;
  p: number;
}

/* ─── Riel de navegación ─── */
function Riel({ activa }: { activa: "conversaciones" | "plantillas" }) {
  const items = [
    { id: "conversaciones", Icono: MessageSquare, ancla: "kar.tab.conversaciones", titulo: "Conversaciones" },
    { id: "plantillas", Icono: FileText, ancla: "kar.tab.plantillas", titulo: "Plantillas HSM" },
    { id: "reportes", Icono: BarChart3, ancla: "kar.tab.reportes", titulo: "Reportes" },
  ] as const;
  return (
    <div className="w-8 shrink-0 flex flex-col items-center gap-1 py-1.5 bg-emerald-900">
      {items.map(({ id, Icono, ancla, titulo }) => (
        <span
          key={id}
          data-ancla={ancla}
          title={titulo}
          className={`w-6 h-6 rounded-md flex items-center justify-center ${activa === id ? "bg-white/20 text-white" : "text-emerald-200/70"}`}
        >
          <Icono className="w-3.5 h-3.5" />
        </span>
      ))}
      <span className="mt-auto w-6 h-6 rounded-md flex items-center justify-center text-emerald-200/70">
        <Settings className="w-3.5 h-3.5" />
      </span>
    </div>
  );
}

function Chip({ children, clase }: { children: ReactNode; clase: string }) {
  return (
    <span className={`rounded-full px-1.5 py-px text-[9.5px] font-medium whitespace-nowrap leading-tight ${clase}`}>
      {children}
    </span>
  );
}

function BotonKari({
  ancla,
  presionado,
  deshabilitado = false,
  hecho = false,
  children,
}: {
  ancla: string;
  presionado: boolean;
  deshabilitado?: boolean;
  hecho?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      data-ancla={ancla}
      className={`h-[22px] px-2.5 inline-flex items-center gap-1 rounded-md text-[10.5px] font-medium select-none border whitespace-nowrap ${hecho ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "text-white border-transparent bg-emerald-700"} ${presionado ? "shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] translate-y-px brightness-90" : "shadow-sm"} ${deshabilitado && !hecho ? "opacity-60" : ""}`}
    >
      {children}
    </span>
  );
}

/* ═══════════ kari.plantilla ═══════════ */

function VistaPlantilla({ caso, paso, p }: PropsVista) {
  const d = caso.datos;
  const enC1 = paso?.id === "c1";
  const hechoC1 = !!caso.pasosHechos.c1;
  const vars = variablesPlantilla(d);
  const estadosVar = vars.map((v) => estadoAncla(paso, p, v.ancla));
  const lleno = vars.map((_, i) => (enC1 ? p >= 1 || estadosVar[i].pegado : hechoC1));
  const completas = lleno.filter(Boolean).length;
  const programado = enC1 ? p >= T_C1.programado : hechoC1;
  const atipico = d.transaccion.atipico;
  const eEstado = estadoAncla(paso, p, "kar.chip.estado");
  const ePrioridad = estadoAncla(paso, p, "kar.chip.prioridad");
  const eProgramar = estadoAncla(paso, p, "kar.btn.programar");
  const resaltadaMsg = [1, 2, 3].map((n) => estadoAncla(paso, p, `kar.msg.${n}`).resaltado);

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="h-8 shrink-0 flex items-center gap-2 px-2.5 bg-white border-b border-emerald-100 whitespace-nowrap overflow-hidden">
        <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span className="font-mono-jetbrains text-[11px] font-semibold text-slate-800">{d.hsm.plantilla}</span>
        <span
          data-ancla="kar.chip.estado"
          className={`rounded-full px-2 py-px text-[10px] font-medium bg-emerald-100 text-emerald-700 ${eEstado.resaltado ? "ring-2 ring-amber-400" : ""}`}
        >
          Aprobada
        </span>
        <span className="hidden @min-[640px]:inline text-[10px] text-slate-500">Utilidad · es_CO · versión 3</span>
        <span
          data-ancla="kar.chip.prioridad"
          className={`inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-medium ${atipico ? "bg-red-100 text-[#E31837]" : "bg-slate-100 text-slate-700"} ${ePrioridad.resaltado ? "ring-2 ring-amber-400" : ""}`}
        >
          {atipico ? "Prioridad alta" : "Prioridad normal"}
          {atipico && <ChipRegla codigo="R06" />}
        </span>
        <span className="ml-auto shrink-0">
          <BotonKari ancla="kar.btn.programar" presionado={eProgramar.clic} hecho={programado}>
            {programado ? <Check className="w-3 h-3" /> : <CalendarClock className="w-3 h-3" />}
            {programado ? "Envío programado" : "Programar envío"}
          </BotonKari>
        </span>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Variables */}
        <div className="w-[250px] shrink-0 bg-white border-r border-emerald-100 flex flex-col gap-1.5 p-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className={ETIQUETA}>Variables de la plantilla</span>
            <span className="font-mono-jetbrains text-[10px] text-slate-500 tabular-nums">{completas}/5</span>
          </div>
          {vars.map((v, i) => (
            <div key={v.clave} className="flex items-center gap-1.5">
              <span className="w-[78px] shrink-0 text-[10px] text-slate-600 leading-none whitespace-nowrap">
                <span className="font-mono-jetbrains text-amber-700">{`{{${v.n}}}`}</span> {v.etiqueta}
              </span>
              <CampoTecleado
                ancla={v.ancla}
                valor={v.valor}
                visible={lleno[i]}
                mono={false}
                className="flex-1"
                {...estadosVar[i]}
              />
            </div>
          ))}
          <div className="mt-auto text-[9.5px] text-slate-500 leading-snug">
            Contexto: tarjeta {FRANQUICIA_LABEL[caso.franquicia]} terminada en{" "}
            <span className="font-mono-jetbrains">{d.tarjeta.ultimos4}</span>
          </div>
        </div>

        {/* Vista previa */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ backgroundColor: FONDO_CHAT }}>
          <div className="h-6 shrink-0 flex items-center justify-between gap-2 px-2.5 border-b border-emerald-100/70 bg-white/60 text-[10px] text-slate-600 whitespace-nowrap overflow-hidden">
            <span className={ETIQUETA}>Vista previa</span>
            <span data-ancla="kar.campo.destinatario" className="truncate">
              Para <span className="font-mono-jetbrains text-slate-800">{d.hsm.entregadoA || "—"}</span> ·{" "}
              {d.cliente.nombre}
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden px-2.5 py-1.5 flex flex-col gap-1">
            {d.hsm.mensajes.map((m, i) => (
              <div key={i} className="flex shrink-0">
                <div
                  data-ancla={`kar.msg.${i + 1}`}
                  className={`max-w-[94%] rounded-lg rounded-tl-none bg-white shadow-sm px-2 py-1 text-[9.5px] leading-3 text-slate-800 whitespace-pre-line ${resaltadaMsg[i] ? "ring-2 ring-amber-400" : ""}`}
                >
                  {segmentarMensaje(m, vars).map((s, k) =>
                    s.variable === undefined ? (
                      <span key={k}>{s.texto}</span>
                    ) : lleno[s.variable - 1] ? (
                      <span key={k} className="font-semibold text-emerald-800 bg-emerald-100 rounded-[3px] px-px">
                        {s.texto}
                      </span>
                    ) : (
                      <span
                        key={k}
                        className="font-mono-jetbrains text-[8.5px] text-amber-800 bg-amber-100 border border-amber-300 rounded-[3px] px-[3px]"
                      >{`{{${s.variable}}}`}</span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ kari.conversacion ═══════════ */

function Burbuja({
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
        className={`animate-slide-in-up max-w-[88%] rounded-lg px-2 py-1 shadow-sm text-[9.5px] leading-3 ${sal ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none"} ${resaltada ? "ring-2 ring-amber-400" : ""}`}
      >
        <div className="whitespace-pre-line text-slate-800">{texto}</div>
        <div className="mt-0.5 flex items-center justify-end gap-1 text-[8.5px] leading-none text-slate-500">
          {sal && estado && <span>{estado === "entregado" ? "Entregado" : "Enviado"}</span>}
          <span className="font-mono-jetbrains">{hora}</span>
          {sal && estado && <Ticks estado={estado} />}
        </div>
      </div>
    </div>
  );
}

function Aviso({ ancla, clase, children }: { ancla?: string; clase: string; children: ReactNode }) {
  return (
    <div
      data-ancla={ancla}
      className={`animate-slide-in-up self-center shrink-0 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] ${clase}`}
    >
      {children}
    </div>
  );
}

function Hilo({ caso, paso, p, lin }: PropsVista & { lin: LineaHSM }) {
  const d = caso.datos;
  const h0 = horaEnvio(d);
  const resp = d.hsm.respuesta;
  const respSeg = (d.hsm.respuestaMin ?? 0) * 60;
  const est1 = KARI_ENVIO.c2.aparece.map((a, i) => estadoEntrega(lin.pc.c2, a, KARI_ENVIO.c2.entregado[i]));
  const est2 = KARI_ENVIO.c4.aparece.map((a, i) => estadoEntrega(lin.pc.c4, a, KARI_ENVIO.c4.entregado[i]));
  const hayMensajes = est1[0] !== "oculto";
  const respuestaVisible = resp !== "ninguna" && lin.pc.c3 >= T_RESP.enviar;
  const cierreVisible = resp !== "ninguna" && !!d.hsm.cierre && lin.pc.c3 >= T_RESP.cierre;
  const avisoReintento = lin.pc.c4 > 0;
  const marcaSLA = lin.sinRespuesta && lin.pc.c6 >= T_C6.marcaSLA;
  const res = (ancla: string) => estadoAncla(paso, p, ancla).resaltado;

  return (
    <div
      className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end gap-1 px-2.5 py-1.5 mask-[linear-gradient(to_bottom,transparent,black_14px)]"
      style={{ backgroundColor: FONDO_CHAT }}
    >
      {!hayMensajes && (
        <div className="m-auto text-[10px] italic text-slate-500">
          Sin mensajes · la plantilla se enviará al confirmar
        </div>
      )}
      {hayMensajes && (
        <span className="self-center shrink-0 rounded-full bg-white/80 px-2 py-px text-[9px] text-slate-500 shadow-sm">
          Hoy
        </span>
      )}
      {d.hsm.mensajes.map(
        (m, i) =>
          est1[i] !== "oculto" && (
            <Burbuja
              key={`a${i}`}
              texto={m}
              lado="sal"
              hora={hhmm(h0)}
              estado={est1[i]}
              ancla={`kar.msg.${i + 1}`}
              resaltada={res(`kar.msg.${i + 1}`)}
            />
          ),
      )}
      {respuestaVisible && (
        <Burbuja
          texto={TEXTO_RESPUESTA[resp]}
          lado="ent"
          hora={hhmm(h0 + respSeg * 1000)}
          ancla="kar.msg.respuesta"
          resaltada={res("kar.msg.respuesta")}
        />
      )}
      {cierreVisible && d.hsm.cierre && (
        <Burbuja
          texto={d.hsm.cierre}
          lado="sal"
          hora={hhmm(h0 + (respSeg + CIERRE_SEG) * 1000)}
          estado="entregado"
          ancla="kar.msg.cierre"
        />
      )}
      {avisoReintento && (
        <Aviso clase="bg-amber-50 border-amber-200 text-amber-800">
          Sin respuesta a los {d.hsm.reintentoMin} min · reintento <ChipRegla codigo="R10" />
        </Aviso>
      )}
      {avisoReintento &&
        d.hsm.mensajes.map(
          (m, i) =>
            est2[i] !== "oculto" && (
              <Burbuja
                key={`b${i}`}
                texto={m}
                lado="sal"
                hora={hhmm(h0 + d.hsm.reintentoMin * 60_000)}
                estado={est2[i]}
                ancla={`kar.msg.${i + 4}`}
                resaltada={res(`kar.msg.${i + 4}`)}
              />
            ),
        )}
      {marcaSLA && (
        <Aviso
          ancla="kar.msg.sla"
          clase={`bg-red-50 border-red-200 text-[#E31837] ${res("kar.msg.sla") ? "ring-2 ring-amber-400" : ""}`}
        >
          Sin respuesta · SLA vencido ({d.hsm.slaMin} min) <ChipRegla codigo="R05" />
        </Aviso>
      )}
    </div>
  );
}

function Compositor({ caso, paso, p, lin }: PropsVista & { lin: LineaHSM }) {
  const d = caso.datos;
  const enC2 = paso?.id === "c2";
  const enC4 = paso?.id === "c4";
  const eEnviar = estadoAncla(paso, p, "kar.btn.enviar");
  const eReenviar = estadoAncla(paso, p, "kar.btn.reenviar");
  const fase2 = lin.pc.c2 < 0.12 ? "listo" : lin.pc.c2 < KARI_ENVIO.c2.entregado[2] ? "enviando" : "entregado";
  const fase4 = lin.pc.c4 < 0.31 ? "listo" : lin.pc.c4 < KARI_ENVIO.c4.entregado[2] ? "enviando" : "entregado";
  return (
    <div className="h-8 shrink-0 flex items-center gap-2 px-2.5 bg-white border-t border-emerald-100 whitespace-nowrap overflow-hidden">
      {enC2 || enC4 ? (
        <>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-px text-[10px] text-emerald-800">
            <FileText className="w-3 h-3" />
            Plantilla <span className="font-mono-jetbrains">{d.hsm.plantilla}</span>
          </span>
          {enC4 && <ChipRegla codigo="R10" />}
          <span className="ml-auto shrink-0">
            {enC2 ? (
              <BotonKari
                ancla="kar.btn.enviar"
                presionado={eEnviar.clic}
                deshabilitado={fase2 !== "listo"}
                hecho={fase2 === "entregado"}
              >
                {fase2 === "listo" ? "Enviar ahora" : fase2 === "enviando" ? "Enviando…" : "Entregado ✓✓"}
              </BotonKari>
            ) : (
              <BotonKari
                ancla="kar.btn.reenviar"
                presionado={eReenviar.clic}
                deshabilitado={fase4 !== "listo"}
                hecho={fase4 === "entregado"}
              >
                {fase4 === "listo" ? "Reenviar plantilla" : fase4 === "enviando" ? "Reenviando…" : "Entregado ✓✓"}
              </BotonKari>
            )}
          </span>
        </>
      ) : (
        <span className="flex-1 min-w-0 truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-400">
          Envío manual deshabilitado · conversación gestionada por el bot
        </span>
      )}
    </div>
  );
}

function PanelCaso({ caso, paso, p, lin, r }: PropsVista & { lin: LineaHSM; r: ResumenSLA }) {
  const d = caso.datos;
  const sla = estadoSLA(r, d.hsm.respuestaMin);
  const eReintento = estadoAncla(paso, p, "kar.card.reintento");
  const eRegistrar = estadoAncla(paso, p, "kar.btn.registrar");
  const enC6 = paso?.id === "c6";
  const registrado = lin.pc.c6 >= T_C6.registrado;
  const textoResp = d.hsm.respuesta === "ninguna" ? null : TEXTO_RESPUESTA[d.hsm.respuesta];
  const valorResp = r.respondio && textoResp ? `«${textoResp}»` : r.vencido ? "Sin respuesta" : "Pendiente";
  const colorResp = r.respondio
    ? d.hsm.respuesta === "si"
      ? "text-emerald-700"
      : "text-[#E31837]"
    : r.vencido
      ? "text-amber-700"
      : "text-slate-500";
  const alta = d.alerta.prioridad === "Alta";

  return (
    <div className="w-[170px] shrink-0 bg-white border-l border-emerald-100 flex flex-col gap-1.5 p-2 overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-1">
          <span className={ETIQUETA}>Alerta</span>
          <span className="flex items-center gap-1">
            <Chip clase={alta ? "bg-red-100 text-[#E31837]" : "bg-slate-100 text-slate-700"}>{d.alerta.prioridad}</Chip>
            {d.transaccion.atipico && <ChipRegla codigo="R06" />}
          </span>
        </div>
        <div className="mt-0.5 space-y-px text-[10px]">
          <Dato k="ID" v={caso.id} mono />
          <Dato k="Tarjeta" v={`${FRANQUICIA_LABEL[caso.franquicia]} ····${d.tarjeta.ultimos4}`} />
        </div>
      </div>

      <div data-ancla="kar.card.sla" className="rounded-md border border-emerald-100 bg-emerald-50/40 p-1.5 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span className={ETIQUETA}>SLA</span>
          <Chip clase={sla.clase}>{sla.texto}</Chip>
        </div>
        <BarraSLA r={r} />
        <div className="flex items-center justify-between text-[10px] leading-tight">
          <span className="font-mono-jetbrains tabular-nums text-slate-800">{formatT(r.seg)}</span>
          <span className="text-slate-500">
            {r.vencido
              ? `vencido a los ${r.slaMin} min`
              : r.respondio
                ? "reloj detenido"
                : `quedan ${formatDuracion((r.slaSeg - r.seg) * 1000)}`}
          </span>
        </div>
        <LineaReintento r={r} ancla="kar.card.reintento" resaltado={eReintento.resaltado} />
      </div>

      <div className="rounded-md border border-emerald-100 p-1.5 space-y-1">
        <div className={ETIQUETA}>Respuesta del titular</div>
        <div className="flex items-center justify-between gap-1">
          <span className={`min-w-0 truncate text-[11px] font-semibold leading-tight ${colorResp}`}>{valorResp}</span>
          {(enC6 || registrado) && (
            <BotonKari ancla="kar.btn.registrar" presionado={eRegistrar.clic} hecho={registrado}>
              {registrado && <Check className="w-3 h-3" />}
              {registrado
                ? d.hsm.respuesta === "ninguna"
                  ? "Registrada"
                  : "Asociada"
                : d.hsm.respuesta === "ninguna"
                  ? "Registrar"
                  : "Asociar"}
            </BotonKari>
          )}
        </div>
      </div>
    </div>
  );
}

const OTROS_CONTACTOS = [
  { nombre: "Laura Gómez", texto: "«Sí fui yo»", min: 9 },
  { nombre: "Mateo Ríos", texto: "Plantilla entregada ✓✓", min: 4 },
  { nombre: "Ana Beltrán", texto: "«No fui yo»", min: 13 },
  { nombre: "Julián Vega", texto: "Plantilla entregada ✓✓", min: 2 },
] as const;

/** Lista de conversaciones: solo cabe cuando el escritorio es ancho (modo teatro). */
function ListaConversaciones({ caso, lin }: { caso: Caso; lin: LineaHSM }) {
  const d = caso.datos;
  const h0 = horaEnvio(d);
  const resp = d.hsm.respuesta;
  const actual =
    resp !== "ninguna" && lin.pc.c3 >= T_RESP.enviar
      ? `«${TEXTO_RESPUESTA[resp]}»`
      : lin.pc.c2 >= KARI_ENVIO.c2.entregado[2]
        ? "Plantilla entregada ✓✓"
        : "Plantilla en cola";
  const filas = [
    { nombre: d.cliente.nombre, texto: actual, hora: hhmm(h0), activa: true },
    ...elegirDeterminista(caso.id, OTROS_CONTACTOS, 2).map((o) => ({
      nombre: o.nombre,
      texto: o.texto,
      hora: hhmm(h0 - o.min * 60_000),
      activa: false,
    })),
  ];
  return (
    <div className="hidden @min-[860px]:flex w-44 shrink-0 flex-col bg-white border-r border-emerald-100">
      <div className="h-8 shrink-0 flex items-center px-2.5 border-b border-emerald-100">
        <span className={ETIQUETA}>Conversaciones</span>
      </div>
      {filas.map((f) => (
        <div
          key={f.nombre}
          className={`h-10 shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-100 ${f.activa ? "bg-emerald-50" : ""}`}
        >
          <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-600/80 text-white text-[9px] font-semibold flex items-center justify-center">
            {iniciales(f.nombre)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-[10.5px] font-medium text-slate-800">{f.nombre}</span>
              <span className="shrink-0 font-mono-jetbrains text-[9px] text-slate-400">{f.hora}</span>
            </div>
            <div className="truncate text-[9.5px] text-slate-500">{f.texto}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VistaConversacion({ caso, paso, p }: PropsVista) {
  const d = caso.datos;
  const lin = lineaHSM(caso, paso, p);
  const r = resumenSLA(d, lin);
  return (
    <>
      <ListaConversaciones caso={caso} lin={lin} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-8 shrink-0 flex items-center gap-2 px-2.5 bg-white border-b border-emerald-100 whitespace-nowrap overflow-hidden">
          <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-600 text-white text-[9px] font-semibold flex items-center justify-center">
            {iniciales(d.cliente.nombre)}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[11px] font-semibold text-slate-800">{d.cliente.nombre}</div>
            <div className="truncate font-mono-jetbrains text-[9.5px] text-slate-500">{d.hsm.entregadoA || "—"}</div>
          </div>
          <span className="ml-auto hidden @min-[520px]:inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-px text-[9.5px] text-emerald-800">
            <MessageSquare className="w-3 h-3" />
            WhatsApp Business
          </span>
        </div>
        <Hilo caso={caso} paso={paso} p={p} lin={lin} />
        <Compositor caso={caso} paso={paso} p={p} lin={lin} />
      </div>
      <PanelCaso caso={caso} paso={paso} p={p} lin={lin} r={r} />
    </>
  );
}

/* ═══════════ Ventana ═══════════ */

function VentanaKari({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const esPlantilla = vista === "kari.plantilla";
  return (
    <VentanaSistema
      ventana="kari"
      titulo={esPlantilla ? "Kari AI · Plantillas HSM" : undefined}
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={caso.datos.sesion}
      relojSim={relojSim}
      medir={medir}
      url={esPlantilla ? `${BASE_URL}/plantillas/${caso.datos.hsm.plantilla}` : `${BASE_URL}/conversaciones/${caso.id}`}
    >
      <div className="@container absolute inset-0 flex overflow-hidden" style={{ backgroundColor: CROMO.kari.fondo }}>
        <Riel activa={esPlantilla ? "plantillas" : "conversaciones"} />
        {esPlantilla ? (
          <VistaPlantilla caso={caso} paso={paso} p={p} />
        ) : (
          <VistaConversacion caso={caso} paso={paso} p={p} />
        )}
        <ToastEntrega paso={paso} progreso={p} />
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaKari);
