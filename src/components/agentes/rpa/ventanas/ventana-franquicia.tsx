"use client";

import { memo, useMemo, type ReactNode } from "react";
import { BellRing, Check, Inbox } from "lucide-react";
import type { PropsVentana } from "../tipos";
import { estadoAncla, progresoEfectivo } from "@/components/agentes/guion";
import { CampoTecleado } from "@/components/agentes/ui";
import { formatPeso } from "@/data/agentes-util";
import { T, avancePaso, bandejaFranquicia, conteosBandeja, filaActual, horaReloj } from "@/data/guiones/monitor-datos";
import type { FilaAlerta } from "@/data/guiones/monitor-datos";
import VentanaSistema from "../ventana-sistema";
import { ToastEntrega } from "./comun";
import { BotonWeb, InsigniaEstado, InsigniaPrioridad, Tarjeta } from "./monitor-piezas";

/** Las dos pieles de la misma pantalla: VRM (Visa, azul) y EMS/MS (Mastercard, granate). Sin logos. */
const PIELES = {
  vrm: {
    prefijo: "vrm",
    sistema: "VRM",
    franquicia: "Visa",
    color: "#1d4ed8",
    borde: "border-blue-200",
    selBorde: "border-l-blue-600",
    cabecera: "bg-blue-50 text-blue-800",
    titulo: "Bandeja de alertas de fraude · Visa",
    pestanas: ["Nuevas", "Reconocidas", "Histórico"],
  },
  ems: {
    prefijo: "ems",
    sistema: "EMS/MS",
    franquicia: "Mastercard",
    color: "#b91c1c",
    borde: "border-red-200",
    selBorde: "border-l-red-700",
    cabecera: "bg-red-50 text-red-800",
    titulo: "Bandeja de casos de fraude · Mastercard",
    pestanas: ["Bandeja", "Casos abiertos", "Archivo"],
  },
} as const;

const COLUMNAS = "grid grid-cols-[8px_92px_44px_minmax(56px,1fr)_64px] gap-x-1 items-center px-1.5";

function FilaBandeja({
  fila,
  ancla,
  seleccionada = false,
  resaltada = false,
  entra = false,
  selBorde,
}: {
  fila: FilaAlerta;
  ancla?: string;
  seleccionada?: boolean;
  resaltada?: boolean;
  entra?: boolean;
  selBorde: string;
}) {
  return (
    <div
      data-ancla={ancla}
      className={`${COLUMNAS} h-[16px] text-[10px] border-b border-slate-100 border-l-2 ${entra ? "animate-slide-in-up" : ""} ${resaltada ? "bg-amber-100" : seleccionada ? "bg-slate-100" : "bg-white"} ${seleccionada ? selBorde : "border-l-transparent"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${fila.prioridad === "Alta" ? "bg-[#E31837]" : "bg-slate-300"}`} />
      <span className="font-mono-jetbrains truncate text-slate-800">{fila.referencia}</span>
      <span className="font-mono-jetbrains text-slate-600">····{fila.ultimos4}</span>
      <span className="font-mono-jetbrains text-right tabular-nums text-slate-700">{formatPeso(fila.monto)}</span>
      <span className="flex">
        <InsigniaEstado estado={fila.estado} className="!h-[13px] !text-[9px]" />
      </span>
    </div>
  );
}

function Linea({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="h-[15px] flex items-center gap-1.5 min-w-0 text-[10px]">
      <span className="w-[54px] shrink-0 text-slate-400">{k}</span>
      <span className="min-w-0 truncate text-slate-800">{children}</span>
    </div>
  );
}

/**
 * VRM (Visa) y EMS/MS (Mastercard) · bandeja de alertas de la franquicia (r1): la alerta entrante
 * se selecciona, se leen sus datos y el agente la reconoce (acuse de recibo).
 */
