/**
 * Verificación de la pestaña «Agentes» (Fase 3).
 *
 * Empaqueta con esbuild los datos, el plan, los guiones y el escritorio RPA, genera casos
 * (60 naturales + cada escenario × cada franquicia) y comprueba, sin navegador:
 *  - integridad del plan y de la máquina de estados de la ontología;
 *  - guiones completos (vista, ui, pensamiento) y bien ordenados;
 *  - un diálogo por paso, tecleos ≥ 300 ms, actores humanos en las esperas;
 *  - que cada ancla que usa un guion existe en el DOM de la vista en el instante en que se usa
 *    (y en el estado final que se pinta a ×5/×10);
 *  - cero timers / AnimatePresence / layoutId / resortes en los componentes de la pestaña.
 *
 * Uso: node scripts/verificar-agentes.mjs [--casos 60] [--verbose]
 */
import { build } from "esbuild";
import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const raiz = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const NUM_CASOS = Number(args[args.indexOf("--casos") + 1]) || 60;
const VERBOSE = args.includes("--verbose");

/* ─── 1. Empaquetado ─── */
const salidaDir = path.join(raiz, "node_modules", ".cache", "verificar-agentes");
mkdirSync(salidaDir, { recursive: true });
const salida = path.join(salidaDir, "bundle.mjs");

await build({
  stdin: {
    resolveDir: raiz,
    loader: "tsx",
    sourcefile: "entrada.tsx",
    contents: `
      import React from "react";
      import { renderToStaticMarkup } from "react-dom/server";
      import { generarCaso, ESCENAS, AGENTES } from "@/data/agentes-data";
      import { GUIONES } from "@/data/guiones";
      import EscritorioRPA from "@/components/agentes/rpa/escritorio-rpa";
      import { finAccion, actorActivo } from "@/components/agentes/guion";
      import { EstadoAlerta, Franquicia } from "@/types";
      export { React, renderToStaticMarkup, generarCaso, ESCENAS, AGENTES, GUIONES, EscritorioRPA, finAccion, actorActivo, EstadoAlerta, Franquicia };
    `,
  },
  outfile: salida,
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  logLevel: "error",
  tsconfig: path.join(raiz, "tsconfig.json"),
  external: ["react", "react-dom", "react-dom/server", "framer-motion", "lucide-react"],
});

const M = await import(pathToFileURL(salida).href);
const { React, renderToStaticMarkup, generarCaso, GUIONES, EscritorioRPA, finAccion, actorActivo, EstadoAlerta, Franquicia } = M;

/* ─── 2. Utilidades ─── */
const fallos = new Map(); // clave → { mensaje, veces, ejemplo }
let comprobaciones = 0;
function falla(clave, mensaje, ejemplo) {
  const f = fallos.get(clave);
  if (f) f.veces++;
  else fallos.set(clave, { mensaje, veces: 1, ejemplo });
}
function comprobar(ok, clave, mensaje, ejemplo) {
  comprobaciones++;
  if (!ok) falla(clave, mensaje, ejemplo);
}

const REGLAS_VALIDAS = new Set(Array.from({ length: 12 }, (_, i) => `R${String(i + 1).padStart(2, "0")}`));

/** Transiciones permitidas por la máquina de estados de la ontología (EDGES de ontologia-view.tsx). */
const E = EstadoAlerta;
const TRANSICIONES = {
  [E.PENDIENTE_REVISION]: [E.EN_VERIFICACION_CRM],
  [E.EN_VERIFICACION_CRM]: [E.WHATSAPP_ENVIADO, E.BLOQUEO_PREVENTIVO],
  [E.WHATSAPP_ENVIADO]: [E.ESPERANDO_CLIENTE],
  [E.ESPERANDO_CLIENTE]: [E.BLOQUEO_PREVENTIVO, E.DESBLOQUEADO, E.BLOQUEO_DEFINITIVO],
  [E.BLOQUEO_PREVENTIVO]: [E.DESBLOQUEADO, E.BLOQUEO_DEFINITIVO],
  [E.DESBLOQUEADO]: [E.TIPIFICADO],
  [E.BLOQUEO_DEFINITIVO]: [E.TIPIFICADO],
  [E.TIPIFICADO]: [],
};

