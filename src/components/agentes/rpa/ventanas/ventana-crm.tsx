"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

function VentanaCRM(props: PropsVentana) {
  return <VentanaBase {...props} ventana="crm" />;
}

export default memo(VentanaCRM);