function VentanaFranquicia({
  ventana,
  caso,
  vista,
  paso,
  progreso,
  velocidad,
  actor,
  medir,
  relojSim,
}: PropsVentana & { ventana: "vrm" | "ems" }) {
  const piel = PIELES[ventana];
  const ns = piel.prefijo;
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const previas = useMemo(() => bandejaFranquicia(caso.id, d, 5), [caso.id, d]);
  const cuentas = useMemo(() => conteosBandeja(caso.id), [caso.id]);

  const pR1 = avancePaso(caso, paso, p, "r1");
  const presente = pR1 >= T.fr.aparece;
  const seleccionada = pR1 >= T.fr.selecciona;
  const reconocida = pR1 >= T.fr.reconocida;

  const eFila = estadoAncla(paso, p, `${ns}.fila.alerta`);
  const eRef = estadoAncla(paso, p, `${ns}.campo.referencia`);
  const eBoton = estadoAncla(paso, p, `${ns}.btn.reconocer`);
  const actual = filaActual(d, reconocida ? "Reconocida" : "Nueva");
  const nuevas = Math.max(0, cuentas.nuevas - (reconocida ? 1 : 0));
  const reconocidas = cuentas.reconocidas + (reconocida ? 1 : 0);

  return (
    <VentanaSistema
      ventana={ventana}
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
      color={piel.color}
    >
      <div className="absolute inset-0 flex flex-col gap-1.5 p-1.5 overflow-hidden text-[10.5px]">
        {/* Cabecera del sistema */}
        <div
          className={`h-[22px] shrink-0 flex items-center gap-2 px-2 rounded border ${piel.borde} ${piel.cabecera} whitespace-nowrap overflow-hidden`}
        >
          <Inbox className="w-3 h-3 shrink-0" />
          <span className="text-[11px] font-semibold truncate">{piel.titulo}</span>
          <span className="flex items-center gap-2 ml-2">
            {piel.pestanas.map((t, i) => (
              <span
                key={t}
                className={`text-[10px] ${i === 0 ? "font-semibold underline underline-offset-4" : "opacity-60"}`}
              >
                {t}
              </span>
            ))}
          </span>
          <span className="ml-auto text-[10px] shrink-0">
            Nuevas <b className="font-mono-jetbrains">{nuevas}</b> · Reconocidas hoy{" "}
            <b className="font-mono-jetbrains">{reconocidas}</b>
          </span>
        </div>

        <div className="flex-1 min-h-0 flex gap-1.5">
          {/* Bandeja */}
          <Tarjeta
            className="flex-1 min-w-0"
            borde={piel.borde}
            titulo={`Alertas de ${piel.franquicia}`}
            derecha={`${previas.length + 1} listadas`}
          >
            <div
              className={`${COLUMNAS} h-[15px] text-[9px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-50 border-b border-slate-100`}
            >
              <span />
              <span>Referencia</span>
              <span>Tarj.</span>
              <span className="text-right">Monto</span>
              <span>Estado</span>
            </div>
            {presente && (
              <FilaBandeja
                fila={actual}
                ancla={`${ns}.fila.alerta`}
                seleccionada={seleccionada}
                resaltada={eFila.resaltado}
                entra={paso?.id === "r1"}
                selBorde={piel.selBorde}
              />
            )}
            {previas.map((f) => (
              <FilaBandeja key={f.referencia} fila={f} selBorde={piel.selBorde} />
            ))}
          </Tarjeta>

          {/* Detalle de la alerta seleccionada */}
          <Tarjeta className="w-[236px] shrink-0" borde={piel.borde} titulo="Detalle de la alerta">
            {seleccionada ? (
              <div key="detalle" className="animate-slide-in-up px-2 py-1 flex flex-col gap-[1px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-[54px] shrink-0 text-[10px] text-slate-400">Referencia</span>
                  <CampoTecleado
                    className="flex-1"
                    ancla={`${ns}.campo.referencia`}
                    valor={d.alerta.referencia}
                    foco={eRef.foco}
                    resaltado={eRef.resaltado}
                  />
                </div>
                <Linea k="Tarjeta">
                  <span className="font-mono-jetbrains">{d.tarjeta.mascara}</span>
                </Linea>
                <Linea k="Monto">
                  <span className="font-mono-jetbrains">{formatPeso(d.transaccion.monto)}</span>
                </Linea>
                <Linea k="Comercio">{d.transaccion.comercio}</Linea>
                <Linea k="Motivo">{d.alerta.motivo}</Linea>
                <Linea k="Prioridad">
                  <InsigniaPrioridad prioridad={d.alerta.prioridad} />
                </Linea>
                <div className="flex items-center gap-2 pt-1 whitespace-nowrap">
                  <BotonWeb
                    ancla={`${ns}.btn.reconocer`}
                    texto="Reconocer"
                    color={piel.color}
                    presionado={eBoton.clic}
                    deshabilitado={reconocida}
                    icono={<BellRing className="w-3 h-3" />}
                  />
                  {reconocida ? (
                    <span className="min-w-0 truncate text-[9.5px] text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 shrink-0" strokeWidth={3} />
                      Acuse {horaReloj(caso.recibidoEn)}
                    </span>
                  ) : (
                    <span className="text-[9.5px] text-slate-400">Sin acuse de recibo</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center px-3 text-center text-[10.5px] text-slate-400 italic">
                Seleccione una alerta de la bandeja para ver el detalle
              </div>
            )}
          </Tarjeta>
        </div>
        <ToastEntrega paso={paso} progreso={p} />
      </div>
    </VentanaSistema>
  );
}

function VentanaVRMBase(props: PropsVentana) {
  return <VentanaFranquicia {...props} ventana="vrm" />;
}

function VentanaEMSBase(props: PropsVentana) {
  return <VentanaFranquicia {...props} ventana="ems" />;
}

export const VentanaVRM = memo(VentanaVRMBase);
export const VentanaEMS = memo(VentanaEMSBase);
