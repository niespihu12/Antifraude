import type { EstadoAlerta } from "@/types";
import type { AgenteId, Caso, EntradaBitacora, EstadoAgente, OpcionesCaso, PasoPlan, Snapshot } from "@/types/agentes";
import { AGENTES, AGENTES_MAP, generarCaso } from "@/data/agentes-data";

export interface EngineCallbacks {
  onNuevaAlerta: (caso: Caso) => void;
  onEstado: (caso: Caso, estado: EstadoAlerta, mensaje: string, t: number) => void;
}

const TICK_MS = 100;
const ALERTA_MIN = 9_000;
const ALERTA_MAX = 17_000;
const SEQ_INICIAL = 8001;
const MAX_CASOS = 60;
const MAX_BITACORA = 400;
const SEMILLA_MS = 75_000;

function agentesIniciales(): Record<AgenteId, EstadoAgente> {
  const r = {} as Record<AgenteId, EstadoAgente>;
  for (const a of AGENTES) {
    r[a.id] = { id: a.id, activo: null, cola: [], procesadas: 0, ocupadoMs: 0, ultimaAccion: "En espera de trabajo" };
  }
  return r;
}

const ACUMULADO_INICIAL = {
  terminadas: 0,
  legitimas: 0,
  fraudes: 0,
  escaladas: 0,
  excepciones: 0,
  acciones: 0,
  cicloTotalMs: 0,
};

/**
 * Motor de simulación discreta del equipo de agentes: cada agente atiende una
 * alerta a la vez, con cola; las esperas humanas (cliente, analista) liberan al
 * agente. Su único timer (100 ms × velocidad) vive aquí, no en los componentes.
 * Expone un store para `useSyncExternalStore` (`src/hooks/use-agentes.ts`).
 */
class AgentesEngine {
  private casos: Caso[] = [];
  private agentes = agentesIniciales();
  private bitacora: EntradaBitacora[] = [];
  private handoffs: Snapshot["handoffs"] = [];
  private relojSim = 0;
  private ahora = 0;
  private proximaAlertaEn = 1_500;
  private seq = SEQ_INICIAL;
  private idBitacora = 1;
  private idHandoff = 1;
  private velocidad = 1;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<() => void>();
  private version = 0;
  private snapshot: Snapshot | null = null;
  private callbacks: EngineCallbacks | null = null;
  private focoId: string | null = null;
  private autoSeguir = true;
  private sembrando = false;
  private acumulado = { ...ACUMULADO_INICIAL };

  /* ─── API pública ─── */
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getSnapshot = (): Snapshot => {
    if (this.snapshot && this.snapshot.version === this.version) return this.snapshot;
    const terminadas = this.acumulado.terminadas;
    this.snapshot = {
      version: this.version,
      ahora: this.ahora,
      relojSim: this.relojSim,
      velocidad: this.velocidad,
      casos: [...this.casos],
      agentes: Object.fromEntries(
        Object.entries(this.agentes).map(([k, v]) => [k, { ...v, cola: [...v.cola] }]),
      ) as Record<AgenteId, EstadoAgente>,
      bitacora: [...this.bitacora],
      focoId: this.focoId,
      autoSeguir: this.autoSeguir,
      corriendo: this.timer !== null,
      handoffs: [...this.handoffs],
      stats: {
        recibidas: this.seq - SEQ_INICIAL,
        terminadas,
        legitimas: this.acumulado.legitimas,
        fraudes: this.acumulado.fraudes,
        escaladas: this.acumulado.escaladas,
        excepciones: this.acumulado.excepciones,
        cicloPromedioMs: terminadas ? this.acumulado.cicloTotalMs / terminadas : 0,
        accionesTotales: this.acumulado.acciones,
      },
    };
    return this.snapshot;
  };

  setCallbacks(cb: EngineCallbacks) {
    this.callbacks = cb;
  }

  setVelocidad(v: number) {
    if (this.velocidad === v) return;
    this.velocidad = v;
    this.emitir();
  }

  start() {
    if (this.timer) return;
    if (this.casos.length === 0) this.sembrar();
    this.timer = setInterval(() => this.tick(TICK_MS * this.velocidad, Date.now()), TICK_MS);
    this.emitir();
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.emitir();
  }

  reset() {
    this.pause();
    this.casos = [];
    this.agentes = agentesIniciales();
    this.bitacora = [];
    this.handoffs = [];
    this.relojSim = 0;
    this.proximaAlertaEn = 1_500;
    this.seq = SEQ_INICIAL;
    this.focoId = null;
    this.autoSeguir = true;
    this.acumulado = { ...ACUMULADO_INICIAL };
    this.emitir();
  }

  setFoco(id: string | null) {
    this.focoId = id;
    this.autoSeguir = id === null;
    this.emitir();
  }

  setAutoSeguir(v: boolean) {
    this.autoSeguir = v;
    if (v) this.elegirFoco(Date.now(), true);
    this.emitir();
  }

