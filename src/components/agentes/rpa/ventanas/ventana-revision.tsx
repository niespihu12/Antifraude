"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

function VentanaRevision(props: PropsVentana) {
  return <VentanaBase {...props} ventana="revision" />;
}

export default memo(VentanaRevision);
