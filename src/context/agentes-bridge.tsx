"use client";

import { useEffect } from "react";

import { useSimulation, type SimulationAlert } from "@/context/simulation-context";
import { faseDeEstado } from "@/data/agentes-util";
import { agentesEngine } from "@/lib/agentes-engine";
import { EstadoAlerta } from "@/types";
import type { Caso } from "@/types/agentes";

/** Fila del pipeline general para una alerta que gestionan los agentes. */
function alertaDeCaso(caso: Caso): SimulationAlert {
  return {
    id: caso.id,
    franquicia: caso.franquicia,
    tarjeta: caso.tarjeta,
    monto: caso.monto,
    estado: EstadoAlerta.PENDIENTE_REVISION,
    tiempo: "0 min",
    cliente: caso.cliente,
    area: caso.datos.alerta.origen,
    fecha: new Date(caso.recibidoEn).toISOString(),
    origen: "agentes",
    fase: "recepcion",
    createdAtMs: caso.recibidoEn,
    phaseChangedAtMs: caso.recibidoEn,
    flashToken: 1,
    isFraud: false,
    isUrgent: caso.datos.alerta.altoRiesgo,
  };
}

/**
 * Conecta el motor de agentes con la simulación global: mismo play/pausa/detener,
 * misma velocidad, y cada alerta que procesan los agentes existe también en el
 * pipeline general (`origen: 'agentes'`) y avanza por sus estados reales.
 */
export function AgentesBridge() {
  const { isRunning, tick, speed, agregarAlerta, avanzarAlerta } = useSimulation();
  const detenida = tick === 0;

  useEffect(() => {
    agentesEngine.setCallbacks({
      onNuevaAlerta: (caso) => agregarAlerta(alertaDeCaso(caso)),
      onEstado: (caso, estado, mensaje, t) => avanzarAlerta(caso.id, estado, faseDeEstado(estado), mensaje, t),
    });
  }, [agregarAlerta, avanzarAlerta]);

  useEffect(() => {
    agentesEngine.setVelocidad(speed);
  }, [speed]);

  // «Detener» deja la simulación en pausa con el contador en cero: ahí el motor se reinicia.
  useEffect(() => {
    if (isRunning) agentesEngine.start();
    else if (detenida) agentesEngine.reset();
    else agentesEngine.pause();
  }, [isRunning, detenida]);

  return null;
}
