"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import { progresoEfectivo } from "@/components/agentes/guion";
import { CROMO } from "../cromo";
import VentanaSistema from "../ventana-sistema";
import { ToastEntrega } from "./comun";
import { colorAgentePaso } from "./monitor-piezas";
import PanelCola from "./monitor-cola";
import PanelDetalle from "./monitor-detalle";
import PanelSync from "./monitor-sync";
import PanelManual from "./monitor-manual";

const URL_BASE = CROMO.monitor.url ?? "monitor.antifraude.corp.local/alertas";

/**
 * Monitor · consola de alertas antifraude. Cuatro vistas: la cola (r1, i3), la ficha de la alerta
 * (r2, r3, r4), la sincronización de la tipificación con el origen (g3) y el monitoreo manual (d4),
 * que es la pantalla del analista y por eso VentanaSistema pinta la cinta ámbar de actor humano.
 * Todo lo visible es función del progreso del paso y de lo ya hecho en el caso.
 */
function VentanaMonitor({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const acento = colorAgentePaso(paso) ?? CROMO.monitor.barra;
  const esManual = vista === "monitor.manual";
  const url =
    vista === "monitor.detalle"
      ? `${URL_BASE}/${d.alerta.referencia}`
      : vista === "monitor.sync"
        ? `${URL_BASE}/${d.alerta.referencia}/sincronizacion`
        : esManual
          ? `${URL_BASE.replace(/\/alertas$/, "")}/monitoreo-manual`
          : URL_BASE;

  return (
    <VentanaSistema
      ventana="monitor"
      titulo={esManual ? "Monitor · Monitoreo manual de alertas" : undefined}
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
      color={actor === "humano" ? undefined : acento}
      url={url}
    >
      <div className="absolute inset-0">
        {vista === "monitor.detalle" ? (
          <PanelDetalle caso={caso} paso={paso} p={p} />
        ) : vista === "monitor.sync" ? (
          <PanelSync caso={caso} paso={paso} p={p} color={acento} />
        ) : esManual ? (
          <PanelManual caso={caso} paso={paso} p={p} />
        ) : (
          <PanelCola caso={caso} paso={paso} p={p} color={acento} />
        )}
        <ToastEntrega paso={paso} progreso={p} />
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaMonitor);