  /** Genera una alerta ya mismo (botón «Alerta entrante» / Director de escena). */
  forzarAlerta(opts?: OpcionesCaso, etiquetaEscena?: string) {
    this.nuevaAlerta(Date.now(), true, opts, etiquetaEscena);
    this.emitir();
  }

  /* ─── Internos ─── */
  private emitir() {
    this.version++;
    if (this.sembrando) return;
    for (const l of this.listeners) l();
  }

  private sembrar() {
    this.sembrando = true;
    const fin = Date.now();
    const pasos = SEMILLA_MS / TICK_MS;
    for (let i = 0; i < pasos; i++) {
      this.tick(TICK_MS, fin - SEMILLA_MS + i * TICK_MS);
    }
    this.handoffs = [];
    this.sembrando = false;
    // Abrimos la pantalla con una alerta entrando ahora mismo y seguimos ese caso.
    this.nuevaAlerta(fin, true);
  }

  private byId(id: string | null): Caso | undefined {
    return id ? this.casos.find((c) => c.id === id) : undefined;
  }

  private log(
    caso: Caso,
    agente: AgenteId,
    mensaje: string,
    t: number,
    nivel: EntradaBitacora["nivel"],
    extra: Partial<EntradaBitacora> = {},
  ) {
    this.bitacora.unshift({ id: this.idBitacora++, t, agente, casoId: caso.id, mensaje, nivel, ...extra });
    if (this.bitacora.length > MAX_BITACORA) this.bitacora.length = MAX_BITACORA;
  }

  private nuevaAlerta(ahora: number, enfocar = false, opts?: OpcionesCaso, etiquetaEscena?: string) {
    const seq = this.seq++;
    const caso = generarCaso(seq, ahora, opts);
    if (etiquetaEscena) caso.escenaForzada = etiquetaEscena;
    this.casos.push(caso);
    this.agentes.recepcion.cola.push(caso.id);
    const a = caso.datos.alerta;
    this.log(caso, "recepcion", `Alerta entrante de ${a.origen} · ${a.referencia} · ${caso.cliente}`, ahora, "info", {
      sistema: a.sistemaOrigen,
    });
    this.callbacks?.onNuevaAlerta(caso);
    if (enfocar || !this.focoId) {
      this.focoId = caso.id;
      this.autoSeguir = true;
    }
    this.podar();
  }

  private podar() {
    if (this.casos.length <= MAX_CASOS) return;
    const terminadas = this.casos.filter((c) => c.estado === "terminada" && c.id !== this.focoId);
    const sobrantes = this.casos.length - MAX_CASOS;
    const quitar = new Set(terminadas.slice(0, sobrantes).map((c) => c.id));
    this.casos = this.casos.filter((c) => !quitar.has(c.id));
  }

  private pasoActual(caso: Caso): PasoPlan | undefined {
    return caso.plan[caso.etapaIdx]?.pasos[caso.pasoIdx];
  }

  private tomar(agenteId: AgenteId, caso: Caso, ahora: number) {
    const est = this.agentes[agenteId];
    est.activo = caso.id;
    caso.estado = "procesando";
    if (caso.pasoIdx === 0) {
      caso.tiemposEtapa[agenteId] = { inicio: ahora };
      this.log(caso, agenteId, `${AGENTES_MAP[agenteId].nombre} toma ${caso.id} (${caso.cliente})`, ahora, "handoff");
    }
    this.iniciarPaso(caso, ahora);
  }

  private iniciarPaso(caso: Caso, ahora: number) {
    const p = this.pasoActual(caso);
    if (!p) return;
    const agenteId = caso.plan[caso.etapaIdx].agente;
    caso.restante = p.duracion;
    caso.ultimoEvento = ahora;
    this.agentes[agenteId].ultimaAccion = p.texto;
    if (p.estado) {
      caso.estadoAlerta = p.estado;
      this.callbacks?.onEstado(caso, p.estado, `${AGENTES_MAP[agenteId].nombre}: ${p.texto}`, ahora);
    }
    if (p.tipo === "espera_humana") {
      caso.estado = "esperando";
      this.agentes[agenteId].activo = null;
      this.agentes[agenteId].ultimaAccion = "En espera de trabajo";
      if (p.humano?.area === "Monitoreo 24/7") this.acumulado.escaladas++;
      this.log(
        caso,
        agenteId,
        `${p.texto} · ${p.humano?.nombre} (${p.humano?.rol}) · el agente sigue con la siguiente alerta`,
        ahora,
        "aviso",
        { sistema: p.sistema },
      );
    }
  }

