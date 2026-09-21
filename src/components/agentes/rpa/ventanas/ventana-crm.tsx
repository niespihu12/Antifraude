"use client";

import { memo, type ReactNode } from "react";
import { EstadoAlerta } from "@/types";
import { CATEGORIAS_TIPIFICACION, type Caso, type DatosCaso, type PasoPlan } from "@/types/agentes";
import { AGENTES_MAP, FRANQUICIA_LABEL } from "@/data/agentes-data";
import { slugAncla } from "@/data/agentes-util";
import { CLIC, T_G1, T_G1_RECHAZO, T_G2, T_G4, T_I1 } from "@/data/guiones/crm";
import { estadoAncla, progresoEfectivo, teclaActiva, type EstadoAncla } from "@/components/agentes/guion";
import { CampoTecleado, ChipRegla } from "@/components/agentes/ui";
import VentanaSistema from "../ventana-sistema";
import type { PropsVentana } from "../tipos";
import { ToastEntrega } from "./comun";
import { estadoAlertaAntesDe, historialCliente } from "./crm-datos";

/* ═══════════════ Estilo de formulario clásico (ERP de escritorio) ═══════════════ */
const BISEL_BAJO = "border border-t-slate-500 border-l-slate-500 border-b-white border-r-white";
const BISEL_ALTO = "border border-t-white border-l-white border-b-slate-500 border-r-slate-500";
const PANEL = `bg-white ${BISEL_BAJO}`;
const TH = "bg-[#d4d0c8] border border-slate-400 px-1 h-[14px] text-left font-normal text-[10px] whitespace-nowrap";
const TD = "border border-slate-200 px-1 h-[14px] whitespace-nowrap text-[10.5px]";
const SEL = "bg-[#0a246a] text-white";

const ESTADO_VACIO: EstadoAncla = {
  foco: false,
  tecleo: undefined,
  pegado: false,
  resaltado: false,
  clic: false,
  mascara: false,
};

/** Un paso visto desde la ventana: 1 si ya ocurrió, el progreso si está en curso, 0 si aún no empezó. */
interface Fase {
  p: number;
  listo: boolean;
  vivo: boolean;
}

interface Ctx {
  caso: Caso;
  d: DatosCaso;
  paso?: PasoPlan;
  /** Progreso efectivo del paso en curso (0–1). */
  p: number;
  est: (ancla: string) => EstadoAncla;
  fase: (id: string) => Fase;
}

function crearCtx(caso: Caso, paso: PasoPlan | undefined, p: number): Ctx {
  return {
    caso,
    d: caso.datos,
    paso,
    p,
    est: (ancla) => (paso ? estadoAncla(paso, p, ancla) : ESTADO_VACIO),
    fase: (id) => {
      const hecho = !!caso.pasosHechos[id];
      const vivo = !hecho && paso?.id === id;
      return { p: hecho ? 1 : vivo ? p : 0, listo: hecho || (vivo && p >= 1), vivo };
    },
  };
}

/** Un campo ya muestra su valor si el paso terminó, si se está tecleando o si se pegó. */
const visibleCampo = (e: EstadoAncla, listo: boolean) => listo || e.tecleo !== undefined || e.pegado;

const CLASE_ESTADO: Record<EstadoAlerta, string> = {
  [EstadoAlerta.PENDIENTE_REVISION]: "bg-amber-100 text-amber-800 border-amber-300",
  [EstadoAlerta.EN_VERIFICACION_CRM]: "bg-blue-100 text-blue-800 border-blue-300",
  [EstadoAlerta.WHATSAPP_ENVIADO]: "bg-blue-100 text-blue-800 border-blue-300",
  [EstadoAlerta.ESPERANDO_CLIENTE]: "bg-blue-100 text-blue-800 border-blue-300",
  [EstadoAlerta.BLOQUEO_PREVENTIVO]: "bg-orange-100 text-orange-800 border-orange-300",
  [EstadoAlerta.DESBLOQUEADO]: "bg-emerald-100 text-emerald-800 border-emerald-300",
  [EstadoAlerta.BLOQUEO_DEFINITIVO]: "bg-red-100 text-[#E31837] border-red-300",
  [EstadoAlerta.TIPIFICADO]: "bg-slate-100 text-slate-700 border-slate-300",
};

