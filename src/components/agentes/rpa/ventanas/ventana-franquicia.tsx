"use client";

import { memo } from "react";
import type { PropsVentana } from "../tipos";
import VentanaBase from "./ventana-base";

/** BRM (Visa) y EMS/MS (Mastercard): la misma pantalla de alerta con dos pieles. */
function VentanaBRMBase(props: PropsVentana) {
  return <VentanaBase {...props} ventana="brm" />;
}

function VentanaEMSBase(props: PropsVentana) {
  return <VentanaBase {...props} ventana="ems" />;
}

export const VentanaBRM = memo(VentanaBRMBase);
export const VentanaEMS = memo(VentanaEMSBase);
