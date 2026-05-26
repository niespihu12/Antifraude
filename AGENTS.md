# Agent Guide — BdB Antifraude Demo

Demo cinematográfica de automatización antifraude para Banco de Bogotá. Replica la arquitectura, design system y motion system de MEDVISION (https://medvision-ivory.vercel.app/).
Proyecto local Windows — Mayo 2026.

---

## Stack

| Tecnología | Versión |
|---|---|
| Next.js (App Router) | 16.2.6 |
| React | 19.2.4 |
| TypeScript | 5.x, strict |
| Tailwind CSS | v4 (`@theme inline` syntax, `@tailwindcss/postcss` plugin) |
| shadcn/ui | v4 (uses `@base-ui/react` primitives, single button component) |
| Framer Motion | ^12 |
| Recharts | ^3 |
| Lucide React | latest |

**NO usar:** React Router, CSS Modules, librerías de UI externas, tailwind v3 `@tailwind` directives with `--tw-*` CSS classes.

---

## Commands (Windows PowerShell)

```powershell
npm run dev         # localhost:3000
npm run build       # production build (includes type checking via Next)
npm run lint        # ESLint (eslint-config-next)
npx tsc --noEmit    # standalone type check
```

`npm run build` runs type checking as part of the Next.js build pipeline.

---

## Architecture

```
src/
  app/
    page.tsx              → "use client"; SimulationProvider > AppShell
    layout.tsx            → Root layout: Inter + JetBrains Mono fonts, AnimatedBackground
    globals.css           → Tailwind v4 @theme inline + CSS variables + custom utils
  components/
    app-shell.tsx          → Hash routing, nav tabs (5 views), PresentationModal
    header.tsx             → Fixed header: logo, sim controls, live clock
    global-filters.tsx     → Global filter bar (franchise/urgent/fraud) + play/pause
    kpi-cards.tsx          → 6 KPI cards with SVG sparklines
    alert-pipeline.tsx     → Horizontal pipeline (5 phases, Actual/To-Be toggle)
    pipeline-view.tsx      → Dedicated view: swimlanes + cards
    alerts-table.tsx       → Live alerts table with search & filters
    activity-log.tsx       → Real-time log panel (full & compact modes)
    state-distribution-card.tsx → Mini donut chart for sidebar
    simulation-panel.tsx   → Step-by-step alert simulator
    before-after-comparison.tsx → Actual vs Automated comparison
    whatsapp-preview.tsx   → 3 phone mockups with WhatsApp HSM
    volumetrics-chart.tsx  → 4 Recharts graphs + bottom metrics
    dashboard-view.tsx     → Dashboard: pipeline + KPIs + table + sidebar
    sistemas-view.tsx      → 7 system monitoring tabs (Online/Offline)
    metricas-view.tsx      → Analytics graphs + time filters + CSV export
    ontologia-view.tsx     → Domain model with 6 tabs
    presentation-modal.tsx → Fullscreen presentation mode
    status-legend-bar.tsx  → Sticky bottom bar with status counters
    footer.tsx             → Minimal footer
    animated-background.tsx → Subtle animated radial gradient
    ui/
      button.tsx           → Single shadcn button (uses @base-ui/react primitives)
  context/
    simulation-context.tsx → Central simulation engine: ticks, alerts, metrics, logs, filters
  types/
    index.ts              → Domain types (EstadoAlerta, Franquicia, Alerta, etc.)
  lib/
    mock-data.ts          → Mock data for BdB process
    utils.ts              → cn(), formatCOP(), formatNumber(), formatBogotaTime()
  hooks/                  → (empty, reserved by shadcn config)
```

`@/` alias maps to `src/` (tsconfig paths).

---

## SimulationContext — Critical Facts

Location: `src/context/simulation-context.tsx`

### Speed types (numeric, NOT strings)

```typescript
type SimulationSpeed = 1 | 2 | 5 | 10;  // NOT '1x' | '2x' | ...
const SPEED_INTERVALS: Record<SimulationSpeed, number> = {
  1: 3000,   // "Actual" — slow
  2: 1500,
  5: 600,
  10: 300,   // "To-Be" — fast
};
```

### Per-tick logic (verified from source)

1. **30% chance** of generating a new alert
2. **Progress existing alerts** by phase with speed-dependent probability:
   - 1× → 15%, 2× → 30%, 5× → 60%, 10× → 75%
3. **Update metrics**, **generate logs**, **cap at 50 alerts / 20 logs**

### Phase order

```
recepcion → identificacion → comunicacion → decision → registro
```

### Key constraint

- **NEVER** create `setInterval` anywhere except the context. The `useEffect` in `SimulationProvider` is the single timer.
- Consume via `const { … } = useSimulation()`. It throws if called outside provider.
- `useSimulation()` always used in `"use client"` components.
- `suppressHydrationWarning` on `<html>` and `<body>` is intentional — the clock and simulation data differ between server and client renders.

---

## Hash Routing

5 views in `app-shell.tsx`:

| Hash | View | Component |
|---|---|---|
| `#/dashboard` | Default | `DashboardView` |
| `#/pipeline` | Pipeline | `PipelineView` |
| `#/sistemas` | 7 systems | `SistemasView` |
| `#/metricas` | Analytics | `MetricasView` |
| `#/ontologia` | Domain model | `OntologiaView` |

Implemented via `window.location.hash` + `hashchange` event. `parseHash()` returns `"dashboard"` when `window` is undefined (SSR-safe). No React Router.

To add a view: create `src/components/[name]-view.tsx`, add to `views` array and `ActiveView` switch in `app-shell.tsx`.

---

## Design System Quick Reference

- **Cards:** `rounded-xl bg-white border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] p-4/p-5`
- **Numbers:** `font-mono-jetbrains` CSS class (JetBrains Mono), for all montos, IDs, tiempos
- **Badges:** `rounded-full px-2.5 py-0.5 text-[11px] font-medium`
- **Hover:** `hover-glow` CSS class → shadow-md + border-default
- **Brand colors:** `#0033A0` (blue), `#E31837` (red) — used as raw hex in Tailwind classes like `bg-[#0033A0]`
- **CSS variables** are defined in `:root` in `globals.css` — prefer `var(--bg-base)`, `var(--text-primary)`, etc.

### Badge color map

| Status | bg | text |
|---|---|---|
| Active/Success | `bg-emerald-100` | `text-emerald-700` |
| Pending | `bg-amber-100` | `text-amber-700` |
| Warning | `bg-orange-100` | `text-orange-700` |
| Error/Blocked | `bg-red-100` | `text-[#E31837]` |
| Info/Visa | `bg-blue-100` | `text-blue-700` |
| Neutral | `bg-slate-100` | `text-slate-700` |

---

## Motion System Constraints (Framer Motion)

| Pattern | Value |
|---|---|
| Block entrance | duration 0.3–0.5s |
| Stagger | `staggerChildren: 0.05` |
| Hover | duration 0.15s, `scale: 1.01` |
| Move distance | y: 4–20px max |
| Easing | `easeOut` or `linear` |
| Loop | duration 2.2s, `repeat: Infinity, linear` |

**NEVER:** `scale > 1.02`, overshoot/spring bouncy, animations longer than 0.5s for entrances.

---

## Domain Types (src/types/index.ts)

- `EstadoAlerta` enum — 8 states: PENDIENTE_REVISION → TIPIFICADO
- `Franquicia` enum — VISA, MASTERCARD, MONITOR
- `Alerta` interface — id, franquicia, tarjeta, monto, estado, tiempo, cliente, area, fecha
- `FaseProceso` interface — recepcion/identificacion/comunicacion/decision/registro (counts)
- `SimulationAlert` (in context) extends `Alerta` with `fase`, `createdAtMs`, `phaseChangedAtMs`, `flashToken`, `isFraud`, `isUrgent`

---

## Tailwind v4 Gotchas

- **Import syntax:** `@import "tailwindcss"` (not `@tailwind base; @tailwind components; @tailwind utilities;`)
- **Theme config:** `@theme inline { … }` block in `globals.css` (not `tailwind.config.js`)
- **PostCSS plugin:** `@tailwindcss/postcss` (not `tailwindcss`)
- **CSS classes used throughout:** `.glass-panel`, `.badge-compact`, `.font-mono-jetbrains`, `.hover-glow`, `.animate-pulse-soft`, `.animate-cinematic-drift`
- **shadcn v4** uses `tailwind-merge` + `clsx` (the `cn()` helper in `lib/utils.ts`), `tw-animate-css`, and `@base-ui/react` for primitive components

---

## Debugging Common Issues

- **Hydration mismatch:** Random data must be created in `useEffect` or `useMemo`, never in render body.
- **Animations not working:** Component likely missing `"use client"`.
- **Context is null:** `useSimulation()` only works inside `<SimulationProvider>` (wraps `AppShell` in `page.tsx`).
- **Build peer dependency issues:** `npm install --legacy-peer-deps` then retry.
- **CSS not applying:** Ensure using Tailwind v4 syntax (`@import "tailwindcss"`) and v4 PostCSS plugin.