/* ═══════════════ Piezas de la interfaz clásica ═══════════════ */
function Cuerpo({ titulo, usuario, children }: { titulo: string; usuario: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col text-[11px] text-black">
      <div className="h-[18px] shrink-0 px-2 flex items-center gap-1 font-bold border-b border-slate-400 bg-[#ece9d8] whitespace-nowrap overflow-hidden">
        <span className="truncate">{titulo}</span>
        <span className="font-normal text-slate-600">— {usuario}</span>
      </div>
      <div className="flex-1 min-h-0 flex gap-1 p-1">{children}</div>
    </div>
  );
}

function PanelIzq({ children }: { children: ReactNode }) {
  return (
    <aside className={`w-[140px] shrink-0 ${PANEL} p-1.5 flex flex-col gap-1.5 overflow-hidden`}>{children}</aside>
  );
}

function PanelDer({ children }: { children: ReactNode }) {
  return <section className={`flex-1 min-w-0 ${PANEL} flex flex-col overflow-hidden`}>{children}</section>;
}

function CabeceraPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-2 h-[20px] shrink-0 bg-[#f4f4f0] border-b border-slate-300 text-[10.5px] whitespace-nowrap overflow-hidden">
      {children}
    </div>
  );
}

/** Árbol de navegación del módulo (la fila del módulo lleva el ancla crm.menu.*). */
function Nav({ ancla, modulo, hoja }: { ancla: string; modulo: string; hoja: string }) {
  return (
    <div className="text-[10.5px] leading-[14px] select-none">
      <div className="text-slate-500 border-b border-dotted border-slate-300 mb-0.5">Navegador</div>
      <div data-ancla={ancla} className="flex items-center gap-1">
        <span className="text-slate-500">⊟</span>
        <span>{modulo}</span>
      </div>
      <div className={`ml-3 flex items-center gap-1 px-0.5 ${SEL}`}>
        <span>▸</span>
        <span className="truncate">{hoja}</span>
      </div>
    </div>
  );
}

/** Campo de solo lectura (lo rellena el sistema): etiqueta a la izquierda o apilada. */
function Lectura({
  etiqueta,
  valor,
  ancla,
  visible = true,
  resaltado = false,
  mono = true,
  tono,
  apilado = false,
  ancho = "w-[74px]",
}: {
  etiqueta: string;
  valor: ReactNode;
  ancla?: string;
  visible?: boolean;
  resaltado?: boolean;
  mono?: boolean;
  tono?: string;
  apilado?: boolean;
  ancho?: string;
}) {
  const caja = (
    <div
      data-ancla={ancla}
      className={`flex-1 h-5 flex items-center px-1.5 text-[11.5px] min-w-0 ${BISEL_BAJO} ${resaltado ? "bg-amber-100" : "bg-[#f4f4f0]"}`}
    >
      {visible ? (
        <span className={`truncate ${mono ? "font-mono" : ""} ${tono ?? "text-slate-800"}`}>{valor}</span>
      ) : (
        <span className="text-slate-400">—</span>
      )}
    </div>
  );
  if (apilado) {
    return (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10.5px]">{etiqueta}</span>
        {caja}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className={`${ancho} shrink-0 text-[10.5px] truncate`}>{etiqueta}</span>
      {caja}
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
      className={`h-[20px] px-2 inline-flex items-center justify-center text-[10.5px] bg-[#ece9d8] select-none whitespace-nowrap ${presionado ? `${BISEL_BAJO} translate-y-[1px]` : BISEL_ALTO} ${primario ? "outline-1 outline-black -outline-offset-[3px]" : ""}`}
    >
      {texto}
    </span>
  );
}

function ChipEstado({ texto, clase }: { texto: string; clase: string }) {
  return (
    <span className={`inline-flex items-center h-[15px] px-1.5 border text-[10px] font-medium leading-none ${clase}`}>
      {texto}
    </span>
  );
}

