"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

function VentanaPPE(props: PropsVentana) {
  return <VentanaBase {...props} ventana="ppe" />;
}

export default memo(VentanaPPE);
