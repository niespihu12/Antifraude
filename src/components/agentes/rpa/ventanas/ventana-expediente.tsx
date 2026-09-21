"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

function VentanaExpediente(props: PropsVentana) {
  return <VentanaBase {...props} ventana="expediente" />;
}

export default memo(VentanaExpediente);