/** Columna izquierda de las pantallas de caso: navegador, caso CRM, alerta y datos del titular. */
function PanelCaso({
  c,
  abierto,
  eCaso,
  visibleCaso,
  menu = { ancla: "crm.menu.casos", modulo: "Casos", hoja: "Tipificación" },
}: {
  c: Ctx;
  abierto: boolean;
  eCaso: EstadoAncla;
  visibleCaso: boolean;
  menu?: { ancla: string; modulo: string; hoja: string };
}) {
  const { caso, d } = c;
  return (
    <PanelIzq>
      <Nav ancla={menu.ancla} modulo={menu.modulo} hoja={menu.hoja} />
      <CampoTecleado
        etiqueta="Caso CRM"
        valor={d.registro.casoCrm}
        ancla="crm.campo.caso"
        tecleo={eCaso.tecleo}
        foco={eCaso.foco}
        pegado={eCaso.pegado}
        resaltado={eCaso.resaltado}
        visible={visibleCaso}
        clasico
      />
      <Lectura apilado etiqueta="Alerta" valor={caso.id} ancla="crm.campo.alerta" visible={abierto} />
      <div className="mt-auto text-[10px] leading-tight text-slate-600 border-t border-dotted border-slate-300 pt-1">
        {abierto ? (
          <>
            <div className="truncate text-slate-800">{caso.cliente}</div>
            <div className="font-mono truncate">{d.tarjeta.mascara}</div>
          </>
        ) : (
          <div className="italic">Presione F2 para buscar un caso.</div>
        )}
      </div>
    </PanelIzq>
  );
}

/* ═══════════════ Vistas ═══════════════ */

