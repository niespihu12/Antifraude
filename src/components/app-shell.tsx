"use client";

import {
  BarChart3,
  Bot,
  GitBranch,
  LayoutDashboard,
  Monitor,
  Network,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AgentesView } from "@/components/agentes-view";
import { AutomationDemoView } from "@/components/automation-demo-view";
import { DashboardView } from "@/components/dashboard-view";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MetricasView } from "@/components/metricas-view";
import { OntologiaView } from "@/components/ontologia-view";
import { PipelineView } from "@/components/pipeline-view";
import { PresentationModal } from "@/components/presentation-modal";
import { SistemasView } from "@/components/sistemas-view";
import { StatusLegendBar } from "@/components/status-legend-bar";

export type View = "dashboard" | "pipeline" | "sistemas" | "metricas" | "ontologia" | "demo" | "agentes";

const views: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "demo", label: "Automatización en Acción", icon: Sparkles },
  { id: "agentes", label: "Agentes", icon: Bot },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "sistemas", label: "Sistemas", icon: Monitor },
  { id: "metricas", label: "Métricas", icon: BarChart3 },
  { id: "ontologia", label: "Ontología", icon: Network },
];

function parseHash(): View {
  if (typeof window === "undefined") {
    return "dashboard";
  }

  const raw = window.location.hash.replace(/^#\/?/, "");
  const candidate = raw || "dashboard";

  return views.some((view) => view.id === candidate)
    ? (candidate as View)
    : "dashboard";
}

function setHash(view: View) {
  window.location.hash = `#/${view}`;
}

function NavigationTabs({ activeView }: { activeView: View }) {
  return (
    <nav data-shell="tabs" className="fixed left-0 right-0 top-14 z-40 border-b border-slate-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-md lg:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto">
        {views.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;

          return (
            <button
              key={view.id}
              type="button"
              onClick={() => setHash(view.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
                active
                  ? "bg-[#0033A0] font-medium text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              {view.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ActiveView({ view }: { view: View }) {
  switch (view) {
    case "pipeline":
      return <PipelineView />;
    case "demo":
      return <AutomationDemoView />;
    case "agentes":
      return <AgentesView />;
    case "sistemas":
      return <SistemasView />;
    case "metricas":
      return <MetricasView />;
    case "ontologia":
      return <OntologiaView />;
    case "dashboard":
    default:
      return <DashboardView />;
  }
}

export function AppShell() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [presentationOpen, setPresentationOpen] = useState(false);

  useEffect(() => {
    const syncHash = () => {
      const nextView = parseHash();
      setActiveView(nextView);

      if (!window.location.hash) {
        window.history.replaceState(null, "", "#/dashboard");
      }
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <>
      <Header onPresentationMode={() => setPresentationOpen(true)} />
      <NavigationTabs activeView={activeView} />

      <main data-shell="main" className="relative z-10 min-h-screen bg-[var(--bg-base)] px-4 pb-20 pt-[7.25rem] text-[var(--text-primary)] lg:px-6">
        <div className={activeView === "agentes" ? "mx-auto max-w-[1920px]" : "mx-auto max-w-7xl"}>
          <ActiveView view={activeView} />
          {activeView === "dashboard" ? <Footer /> : null}
        </div>
      </main>

      <StatusLegendBar />
      <PresentationModal
        open={presentationOpen}
        onClose={() => setPresentationOpen(false)}
      />
    </>
  );
}
