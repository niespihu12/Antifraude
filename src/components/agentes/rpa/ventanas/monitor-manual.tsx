"use client";

import { useMemo } from "react";
import { Check, Headset, PhoneCall } from "lucide-react";
import type { Caso, PasoPlan } from "@/types/agentes";
import { estadoAncla } from "@/components/agentes/guion";
import { Spinner } from "@/components/agentes/ui";
import { formatPeso } from "@/data/agentes-util";
import {
  T,
  avancePaso,
  causaManual,
  contactoAnalista,
  horaGestion,
  manualPrevios,
  nombreCorto,
  textoDecision,
} from "@/data/guiones/monitor-datos";
import { Dato } from "./comun";
import { BotonWeb, ChipRegla, Insignia, Tarjeta } from "./monitor-piezas";

const VERDE = "#059669";
const ROJO = "#dc2626";

/**
 * monitor.manual (d4) · pantalla del analista de monitoreo, fuera del software del agente. Cola de
 * casos asignados, ficha del caso, gestión de contacto, registro de la gestión y la decisión
 * «Legítima» / «Fraude» (según `d.desenlace`), confirmada en un único diálogo.
 */
export default function PanelManual({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d = caso.datos;
  const esc = caso.escenario;
  const otros = useMemo(() => manualPrevios(caso.id, d, 2), [caso.id, d]);
  const contacto = useMemo(() => contactoAnalista(d, esc), [d, esc]);
  const decision = useMemo(() => textoDecision(d), [d]);

  const pD4 = avancePaso(caso, paso, p, "d4");
  const asignado = pD4 >= T.d4.asignado;
  const abierto = pD4 >= T.d4.abre;
  const contactando = pD4 >= T.d4.contacta && pD4 < T.d4.contactado;
  const contactado = pD4 >= T.d4.contactado;
  const seleccion = pD4 >= T.d4.clicDecision;
  const registrada = pD4 >= T.d4.registrada;
  const regla = esc === "sin_celular" ? "R01" : "R05";
  const legitima = d.desenlace === "legitima";

  const eCaso = estadoAncla(paso, p, "mon.fila.caso");
  const eContactar = estadoAncla(paso, p, "mon.btn.contactar");
  const eLegitima = estadoAncla(paso, p, "mon.btn.legitima");
  const eFraude = estadoAncla(paso, p, "mon.btn.fraude");

  const registro = [
    { visible: asignado, n: 0, texto: "Caso asignado · bloqueo preventivo vigente" },
    {
      visible: pD4 >= T.d4.contacta,
      n: 1,
      texto: esc === "sin_celular" ? "Contacto por canal alterno iniciado" : "Llamada al titular iniciada",
    },
    {
      visible: contactado,
      n: 2,
      texto: `Titular contactado · ${legitima ? "reconoce" : "no reconoce"} la compra`,
    },
    { visible: registrada, n: 3, texto: `Decisión registrada: ${decision.etiqueta}` },
  ];

  return (
    <div className="absolute inset-0 flex overflow-hidden text-[10.5px]">
      {/* Cola asignada */}
      <div className="w-[150px] shrink-0 bg-white border-r border-amber-200 flex flex-col min-h-0">
        <div className="h-[18px] shrink-0 px-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-amber-50 border-b border-amber-100 whitespace-nowrap">
          <Headset className="w-3 h-3 text-amber-700 shrink-0" />
          Mi cola · manual ({otros.length + (asignado ? 1 : 0)})
        </div>
        {asignado && (
          <div
            key="caso"
            data-ancla="mon.fila.caso"
            className={`animate-slide-in-up shrink-0 px-1.5 py-[3px] border-b border-slate-100 border-l-2 ${abierto ? "bg-amber-50 border-l-amber-500" : "border-l-transparent"} ${eCaso.clic ? "brightness-95" : ""}`}
          >
            <div className="flex items-center justify-between gap-1 whitespace-nowrap">
              <span className="font-mono-jetbrains text-[9.5px] font-semibold text-slate-800 truncate">
                {d.alerta.referencia}
              </span>
              {!abierto && <span className="text-[9px] text-amber-700 font-medium">nueva</span>}
            </div>
            <div className="text-[9.5px] text-slate-600 truncate">
              {nombreCorto(d.cliente.nombre)} · {formatPeso(d.transaccion.monto)}
            </div>
          </div>
        )}
        {otros.map((f) => (
          <div
            key={f.referencia}
            className="shrink-0 px-1.5 py-[3px] border-b border-slate-100 border-l-2 border-l-transparent"
          >
            <div className="flex items-center justify-between gap-1 whitespace-nowrap">
              <span className="font-mono-jetbrains text-[9.5px] text-slate-700 truncate">{f.referencia}</span>
              <span className="text-[9px] text-slate-400">{f.espera}</span>
            </div>
            <div className="text-[9.5px] text-slate-500 truncate">
              {f.cliente} · {formatPeso(f.monto)}
            </div>
          </div>
        ))}
        <div className="mt-auto px-1.5 py-1 border-t border-slate-100 text-[9.5px] text-slate-500 leading-tight">
          <div className="font-medium text-slate-700 truncate">{d.analista.nombre}</div>
          <div className="truncate">{d.analista.area}</div>
        </div>
      </div>

      {/* Caso */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 p-1">
        {abierto ? (
          <>
            <Tarjeta
              className="shrink-0"
              titulo={
                <>
                  Caso <span className="font-mono-jetbrains normal-case">{d.alerta.referencia}</span>
                </>
              }
              derecha={<ChipRegla codigo={regla} />}
            >
              <div
                key="ficha"
                className="animate-slide-in-up px-2 py-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] leading-[13px]"
              >
                <Dato k="Titular" v={d.cliente.nombre} />
                <Dato
                  k="Tarjeta"
                  v={
                    <>
                      <span className="font-mono-jetbrains">{d.tarjeta.mascara}</span> · {d.tarjeta.producto}
                    </>
                  }
                />
                <Dato k="Monto" v={formatPeso(d.transaccion.monto)} mono />
                <Dato k="Comercio" v={`${d.transaccion.comercio} · ${d.transaccion.ciudad}`} />
                <Dato k="Motivo" v={d.alerta.motivo} />
                <div className="flex items-center gap-1 min-w-0">
                  <Insignia texto="Bloqueo preventivo activo" clase="bg-orange-100 text-orange-700" />
                  <span className="truncate font-mono-jetbrains text-[9.5px] text-slate-500">{d.ppe.referencia}</span>
                </div>
              </div>
            </Tarjeta>

            <div className="flex-1 min-h-0 grid grid-cols-2 gap-1">
              <Tarjeta titulo="Gestión de contacto">
                <div className="px-2 py-1 flex flex-col gap-[3px]">
                  <div className="flex items-center gap-1 text-[10px] text-slate-700 min-w-0">
                    <PhoneCall className="w-3 h-3 shrink-0 text-slate-500" />
                    <span className="truncate font-medium">{contacto.canal}</span>
                  </div>
                  <div
                    className={`text-[9.5px] leading-[12px] text-slate-500 line-clamp-2 ${esc === "sin_celular" ? "" : "font-mono-jetbrains"}`}
                  >
                    {contacto.detalle}
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <BotonWeb
                      ancla="mon.btn.contactar"
                      texto={esc === "sin_celular" ? "Contactar por canal alterno" : "Llamar al titular"}
                      color={d.analista.color ?? "#d97706"}
                      presionado={eContactar.clic}
                      deshabilitado={contactando || contactado}
                    />
                    <span className="text-[10px] flex items-center gap-1">
                      {contactando ? (
                        <span className="flex items-center gap-1 text-blue-700">
                          <Spinner className="w-3 h-3" color="#1d4ed8" /> Contactando…
                        </span>
                      ) : contactado ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Check className="w-3 h-3" strokeWidth={3} /> Contactado
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin contactar</span>
                      )}
                    </span>
                  </div>
                </div>
              </Tarjeta>

              <Tarjeta titulo="Registro de la gestión">
                <div className="px-2 py-1 flex flex-col gap-[1px]">
                  {registro
                    .filter((r) => r.visible)
                    .map((r) => (
                      <div key={r.n} className="animate-toast-in flex gap-1.5 text-[9.5px] whitespace-nowrap min-w-0">
                        <span className="font-mono-jetbrains text-slate-400 shrink-0">{horaGestion(d, esc, r.n)}</span>
                        <span className={`truncate ${r.n === 3 ? "font-medium text-slate-800" : "text-slate-600"}`}>
                          {r.texto}
                        </span>
                      </div>
                    ))}
                </div>
              </Tarjeta>
            </div>

            {/* Decisión */}
            <div className="h-[24px] shrink-0 flex items-center gap-2 px-2 rounded border border-amber-200 bg-amber-50/60 whitespace-nowrap">
              <span className="text-[10px] font-semibold text-slate-700">Decisión del analista</span>
              <BotonWeb
                ancla="mon.btn.legitima"
                texto="Legítima"
                color={VERDE}
                presionado={eLegitima.clic}
                deshabilitado={!contactado || (seleccion && !legitima)}
                icono={<Check className="w-3 h-3" strokeWidth={3} />}
              />
              <BotonWeb
                ancla="mon.btn.fraude"
                texto="Fraude"
                color={ROJO}
                presionado={eFraude.clic}
                deshabilitado={!contactado || (seleccion && legitima)}
              />
              <span className="ml-auto min-w-0 truncate text-[10px]">
                {registrada ? (
                  <span
                    key="decision"
                    data-ancla="mon.chip.decision"
                    className="animate-toast-in inline-flex items-center gap-1 text-emerald-700 font-medium"
                  >
                    <Check className="w-3 h-3" strokeWidth={3} /> Decisión registrada · {decision.etiqueta}
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Motivo de escalamiento: <span className="text-slate-700">{causaManual(esc, d.hsm.slaMin)}</span>
                  </span>
                )}
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[10.5px] text-slate-400 italic">
            Seleccione un caso de su cola para gestionarlo
          </div>
        )}
      </div>
    </div>
  );
}