/* ─── Clientes › Consulta de titular (i1) ─── */
function VistaCliente({ c }: { c: Ctx }) {
  const { caso, d, p } = c;
  const T = T_I1;
  const cli = d.cliente;
  const tarjeta = d.tarjeta;
  const f = c.fase("i1");
  const eCed = c.est("crm.campo.cedula");
  const buscando = f.vivo && p >= T.consulta && p < T.ficha;
  const cargada = f.listo || (f.vivo && p >= T.ficha);
  const hist = historialCliente(caso);
  const nFilas = Math.max(1, hist.filas.length);
  const filaVisible = (i: number) => f.listo || (f.vivo && p >= T.ficha + ((T.histFin - T.ficha) * (i + 1)) / nFilas);
  const celularMalo = d.identificacion.find((x) => x.id === "celular")?.ok === false;
  const sinCelular = cli.celular === null;
  const desactualizado = celularMalo && !sinCelular;
  const estadoAlerta =
    f.listo || (f.vivo && p >= T.fin) ? EstadoAlerta.EN_VERIFICACION_CRM : estadoAlertaAntesDe(caso, "i1");
  const seleccionada = f.listo || (f.vivo && p >= T.clicHist);

  return (
    <>
      <PanelIzq>
        <Nav ancla="crm.menu.clientes" modulo="Clientes" hoja="Consulta de titular" />
        <CampoTecleado
          etiqueta="Cédula de ciudadanía"
          valor={cli.cedula}
          ancla="crm.campo.cedula"
          tecleo={eCed.tecleo}
          foco={eCed.foco}
          pegado={eCed.pegado}
          resaltado={eCed.resaltado}
          visible={visibleCampo(eCed, f.listo)}
          clasico
        />
        <div className="flex justify-end">
          <Boton ancla="crm.btn.buscar" texto="Buscar (F2)" presionado={c.est("crm.btn.buscar").clic} />
        </div>
        <div className="mt-auto text-[10px] leading-tight border-t border-dotted border-slate-300 pt-1 space-y-0.5">
          <div className="text-slate-600">
            Alerta <span className="font-mono text-slate-800">{caso.id}</span>
          </div>
          <ChipEstado texto={estadoAlerta} clase={CLASE_ESTADO[estadoAlerta]} />
        </div>
      </PanelIzq>

      <PanelDer>
        <CabeceraPanel>
          <span className="font-bold truncate">{cargada ? cli.nombre : "Ficha del titular"}</span>
          {cargada && <span className="text-slate-500 shrink-0">· cliente desde {cli.clienteDesde}</span>}
          {cargada && (
            <span className="ml-auto shrink-0">
              <ChipEstado texto="Cliente activo" clase="bg-emerald-100 text-emerald-800 border-emerald-300" />
            </span>
          )}
        </CabeceraPanel>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-x-2 gap-y-[2px] px-1.5 py-0.5">
          <Lectura etiqueta="Cédula" valor={`CC ${cli.cedula}`} visible={cargada} ancho="w-[46px]" />
          <Lectura
            etiqueta="Celular"
            ancla="crm.ficha.celular"
            valor={cli.celular ?? "Sin registrar"}
            visible={cargada}
            mono={!sinCelular}
            resaltado={c.est("crm.ficha.celular").resaltado}
            tono={sinCelular ? "text-[#E31837] font-bold" : undefined}
            ancho="w-[64px]"
          />
          <Lectura etiqueta="Ciudad" valor={cli.ciudad} visible={cargada} mono={false} ancho="w-[46px]" />
          <Lectura
            etiqueta="Últ. actualiz."
            ancla="crm.ficha.actualizacion"
            valor={
              <>
                <span className="font-mono">{cli.fechaActualizacion}</span>
                {desactualizado && " · > 12 meses"}
              </>
            }
            visible={cargada}
            mono={false}
            resaltado={c.est("crm.ficha.actualizacion").resaltado}
            tono={desactualizado ? "text-amber-700 font-bold" : undefined}
            ancho="w-[64px]"
          />
          <div className="col-span-2">
            <Lectura
              etiqueta="Tarjeta"
              ancho="w-[46px]"
              ancla="crm.ficha.tarjeta"
              valor={
                <>
                  {tarjeta.producto} · {FRANQUICIA_LABEL[tarjeta.franquicia]} ·{" "}
                  <span className="font-mono">{tarjeta.mascara}</span>
                </>
              }
              visible={cargada}
              mono={false}
              resaltado={c.est("crm.ficha.tarjeta").resaltado}
            />
          </div>
        </div>
        <div className="px-1.5 pb-0.5">
          <div className="flex items-center gap-2 h-[14px] text-[10.5px] whitespace-nowrap overflow-hidden">
            <span className="font-semibold">Historial de alertas</span>
            {cargada && (
              <span className="text-slate-600">
                · desbloqueos legítimos previos: <b className="font-mono text-slate-900">{hist.total}</b>
              </span>
            )}
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>Fecha</th>
                <th className={TH}>Alerta</th>
                <th className={`${TH} text-right`}>Monto</th>
                <th className={TH}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {!cargada || hist.filas.length === 0 ? (
                <tr data-ancla="crm.fila.hist.0" className={cargada && seleccionada ? SEL : ""}>
                  <td className={`${TD} italic ${cargada && seleccionada ? "" : "text-slate-500"}`} colSpan={4}>
                    {cargada
                      ? "Sin alertas previas en los últimos 12 meses"
                      : buscando
                        ? `Consultando titular… ${d.sesion.servidor}`
                        : "Ingrese la cédula y presione F2 o Enter para consultar al titular."}
                  </td>
                </tr>
              ) : (
                hist.filas.map(
                  (a, i) =>
                    filaVisible(i) && (
                      <tr
                        key={a.id}
                        data-ancla={`crm.fila.hist.${i}`}
                        className={i === 0 && seleccionada ? SEL : i % 2 === 1 ? "bg-[#f5f5f5]" : ""}
                      >
                        <td className={`${TD} font-mono`}>{a.fecha}</td>
                        <td className={`${TD} font-mono`}>{a.id}</td>
                        <td className={`${TD} font-mono text-right`}>{a.monto}</td>
                        <td className={TD}>{a.resultado}</td>
                      </tr>
                    ),
                )
              )}
            </tbody>
          </table>
        </div>
      </PanelDer>
    </>
  );
}