  private completarPaso(caso: Caso, ahora: number) {
    const etapa = caso.plan[caso.etapaIdx];
    const p = etapa.pasos[caso.pasoIdx];
    const agenteId = etapa.agente;
    const est = this.agentes[agenteId];
    const ok = p.ok !== false;
    caso.pasosHechos[p.id] = { ok, resultado: p.resultado, t: ahora };
    caso.ultimoEvento = ahora;
    this.acumulado.acciones++;
    if (!ok) {
      caso.excepciones++;
      this.acumulado.excepciones++;
    }
    const mensaje = p.bitacora ?? (p.resultado ? `${p.texto} → ${p.resultado}` : p.texto);
    const esHandoff = /^Entregando a /.test(p.texto);
    if (!esHandoff) {
      this.log(caso, agenteId, mensaje, ahora, ok ? "ok" : "aviso", { sistema: p.sistema, regla: p.regla });
    }

    const veniaEsperando = caso.estado === "esperando";
    caso.pasoIdx++;

    if (caso.pasoIdx < etapa.pasos.length) {
      if (veniaEsperando) {
        caso.estado = "en_cola";
        est.cola.unshift(caso.id);
      } else {
        this.iniciarPaso(caso, ahora);
      }
      return;
    }

    // Etapa terminada
    const te = caso.tiemposEtapa[agenteId];
    if (te) te.fin = ahora;
    est.procesadas++;
    if (!veniaEsperando) {
      est.activo = null;
      est.ultimaAccion = "En espera de trabajo";
    }
    caso.etapaIdx++;
    caso.pasoIdx = 0;
    if (caso.etapaIdx < caso.plan.length) {
      const siguiente = caso.plan[caso.etapaIdx].agente;
      caso.estado = "en_cola";
      this.agentes[siguiente].cola.push(caso.id);
      this.handoffs.push({ id: this.idHandoff++, de: agenteId, a: siguiente, casoId: caso.id, t: ahora });
      this.log(
        caso,
        siguiente,
        `${caso.id} en cola de ${AGENTES_MAP[siguiente].nombre} (posición ${this.agentes[siguiente].cola.length})`,
        ahora,
        "handoff",
      );
    } else {
      this.finalizar(caso, ahora);
    }
  }

  private finalizar(caso: Caso, ahora: number) {
    caso.estado = "terminada";
    caso.terminadoEn = ahora;
    caso.resultado = caso.datos.desenlace;
    this.acumulado.terminadas++;
    this.acumulado.cicloTotalMs += ahora - caso.recibidoEn;
    if (caso.resultado === "legitima") this.acumulado.legitimas++;
    else this.acumulado.fraudes++;
    const etiqueta = caso.resultado === "legitima" ? "LEGÍTIMA · falso positivo" : "FRAUDE · bloqueo definitivo";
    this.log(
      caso,
      "registro",
      `Expediente ${caso.datos.expediente.numero} cerrado · ${etiqueta} · ${Object.keys(caso.pasosHechos).length} acciones`,
      ahora,
      caso.resultado === "legitima" ? "ok" : "error",
      { sistema: "expediente" },
    );
  }

  private elegirFoco(ahora: number, forzar = false) {
    if (!this.autoSeguir) return;
    const actual = this.byId(this.focoId);
    if (!forzar && actual && !(actual.estado === "terminada" && ahora - (actual.terminadoEn ?? ahora) > 3_500)) return;
    const activos = this.casos.filter((c) => c.estado !== "terminada");
    if (activos.length === 0) return;
    activos.sort((a, b) => a.etapaIdx - b.etapaIdx || b.recibidoEn - a.recibidoEn);
    this.focoId = activos[0].id;
  }

  private tick(dt: number, ahora: number) {
    this.relojSim += dt;
    this.ahora = ahora;

    this.proximaAlertaEn -= dt;
    if (this.proximaAlertaEn <= 0) {
      this.nuevaAlerta(ahora);
      this.proximaAlertaEn = ALERTA_MIN + Math.random() * (ALERTA_MAX - ALERTA_MIN);
    }

    for (const caso of this.casos) {
      if (caso.estado !== "esperando") continue;
      caso.restante -= dt;
      if (caso.restante <= 0) this.completarPaso(caso, ahora);
    }

    for (const a of AGENTES) {
      const est = this.agentes[a.id];
      if (!est.activo && est.cola.length > 0) {
        const id = est.cola.shift()!;
        const caso = this.byId(id);
        if (caso) this.tomar(a.id, caso, ahora);
      }
      if (est.activo) {
        const caso = this.byId(est.activo);
        if (!caso) {
          est.activo = null;
          continue;
        }
        caso.restante -= dt;
        est.ocupadoMs += dt;
        if (caso.restante <= 0) this.completarPaso(caso, ahora);
      }
    }

    this.handoffs = this.handoffs.filter((h) => ahora - h.t < 2_500);
    this.elegirFoco(ahora);
    this.emitir();
  }
}

export const agentesEngine = new AgentesEngine();

// Acceso de depuración desde la consola del navegador (solo en el cliente).
if (typeof window !== "undefined") {
  (window as unknown as { __agentes?: AgentesEngine }).__agentes = agentesEngine;
}
