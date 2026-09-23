import type { Guiones } from "./tipos";
import { monitor } from "./monitor";
import { vrmEms } from "./vrm-ems";
import { crm } from "./crm";
import { revision } from "./revision";
import { kari } from "./kari";
import { whatsapp } from "./whatsapp";
import { ppe } from "./ppe";
import { expediente } from "./expediente";

export const GUIONES: Guiones = {
  ...monitor,
  ...vrmEms,
  ...crm,
  ...revision,
  ...kari,
  ...whatsapp,
  ...ppe,
  ...expediente,
};