/* ─── Casos › Tipificación y cierre (g1, g2) ─── */
function VistaTipificacion({ c }: { c: Ctx }) {
  const { caso, d, p, paso } = c;
  const reg = d.registro;
  const sinTip = caso.escenario === "sin_tipificar";
  // En «sin_tipificar» el primer intento (g1) es rechazado y la tipificación real ocurre en g2.
  const TT = sinTip ? T_G2 : T_G1;
  const ft = c.fase(sinTip ? "g2" : "g1");
  const f1 = c.fase("g1");
  const eCaso = c.est("crm.campo.caso");
  const eCausa = c.est("crm.campo.causa");
  const abierto = f1.listo || (f1.vivo && p >= (sinTip ? T_G1_RECHAZO.abierto : T_G1.abierto));
  const catSel = ft.listo || (ft.vivo && p >= TT.clicCat + CLIC);
  // El aviso de R11 se queda hasta que el agente selecciona la categoría (g2).
  const rechazado = sinTip && !catSel && (f1.listo || (f1.vivo && p >= T_G1_RECHAZO.dialogo));
  const causaOk = ft.listo || eCausa.pegado;
  const guardado = ft.listo || (ft.vivo && p >= TT.guardado);
  const cerrado = ft.listo || (ft.vivo && p >= TT.cerrado);
  const estadoAlerta = guardado ? EstadoAlerta.TIPIFICADO : estadoAlertaAntesDe(caso, "g1");
  const textoCaso = !abierto ? "—" : cerrado ? "Cerrado" : guardado ? "Tipificado" : "Abierto";
  const claseCaso = !abierto
    ? "bg-slate-100 text-slate-500 border-slate-300"
    : cerrado
      ? "bg-slate-100 text-slate-700 border-slate-300"
      : guardado
        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
        : "bg-blue-100 text-blue-800 border-blue-300";

  return (
    <>
      <PanelCaso c={c} abierto={abierto} eCaso={eCaso} visibleCaso={visibleCampo(eCaso, abierto)} />
      <PanelDer>
        <CabeceraPanel>
          <span className="font-semibold">Cierre del caso</span>
          {abierto && <span className="font-mono">{reg.casoCrm}</span>}
          <span className="ml-auto shrink-0 flex items-center gap-1">
            <span className="text-slate-600">Alerta</span>
            <ChipEstado texto={estadoAlerta} clase={CLASE_ESTADO[estadoAlerta]} />
          </span>
        </CabeceraPanel>
        <div className="flex-1 min-h-0 p-1.5 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-x-3">
            <div className="min-w-0">
              <div className="text-[10.5px] mb-0.5">Categoría de cierre</div>
              <div
                data-ancla="crm.campo.categoria"
                className={`bg-white ${BISEL_BAJO} ${abierto ? "" : "opacity-60"} ${rechazado ? "outline-1 outline-[#E31837] -outline-offset-1" : ""}`}
              >
                {CATEGORIAS_TIPIFICACION.map((cat) => {
                  const sel = catSel && cat === reg.categoria;
                  return (
                    <div
                      key={cat}
                      data-ancla={`crm.fila.categoria.${slugAncla(cat)}`}
                      className={`h-[17px] px-1.5 flex items-center gap-1.5 text-[11px] ${sel ? SEL : ""}`}
                    >
                      <span className="w-2.5 text-center leading-none">{sel ? "◉" : "○"}</span>
                      <span>{cat}</span>
                    </div>
                  );
                })}
              </div>
              {rechazado && (
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#E31837] whitespace-nowrap">
                  <ChipRegla codigo="R11" />
                  <span className="truncate">Tipificación obligatoria</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10.5px] mb-0.5">Causa</div>
              <div
                data-ancla="crm.campo.causa"
                className={`h-[53px] px-1.5 py-1 text-[10.5px] leading-snug overflow-hidden ${BISEL_BAJO} ${eCausa.resaltado ? "bg-amber-100" : "bg-white"} ${eCausa.foco ? "outline-1 outline-dotted outline-black -outline-offset-2" : ""}`}
              >
                {causaOk ? reg.causa : <span className="text-slate-400">—</span>}
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 pt-1 border-t border-dotted border-slate-300">
            <span className="flex items-center gap-1 text-[10.5px]">
              Estado del caso <ChipEstado texto={textoCaso} clase={claseCaso} />
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Boton
                ancla="crm.btn.guardar"
                texto="Guardar (F9)"
                presionado={teclaActiva(paso, p) === "F9"}
                primario={abierto && catSel && !guardado}
              />
              <Boton
                ancla="crm.btn.cerrar"
                texto="Cerrar caso"
                presionado={c.est("crm.btn.cerrar").clic}
                primario={guardado && !cerrado}
              />
            </span>
          </div>
        </div>
      </PanelDer>
    </>
  );
}

/* ─── Clientes › Perfil de riesgo del cliente (g4, R09) ─── */
function VistaPerfil({ c }: { c: Ctx }) {
  const { caso, d, p, paso } = c;
  const cli = d.cliente;
  const f4 = c.fase("g4");
  const bajo = f4.listo || (f4.vivo && p >= T_G4.clicBajo + CLIC);
  const guardado = f4.listo || (f4.vivo && p >= T_G4.guardado);
  const eContador = c.est("crm.ficha.desbloqueos");
  const puntos = Math.min(8, cli.desbloqueosLegitimos);

  return (
    <>
      <PanelCaso
        c={c}
        abierto
        eCaso={ESTADO_VACIO}
        visibleCaso
        menu={{ ancla: "crm.menu.clientes", modulo: "Clientes", hoja: "Perfil de riesgo" }}
      />
      <PanelDer>
        <CabeceraPanel>
          <span className="font-semibold shrink-0">Perfil de riesgo del cliente</span>
          <span className="text-slate-500 truncate">
            · {cli.nombre} · CC {cli.cedula}
          </span>
        </CabeceraPanel>
        <div className="flex-1 min-h-0 p-1.5 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-3">
            <div
              data-ancla="crm.ficha.desbloqueos"
              className={`${BISEL_BAJO} px-2 py-1.5 ${eContador.resaltado ? "bg-amber-100" : "bg-[#f4f4f0]"}`}
            >
              <div className="text-[10.5px]">Desbloqueos legítimos previos</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-[26px] font-bold leading-none text-slate-900">
                  {cli.desbloqueosLegitimos}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-600 whitespace-nowrap">
                  umbral <ChipRegla codigo="R09" /> 3 o más
                </span>
              </div>
              <div className="flex gap-0.5 mt-1.5">
                {Array.from({ length: puntos }, (_, i) => (
                  <span key={i} className="w-2 h-2 bg-[#0a246a]" />
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10.5px] mb-0.5">Perfil de riesgo</div>
              <div className={`bg-white ${BISEL_BAJO}`}>
                <div
                  data-ancla="crm.fila.perfil.estandar"
                  className={`h-[18px] px-1.5 flex items-center gap-1.5 text-[11px] ${bajo ? "" : SEL}`}
                >
                  <span className="w-2.5 text-center leading-none">{bajo ? "○" : "◉"}</span>
                  <span>Riesgo estándar</span>
                </div>
                <div
                  data-ancla="crm.btn.bajo-riesgo"
                  className={`h-[18px] px-1.5 flex items-center gap-1.5 text-[11px] ${bajo ? SEL : ""}`}
                >
                  <span className="w-2.5 text-center leading-none">{bajo ? "◉" : "○"}</span>
                  <span>Bajo riesgo</span>
                </div>
              </div>
              {bajo && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-700 whitespace-nowrap">
                  <span className="truncate">Falso positivo recurrente · perfil marcado</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 pt-1 border-t border-dotted border-slate-300">
            <span className="text-[10.5px] text-slate-600 truncate">
              {guardado ? "Perfil guardado" : "Alerta"} <span className="font-mono text-slate-800">{caso.id}</span>
            </span>
            <span className="ml-auto">
              <Boton
                ancla="crm.btn.guardar"
                texto="Guardar (F9)"
                presionado={teclaActiva(paso, p) === "F9"}
                primario={bajo && !guardado}
              />
            </span>
          </div>
        </div>
      </PanelDer>
    </>
  );
}

/* ═══════════════ Ventana ═══════════════ */
/**
 * Réplica del CRM Banco (ERP de escritorio con barra de teclas F). Decide el contenido por `vista`;
 * lo ya hecho se deriva de `caso.pasosHechos` y lo que ocurre ahora, de `estadoAncla(paso, p, ancla)`.
 * Nada avanza por sí solo: todo es función del progreso del paso.
 */
function VentanaCRM({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const c = crearCtx(caso, paso, p);
  const esCliente = vista === "crm.cliente";
  const esPerfil = !esCliente && paso?.id === "g4";
  const agente = esCliente ? "identificacion" : "registro";
  const titulo = esCliente
    ? "Clientes · Consulta de titular"
    : esPerfil
      ? "Clientes · Perfil de riesgo"
      : "Casos · Tipificación y cierre";

  return (
    <VentanaSistema
      ventana="crm"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={caso.datos.sesion}
      relojSim={relojSim}
      medir={medir}
      color={AGENTES_MAP[agente].color}
    >
      <Cuerpo titulo={titulo} usuario={caso.datos.sesion.usuario}>
        {esCliente ? <VistaCliente c={c} /> : esPerfil ? <VistaPerfil c={c} /> : <VistaTipificacion c={c} />}
      </Cuerpo>
      <ToastEntrega paso={paso} progreso={p} />
    </VentanaSistema>
  );
}

export default memo(VentanaCRM);
