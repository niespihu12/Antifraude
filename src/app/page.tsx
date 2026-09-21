"use client";

import { AppShell } from "@/components/app-shell";
import { AgentesBridge } from "@/context/agentes-bridge";
import { SimulationProvider } from "@/context/simulation-context";

export default function Home() {
  return (
    <SimulationProvider>
      <AgentesBridge />
      <AppShell />
    </SimulationProvider>
  );
}
