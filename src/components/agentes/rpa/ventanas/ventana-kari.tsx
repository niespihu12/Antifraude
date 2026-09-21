"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

function VentanaKari(props: PropsVentana) {
  return <VentanaBase {...props} ventana="kari" />;
}

export default memo(VentanaKari);
