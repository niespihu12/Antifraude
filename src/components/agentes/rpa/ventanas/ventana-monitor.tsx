"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

function VentanaMonitor(props: PropsVentana) {
  return <VentanaBase {...props} ventana="monitor" />;
}

export default memo(VentanaMonitor);
