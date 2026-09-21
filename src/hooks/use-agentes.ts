"use client";

import { useSyncExternalStore } from "react";
import { agentesEngine } from "@/lib/agentes-engine";

export function useAgentes() {
  return useSyncExternalStore(agentesEngine.subscribe, agentesEngine.getSnapshot, agentesEngine.getSnapshot);
}
