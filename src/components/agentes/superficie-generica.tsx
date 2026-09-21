"use client";

import { CircleAlert, CircleCheck, CircleMinus } from "lucide-react";
import type { AgenteId, Caso, ControlChequeo } from "@/types/agentes";
import { AGENTES_MAP, FRANQUICIA_LABEL } from "@/data/agentes-data";
import { formatPeso } from "@/data/agentes-util";
import { ChipRegla } from "./ui";

interface Props {
  caso: Caso;
  agente: AgenteId;
}

type Fila = [etiqueta: string, valor: string];

function Ficha({ titulo, filas }: { titulo: string; filas: Fila[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</div>
      <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-1 text-[11.5px]">
        {filas.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-slate-400">{k}</dt>
            <dd className="truncate font-mono-jetbrains text-slate-800" title={v}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Controles({
  titulo,
  controles,
  revisado,
}: {
  titulo: string;
  controles: ControlChequeo[];
  revisado: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</div>
      <ul className="space-y-1.5">
        {controles.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[11.5px]">
            <span className="mt-[1px] shrink-0">
              {!revisado ? (
                <CircleMinus className="h-3.5 w-3.5 text-slate-300" />
              ) : !c.ok ? (
                <CircleAlert className="h-3.5 w-3.5 text-red-600" />
              ) : c.aviso ? (
                <CircleAlert className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
              )}
            </span>
            <span className="min-w-0">
              <span className={`font-medium ${revisado ? "text-slate-800" : "text-slate-400"}`}>{c.nombre}</span>
              {c.regla && revisado && (
                <span className="ml-1.5">
                  <ChipRegla codigo={c.regla} />
                </span>
              )}
              {revisado && <span className="block text-[10.5px] text-slate-500">{c.detalle}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Vista «Tarjetas» de la estación: los datos y controles que maneja el agente en
 * su etapa, sin escritorio. Es la misma información que muestran las pantallas
 * del sistema, presentada como fichas.
 */
export default function SuperficieGenerica({ caso, agente }: Props) {
  const d = caso.datos;
  const hecho = (id: string) => !!caso.pasosHechos[id];
  const def = AGENTES_MAP[agente];

  return (
    <div className="grid gap-3 md:grid-cols-2" data-agente={def.id}>
      {agente === "recepcion" && (
        <>
          <Ficha
            titulo="Alerta de origen"
            filas={[
              ["Referencia", d.alerta.referencia],
              ["Origen", `${d.alerta.origen} · ${FRANQUICIA_LABEL[caso.franquicia]}`],
              ["Canal", d.alerta.canal],
              ["Motivo", d.alerta.motivo],
              ["Prioridad", d.alerta.prioridad],
            ]}
          />
          <Ficha
            titulo="Transacción"
            filas={[
              ["Comercio", d.transaccion.comercio],
              ["Categoría", `${d.transaccion.categoria} · MCC ${d.transaccion.mcc}`],
              ["Ubicación", `${d.transaccion.ciudad}, ${d.transaccion.pais}`],
              ["Monto", formatPeso(d.transaccion.monto)],
              ["Promedio del cliente", formatPeso(d.transaccion.promedioHistorico)],
            ]}
          />
        </>
      )}
      {agente === "identificacion" && (
        <>
          <Ficha
            titulo="Titular en CRM Banco"
            filas={[
              ["Nombre", d.cliente.nombre],
              ["Cédula", `CC ${d.cliente.cedula}`],
              ["Celular", d.cliente.celular ?? "Sin registrar"],
              ["Actualizado", d.cliente.fechaActualizacion],
              ["Cliente desde", String(d.cliente.clienteDesde)],
            ]}
          />
          <Controles titulo="Revisión de identificación" controles={d.identificacion} revisado={hecho("i2")} />
        </>
      )}
      {agente === "comunicacion" && (
        <>
          <Ficha
            titulo="Plantilla HSM"
            filas={[
              ["Plantilla", d.hsm.plantilla],
              ["Destino", d.hsm.entregadoA || "Sin celular"],
              ["Mensaje", hecho("c2") ? d.hsm.messageId.slice(0, 22) + "…" : "—"],
              ["SLA", `${d.hsm.slaMin} min · reintento a los ${d.hsm.reintentoMin} min`],
              [
                "Respuesta",
                hecho("c3")
                  ? d.hsm.respuesta === "si"
                    ? "Sí fui yo"
                    : d.hsm.respuesta === "no"
                      ? "No fui yo"
                      : "Sin respuesta"
                  : "—",
              ],
            ]}
          />
          <div className="rounded-lg border border-slate-200 bg-[#e5ddd5] p-3">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Conversación</div>
            <div className="space-y-1.5">
              {(hecho("c2") ? d.hsm.mensajes : []).map((m, i) => (
                <div
                  key={i}
                  className="max-w-[92%] whitespace-pre-line rounded-lg rounded-tl-none bg-white px-2 py-1 text-[11px] text-slate-800 shadow-sm"
                >
                  {m}
                </div>
              ))}
              {hecho("c3") && d.hsm.respuesta !== "ninguna" && (
                <div className="ml-auto max-w-[70%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-2 py-1 text-[11px] text-slate-800 shadow-sm">
                  {d.hsm.respuesta === "si" ? "Sí fui yo" : "No fui yo"}
                </div>
              )}
              {!hecho("c2") && <div className="text-[11px] italic text-slate-500">Aún no se envía la plantilla.</div>}
            </div>
          </div>
        </>
      )}
      {agente === "decision" && (
        <>
          <Controles titulo="Revisión de riesgo" controles={d.riesgo} revisado={hecho("d1")} />
          <Ficha
            titulo="PPE · estado de la tarjeta"
            filas={[
              ["Tarjeta", d.tarjeta.mascara],
              ["Bloqueo temporal", d.ppe.bloqueoTemporal ? d.ppe.bloqueoTemporal.id : "Sin bloqueo"],
              ["Referencia PPE", d.ppe.referencia],
              ["Estado de la alerta", caso.estadoAlerta],
              [
                "Decide",
                d.hsm.respuesta === "ninguna"
                  ? `${d.analista.nombre} (analista)`
                  : `Titular · «${d.hsm.respuesta === "si" ? "Sí fui yo" : "No fui yo"}»`,
              ],
            ]}
          />
        </>
      )}
      {agente === "registro" && (
        <>
          <Ficha
            titulo="Tipificación en CRM"
            filas={[
              ["Caso CRM", d.registro.casoCrm],
              ["Categoría", hecho("g1") || hecho("g2") ? d.registro.categoria : "—"],
              ["Causa", d.registro.causa],
              ["Estado", caso.estadoAlerta],
            ]}
          />
          <Ficha
            titulo="Expediente"
            filas={[
              ["Número", d.expediente.numero],
              ["Sello SHA-256", hecho("g5") ? d.expediente.hash.slice(0, 24) + "…" : "—"],
              ["Acciones", String(Object.keys(caso.pasosHechos).length)],
              ["Excepciones", String(caso.excepciones)],
            ]}
          />
        </>
      )}
    </div>
  );
}
