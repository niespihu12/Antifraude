"use client";

import { AppShell } from "@/components/app-shell";
import { SimulationProvider } from "@/context/simulation-context";

export default function Home() {
  return (
    <SimulationProvider>
      <AppShell />
    </SimulationProvider>
  );
}