const TIPOS_CURSOR = new Set(["mover", "clic", "clicDerecho", "teclear", "pegar", "arrastrar"]);
const esEntrega = (p) => /^Entregando a /.test(p.texto);
const anclas = (html) => new Set([...html.matchAll(/data-ancla="([^"]+)"/g)].map((m) => m[1]));

/** Copia del caso situada en (etapa, paso), con lo anterior ya hecho. */
function casoEn(caso, etapaIdx, pasoIdx) {
  const paso = caso.plan[etapaIdx].pasos[pasoIdx];
  const hechos = {};
  for (let e = 0; e <= etapaIdx; e++) {
    const pasos = caso.plan[e].pasos;
    const tope = e < etapaIdx ? pasos.length : pasoIdx;
    for (let i = 0; i < tope; i++) hechos[pasos[i].id] = { ok: pasos[i].ok !== false, resultado: pasos[i].resultado, t: 0 };
  }
  return {
    ...caso,
    etapaIdx,
    pasoIdx,
    estado: paso.tipo === "espera_humana" ? "esperando" : "procesando",
    restante: paso.duracion,
    pasosHechos: hechos,
    estadoAlerta: caso.estadoAlerta,
  };
}

function renderEscritorio(caso, etapaIdx, pasoIdx, progreso, velocidad = 1) {
  const c = casoEn(caso, etapaIdx, pasoIdx);
  const paso = c.plan[etapaIdx].pasos[pasoIdx];
  return renderToStaticMarkup(
    React.createElement(EscritorioRPA, {
      caso: c,
      etapaIdx,
      paso,
      progreso,
      velocidad,
      relojSim: 65_000,
      ahora: 1_770_000_000_000,
      corriendo: true,
      revisando: false,
      teatro: false,
    }),
  );
}

/* ─── 3. Casos ─── */
const casos = [];
for (let i = 0; i < NUM_CASOS; i++) casos.push(generarCaso(8001 + i, 1_770_000_000_000 + i * 60_000));
const escenarios = ["legitima", "niega", "sin_respuesta", "sin_celular", "alto_riesgo", "recurrente", "sin_tipificar"];
let seqForzado = 9001;
for (const escenario of escenarios) {
  for (const franquicia of Object.values(Franquicia)) {
    casos.push(generarCaso(seqForzado++, 1_770_000_000_000, { franquicia, escenario }));
  }
}

/* ─── 4. Verificación por caso ─── */
let pasosRevisados = 0;
let anclasRevisadas = 0;

for (const caso of casos) {
  const id = `${caso.id} (${caso.escenario}/${caso.franquicia})`;

  // 4.1 Plan y máquina de estados
  const todos = caso.plan.flatMap((e) => e.pasos);
  const ids = todos.map((p) => p.id);
  comprobar(new Set(ids).size === ids.length, "plan.ids", "Hay ids de paso repetidos", id);
  comprobar(caso.plan.length >= 4, "plan.etapas", "Un caso debe tener al menos 4 etapas", id);
  const estados = todos.filter((p) => p.estado).map((p) => p.estado);
  comprobar(estados[0] === E.PENDIENTE_REVISION, "estados.inicio", "El primer estado debe ser Pendiente Revisión", id);
  comprobar(estados.at(-1) === E.TIPIFICADO, "estados.fin", "El último estado debe ser Tipificado", id);
  for (let i = 1; i < estados.length; i++) {
    comprobar(
      (TRANSICIONES[estados[i - 1]] ?? []).includes(estados[i]),
      "estados.transicion",
      `Transición no permitida por la máquina de estados: ${estados[i - 1]} → ${estados[i]}`,
      id,
    );
  }
  const reglas = new Set(todos.map((p) => p.regla).filter(Boolean));
  for (const r of reglas) comprobar(REGLAS_VALIDAS.has(r), "plan.regla", `Código de regla desconocido: ${r}`, id);

  // 4.2 Pasos, guiones y anclas
  for (let e = 0; e < caso.plan.length; e++) {
    const pasos = caso.plan[e].pasos;
    for (let i = 0; i < pasos.length; i++) {
      const paso = pasos[i];
      pasosRevisados++;
      const donde = `${id} · ${paso.id}`;
      comprobar(paso.duracion > 0, "paso.duracion", "Duración no positiva", donde);
      comprobar(!!paso.texto, "paso.texto", "Paso sin texto", donde);

      if (paso.tipo === "espera_humana") {
        comprobar(!!paso.humano?.nombre, "humano.definido", "Espera humana sin persona", donde);
      }
      if (esEntrega(paso)) {
        comprobar(!paso.ui?.length && !paso.pensamiento, "entrega.sin_guion", "Un paso de entrega no lleva guion", donde);
        continue;
      }

      // Guion completo
      comprobar(!!paso.vista, "guion.vista", "Paso sin vista", donde);
      comprobar(!!paso.ui?.length, "guion.ui", "Paso sin acciones de interfaz", donde);
      comprobar(!!paso.pensamiento, "guion.pensamiento", "Paso sin pensamiento", donde);
      const ui = paso.ui ?? [];

      // Orden y rangos
      let tPrev = 0;
      for (const a of ui) {
        comprobar(a.t >= 0 && a.t <= 1, "ui.rango", `Acción ${a.tipo} con t fuera de 0–1 (${a.t})`, donde);
        comprobar(a.hasta === undefined || (a.hasta >= a.t && a.hasta <= 1), "ui.hasta", `Acción ${a.tipo} con hasta inválido`, donde);
        comprobar(a.t + 1e-9 >= tPrev, "ui.orden", `Acciones fuera de orden (t=${a.t} tras ${tPrev})`, donde);
        tPrev = Math.max(tPrev, a.t);
        if (a.tipo === "teclear" || a.tipo === "pegar") {
          const ms = (finAccion(a) - a.t) * paso.duracion;
          if (a.tipo === "teclear") comprobar(ms >= 300, "ui.tecleo", `Tecleo de ${Math.round(ms)} ms (mínimo 300)`, `${donde} · ${a.ancla}`);
          comprobar(!!a.ancla && !!a.texto, "ui.tecleo_datos", "teclear/pegar sin ancla o texto", donde);
        }
        if (a.tipo === "ventana") comprobar(!!a.vista, "ui.ventana", "Acción ventana sin vista", donde);
      }

      // Un diálogo por paso (el menú contextual no cuenta)
      const dialogos = ui.filter((a) => a.tipo === "dialogo" && a.dialogo?.tipo !== "menu");
      comprobar(dialogos.length <= 1, "ui.dialogo", `${dialogos.length} diálogos en un paso (máximo 1)`, donde);

      // Actores humanos en esperas
      if (paso.tipo === "espera_humana") {
        const cursorAgente = ui.filter((a) => TIPOS_CURSOR.has(a.tipo) && (a.actor ?? "agente") === "agente");
        const humanas = ui.filter((a) => a.actor === "humano");
        comprobar(humanas.length > 0, "humano.acciones", "Espera humana sin acciones del humano", donde);
        comprobar(cursorAgente.length === 0, "humano.cursor_agente", "En una espera humana el cursor del agente debe estar aparcado", donde);
        comprobar(actorActivo(paso, 0.5) === "humano", "humano.actor", "actorActivo debe ser humano en la espera", donde);
      }

      // Pensamiento: primera persona, reglas y vocabulario
      const pens = paso.pensamiento ?? "";
      comprobar(!/\b(IA|modelo)\b/i.test(pens) && !/\d\s?%/.test(pens), "pensamiento.vocabulario", "El pensamiento no debe mencionar IA, modelo ni porcentajes", `${donde}: ${pens}`);
      if (paso.regla) comprobar(pens.includes(paso.regla), "pensamiento.regla", `El pensamiento debe citar ${paso.regla}`, `${donde}: ${pens}`);
      for (const r of pens.match(/R\d{2}/g) ?? []) comprobar(REGLAS_VALIDAS.has(r), "pensamiento.regla_valida", `Regla inexistente ${r}`, donde);

      // Anclas: existen en el DOM en el instante en que se usan
      const necesarias = [];
      for (const a of ui) {
        if (a.ancla && (TIPOS_CURSOR.has(a.tipo) || a.tipo === "resaltar")) necesarias.push([a.ancla, a.t]);
        if (a.tipo === "arrastrar" && a.destino) necesarias.push([a.destino, Math.min(0.999, a.t + 0.02)]);
        if (a.tipo === "dialogo" && a.ancla) necesarias.push([a.ancla, a.t]);
      }
      const cache = new Map();
      const en = (p, vel = 1) => {
        const k = `${p}|${vel}`;
        if (!cache.has(k)) cache.set(k, anclas(renderEscritorio(caso, e, i, p, vel)));
        return cache.get(k);
      };
      for (const [ancla, t] of necesarias) {
        anclasRevisadas++;
        const p = Math.min(0.999, Math.max(0.001, t + 0.001));
        comprobar(en(p).has(ancla), "ancla.inexistente", `La ancla «${ancla}» no existe en el DOM en p=${p.toFixed(3)}`, `${donde} · vista ${paso.vista}`);
      }

      // Estado final (×5/×10): la última acción de cursor con ancla apunta a algo que existe
      const cursores = ui.filter((a) => a.ancla && TIPOS_CURSOR.has(a.tipo) && (paso.tipo === "espera_humana" ? a.actor === "humano" : (a.actor ?? "agente") === "agente"));
      const ultima = cursores.at(-1);
      if (ultima) {
        anclasRevisadas++;
        comprobar(en(0.5, 10).has(ultima.ancla), "ancla.final", `A ×10 la ancla «${ultima.ancla}» (última acción de cursor) no existe en el estado final`, `${donde} · vista ${paso.vista}`);
      }

      // La ventana no se rompe en ningún progreso
      for (const p of [0, 0.5, 1]) {
        try {
          renderEscritorio(caso, e, i, p);
        } catch (err) {
          falla("render.error", `La ventana lanza una excepción: ${err.message}`, `${donde} p=${p}`);
        }
      }
    }
  }
}

/* ─── 5. Reglas de oro en el código fuente ─── */
function archivos(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) archivos(p, acc);
    else if (/\.(ts|tsx)$/.test(n)) acc.push(p);
  }
  return acc;
}
const PROHIBIDO = [
  [/\bsetInterval\b|\bsetTimeout\b|\brequestAnimationFrame\b/, "timers/rAF en componentes"],
  [/\bAnimatePresence\b/, "AnimatePresence"],
  [/\blayoutId\b/, "layoutId"],
  [/type:\s*["']spring["']/, "resorte (spring)"],
  [/\bDate\.now\(|\bMath\.random\(/, "impureza (Date.now/Math.random) en render"],
];
const fuentes = [...archivos(path.join(raiz, "src", "components", "agentes")), ...archivos(path.join(raiz, "src", "data", "guiones"))];
for (const f of fuentes) {
  const txt = readFileSync(f, "utf8");
  for (const [re, nombre] of PROHIBIDO) comprobar(!re.test(txt), "fuente.prohibido", `Uso de ${nombre}`, path.relative(raiz, f));
}

/* ─── 6. Informe ─── */
const totalPasos = casos.reduce((s, c) => s + c.plan.reduce((t, e) => t + e.pasos.length, 0), 0);
console.log(`\nCasos: ${casos.length} · pasos: ${totalPasos} · pasos con guion revisados: ${pasosRevisados} · anclas comprobadas: ${anclasRevisadas} · comprobaciones: ${comprobaciones}`);
if (fallos.size === 0) {
  console.log("✔ 0 incoherencias.");
} else {
  const lista = [...fallos.entries()].sort((a, b) => b[1].veces - a[1].veces);
  console.log(`✖ ${lista.reduce((s, [, f]) => s + f.veces, 0)} incoherencias en ${lista.length} tipos:\n`);
  for (const [clave, f] of lista) {
    console.log(`  [${clave}] ×${f.veces} — ${f.mensaje}\n      p. ej. ${f.ejemplo}`);
    if (VERBOSE) console.log("");
  }
  process.exitCode = 1;
}
