import type { Guiones } from "./tipos";
import { monitor } from "./monitor";
import { brmEms } from "./brm-ems";
import { crm } from "./crm";
import { revision } from "./revision";
import { kari } from "./kari";
import { whatsapp } from "./whatsapp";
import { ppe } from "./ppe";
import { expediente } from "./expediente";

export const GUIONES: Guiones = {
  ...monitor,
  ...brmEms,
  ...crm,
  ...revision,
  ...kari,
  ...whatsapp,
  ...ppe,
  ...expediente,
};
