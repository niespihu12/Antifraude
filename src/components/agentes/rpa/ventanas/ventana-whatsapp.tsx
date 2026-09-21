"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

function VentanaWhatsapp(props: PropsVentana) {
  return <VentanaBase {...props} ventana="whatsapp" />;
}

export default memo(VentanaWhatsapp);
