"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  CircleDot,
  Clock,
  CreditCard,
  Database,
  FolderTree,
  GitBranch,
  Info,
  Layers,
  ListChecks,
  LockKeyhole,
  MessageCircle,
  Monitor,
  Network,
  Scale,
  ShieldAlert,
  Smartphone,
  Target,
  User,
  Workflow,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type OntologyTab =
  | "entidades"
  | "relaciones"
  | "taxonomias"
  | "estados"
  | "reglas"
  | "glosario";

type EntityDef = {
  name: string;
  icon: LucideIcon;
  iconTone: string;
  attributes: string[];
};

type EstadoNode = {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  area: string;
  x: number;
  y: number;
};

type EstadoEdge = {
  from: string;
  to: string;
  label?: string;
};

const tabs: Array<{ id: OntologyTab; label: string; icon: LucideIcon }> = [
  { id: "entidades", label: "Entidades", icon: Network },
  { id: "relaciones", label: "Relaciones", icon: GitBranch },
  { id: "taxonomias", label: "Taxonomías", icon: FolderTree },
  { id: "estados", label: "Máquina de Estados", icon: Workflow },
  { id: "reglas", label: "Reglas de Negocio", icon: Scale },
  { id: "glosario", label: "Glosario", icon: BookOpen },
];

const ENTITIES: EntityDef[] = [
  {
    name: "AlertaTransaccional",
    icon: ShieldAlert,
    iconTone: "bg-blue-100 text-[#0033A0]",
    attributes: [
      "id",
      "franquicia",
      "monto",
      "estado",
      "fecha",
      "tarjeta",
      "clienteId",
      "area",
      "responsable",
    ],
  },
  {
    name: "Cliente",
    icon: User,
    iconTone: "bg-blue-100 text-blue-700",
    attributes: [
      "id",
      "nombre",
      "cedula",
      "celular",
      "datosActualizados",
      "fechaActualizacion",
    ],
  },
  {
    name: "TarjetaCredito",
    icon: CreditCard,
    iconTone: "bg-violet-100 text-violet-700",
    attributes: ["id", "numero", "franquicia", "estado", "limite", "clienteId"],
  },
  {
    name: "Transaccion",
    icon: GitBranch,
    iconTone: "bg-amber-100 text-amber-700",
    attributes: [
      "id",
      "monto",
      "comercio",
      "ubicacion",
      "fecha",
      "tarjetaId",
    ],
  },
  {
    name: "MensajeHSM",
    icon: Smartphone,
    iconTone: "bg-emerald-100 text-emerald-700",
    attributes: [
      "id",
      "alertaId",
      "tipo",
      "respuestaCliente",
      "fechaEnvio",
      "fechaRespuesta",
    ],
  },
  {
    name: "BloqueoTemporal",
    icon: LockKeyhole,
    iconTone: "bg-red-100 text-red-700",
    attributes: [
      "id",
      "tarjetaId",
      "fechaBloqueo",
      "fechaDesbloqueo",
      "motivo",
    ],
  },
  {
    name: "ReglaNegocio",
    icon: Scale,
    iconTone: "bg-orange-100 text-orange-700",
    attributes: [
      "id",
      "nombre",
      "condicion",
      "accion",
      "prioridad",
      "activa",
    ],
  },
  {
    name: "Orquestador",
    icon: Bot,
    iconTone: "bg-slate-100 text-slate-600",
    attributes: [
      "id",
      "nombre",
      "faseActual",
      "sistemasIntegrados",
      "slaMinutos",
      "estado",
    ],
  },
];

const ESTADOS: EstadoNode[] = [
  {
    id: "Pendiente_Revision",
    label: "Pendiente\nRevisión",
    icon: Monitor,
    color: "#3b82f6",
    area: "Recepción",
    x: 80,
    y: 200,
  },
  {
    id: "En_Verificacion_CRM",
    label: "En Verificación\nCRM",
    icon: Database,
    color: "#22d3ee",
    area: "Identificación",
    x: 260,
    y: 200,
  },
  {
    id: "WhatsApp_Enviado",
    label: "WhatsApp\nEnviado",
    icon: MessageCircle,
    color: "#10b981",
    area: "Comunicación",
    x: 440,
    y: 200,
  },
  {
    id: "Esperando_Cliente",
    label: "Esperando\nCliente",
    icon: Clock,
    color: "#10b981",
    area: "Comunicación",
    x: 620,
    y: 200,
  },
  {
    id: "Bloqueo_Preventivo",
    label: "Bloqueo\nPreventivo",
    icon: LockKeyhole,
    color: "#f59e0b",
    area: "Decisión",
    x: 800,
    y: 80,
  },
  {
    id: "Desbloqueado",
    label: "Desbloqueado",
    icon: CheckCircle2,
    color: "#22c55e",
    area: "Decisión",
    x: 980,
    y: 200,
  },
  {
    id: "Bloqueo_Definitivo",
    label: "Bloqueo\nDefinitivo",
    icon: XCircle,
    color: "#ef4444",
    area: "Decisión",
    x: 800,
    y: 320,
  },
  {
    id: "Tipificado",
    label: "Tipificado",
    icon: CheckCircle2,
    color: "#06b6d4",
    area: "Registro",
    x: 1160,
    y: 200,
  },
];

const EDGES: EstadoEdge[] = [
  { from: "Pendiente_Revision", to: "En_Verificacion_CRM" },
  { from: "En_Verificacion_CRM", to: "WhatsApp_Enviado" },
  { from: "WhatsApp_Enviado", to: "Esperando_Cliente" },
  {
    from: "Esperando_Cliente",
    to: "Bloqueo_Preventivo",
    label: "sin respuesta",
  },
  { from: "Esperando_Cliente", to: "Desbloqueado", label: "sí fui yo" },
  {
    from: "Esperando_Cliente",
    to: "Bloqueo_Definitivo",
    label: "no fui yo",
  },
  {
    from: "Bloqueo_Preventivo",
    to: "Desbloqueado",
    label: "legítima",
  },
  {
    from: "Bloqueo_Preventivo",
    to: "Bloqueo_Definitivo",
    label: "fraude",
  },
  { from: "Desbloqueado", to: "Tipificado" },
  { from: "Bloqueo_Definitivo", to: "Tipificado" },
  {
    from: "En_Verificacion_CRM",
    to: "Bloqueo_Preventivo",
    label: "sin celular",
  },
];

const FRANQUICIA_TREE = [
  {
    label: "VISA",
    pct: "~45%",
    color: "border-blue-200 bg-blue-100 text-blue-700",
    desc: "Alertas VRM y Cardinal",
    children: [
      { label: "VRM", desc: "Visa Risk Manager", color: "text-blue-400" },
      { label: "Cardinal", desc: "Validación 3DS", color: "text-blue-400" },
    ],
  },
  {
    label: "MASTERCARD",
    pct: "~40%",
    color: "border-red-200 bg-red-100 text-red-700",
    desc: "Alertas EMS/MS",
    children: [
      { label: "EMS", desc: "Enhanced Monitoring", color: "text-red-400" },
      { label: "MS", desc: "Merchant Services", color: "text-red-400" },
    ],
  },
  {
    label: "MONITOR",
    pct: "~15%",
    color: "border-slate-200 bg-slate-100 text-slate-600",
    desc: "Motor interno del banco",
    children: [],
  },
];

const TIPOS_VALIDACION = [
  {
    categoria: "Identificación",
    color: "border-blue-200 bg-blue-100 text-[#0033A0]",
    items: [
      "Cliente en CRM",
      "Celular actualizado",
      "Cruce dispositivo",
      "Ubicación coherente",
    ],
  },
  {
    categoria: "Comunicación",
    color: "border-emerald-200 bg-emerald-100 text-emerald-700",
    items: [
      "HSM enviado",
      "Respuesta del cliente",
      "SLA 40 min",
      "Reintento automático",
    ],
  },
  {
    categoria: "Riesgo",
    color: "border-amber-200 bg-amber-100 text-amber-700",
    items: [
      "Monto atípico",
      "Patrón histórico",
      "Comercio sospechoso",
      "Score Cardinal",
    ],
  },
  {
    categoria: "Bloqueo",
    color: "border-red-200 bg-red-100 text-red-700",
    items: [
      "Bloqueo preventivo PPE",
      "Desbloqueo confirmado",
      "Bloqueo definitivo",
      "Escalamiento manual",
    ],
  },
  {
    categoria: "Operativas",
    color: "border-violet-200 bg-violet-100 text-violet-700",
    items: [
      "Tipificación CRM",
      "Trazabilidad bitácora",
      "Cierre automático",
      "Auditoría 24/7",
    ],
  },
];

const AREAS_PROCESO = [
  {
    area: "Recepción",
    color: "border-blue-200 bg-blue-100 text-blue-700",
    rol: "Orquestador / Monitor",
    sistemas: "Monitor, VRM, EMS/MS",
    actividades: "Normalización y enrutamiento de alertas",
    duracion: "7 min",
  },
  {
    area: "Identificación",
    color: "border-blue-200 bg-blue-100 text-[#0033A0]",
    rol: "Bot CRM",
    sistemas: "CRM Banco",
    actividades: "Cruce cliente, celular y datos de contacto",
    duracion: "8 min",
  },
  {
    area: "Comunicación",
    color: "border-emerald-200 bg-emerald-100 text-emerald-700",
    rol: "Kari AI",
    sistemas: "Kari AI, WhatsApp",
    actividades: "Envío HSM y espera de respuesta",
    duracion: "10 min",
  },
  {
    area: "Decisión",
    color: "border-amber-200 bg-amber-100 text-amber-700",
    rol: "Cardinal / PPE",
    sistemas: "Cardinal, PPE",
    actividades: "Bloqueo, desbloqueo o escalamiento",
    duracion: "9 min",
  },
  {
    area: "Registro",
    color: "border-blue-200 bg-blue-100 text-[#0033A0]",
    rol: "CRM / Bitácora",
    sistemas: "CRM Banco, PPE",
    actividades: "Tipificación y cierre de caso",
    duracion: "6 min",
  },
];

const REGLAS = [
  {
    n: 1,
    regla: "Celular actualizado en CRM",
    condicion: "Sin celular o dato desactualizado",
    accion: "Escalar a monitoreo manual",
    severidad: "Bloqueante",
  },
  {
    n: 2,
    regla: "Bloqueo preventivo automático",
    condicion: "Alerta de alto riesgo recibida",
    accion: "Bloquear en PPE de inmediato",
    severidad: "Bloqueante",
  },
  {
    n: 3,
    regla: "Confirmación del cliente",
    condicion: 'Respuesta "Sí fui yo"',
    accion: "Desbloquear y tipificar como legítima",
    severidad: "Operativa",
  },
  {
    n: 4,
    regla: "Negación del cliente",
    condicion: 'Respuesta "No fui yo"',
    accion: "Bloqueo definitivo en PPE",
    severidad: "Bloqueante",
  },
  {
    n: 5,
    regla: "SLA sin respuesta",
    condicion: "Sin respuesta después de 40 min",
    accion: "Mantener bloqueo preventivo",
    severidad: "Advertencia",
  },
  {
    n: 6,
    regla: "Monto atípico",
    condicion: "Supera patrón histórico del cliente",
    accion: "Priorizar comunicación WhatsApp",
    severidad: "Advertencia",
  },
  {
    n: 7,
    regla: "Franquicia Visa",
    condicion: "Origen VRM o Cardinal",
    accion: "Enrutar por canal Visa",
    severidad: "Operativa",
  },
  {
    n: 8,
    regla: "Franquicia Mastercard",
    condicion: "Origen EMS/MS",
    accion: "Enrutar por canal Mastercard",
    severidad: "Operativa",
  },
  {
    n: 9,
    regla: "Falso positivo recurrente",
    condicion: "Cliente con 3+ desbloqueos legítimos",
    accion: "Marcar perfil de bajo riesgo",
    severidad: "Operativa",
  },
  {
    n: 10,
    regla: "Reintento HSM",
    condicion: "Sin respuesta en 15 min",
    accion: "Reenviar plantilla WhatsApp",
    severidad: "Operativa",
  },
  {
    n: 11,
    regla: "Tipificación obligatoria",
    condicion: "Caso resuelto sin tipificación",
    accion: "Bloquear cierre hasta registrar CRM",
    severidad: "Bloqueante",
  },
  {
    n: 12,
    regla: "Operación 24/7",
    condicion: "Alerta fuera de horario laboral",
    accion: "Procesar con orquestador automático",
    severidad: "Operativa",
  },
];

const GLOSARIO = [
  {
    term: "HSM",
    def: "Plantilla aprobada de WhatsApp para mensajes transaccionales al cliente.",
  },
  {
    term: "PPE",
    def: "Sistema operativo de bloqueo y desbloqueo preventivo de tarjetas.",
  },
  {
    term: "VRM",
    def: "Visa Risk Manager — fuente externa de alertas de fraude Visa.",
  },
  {
    term: "EMS/MS",
    def: "Canales Mastercard para monitoreo y alertamiento de transacciones.",
  },
  {
    term: "Monitor",
    def: "Motor interno del banco para detección de alertas.",
  },
  {
    term: "Kari AI",
    def: "Bot conversacional que gestiona la comunicación por WhatsApp.",
  },
  {
    term: "Cardinal",
    def: "Motor de validación 3DS y scoring de riesgo para transacciones Visa.",
  },
  {
    term: "Orquestador",
    def: "Capa central que coordina Monitor, CRM, Kari AI y PPE en un solo flujo.",
  },
  {
    term: "Falso positivo",
    def: "Alerta que resulta ser una compra legítima del titular (~70-80% del volumen).",
  },
  {
    term: "Tipificación",
    def: "Registro final del resultado en CRM con categoría de cierre.",
  },
  {
    term: "SLA",
    def: "Tiempo máximo acordado para gestionar una alerta (40 min promedio).",
  },
  {
    term: "Bloqueo preventivo",
    def: "Restricción temporal de la tarjeta mientras se confirma legitimidad.",
  },
];

const AREA_COLORS: Record<string, string> = {
  Recepción: "#3b82f6",
  Identificación: "#1E4DB3",
  Comunicación: "#10b981",
  Decisión: "#f59e0b",
  Registro: "#0033A0",
};

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[#0033A0]">{icon}</span>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      <p className="ml-6 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function EntityCard({ entity, index }: { entity: EntityDef; index: number }) {
  const Icon = entity.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-shadow hover:shadow-lg hover:shadow-blue-100"
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${entity.iconTone}`}
        >
          <Icon className="size-5" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">{entity.name}</h3>
      </div>
      <div className="space-y-1.5">
        {entity.attributes.map((attr) => (
          <div key={attr} className="flex items-center gap-2">
            <CircleDot className="size-3 text-slate-600" />
            <span className="font-mono-jetbrains text-xs text-slate-400">
              {attr}
            </span>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

function RelationDiagram() {
  const level1 = [
    {
      id: "AlertaTransaccional",
      x: 520,
      y: 55,
      color: "#22d3ee",
      icon: ShieldAlert,
      subtitle: "Evento principal",
    },
  ];
  const level2 = [
    {
      id: "Cliente",
      x: 110,
      y: 220,
      color: "#3b82f6",
      icon: User,
      subtitle: "Titular",
    },
    {
      id: "TarjetaCredito",
      x: 310,
      y: 220,
      color: "#8b5cf6",
      icon: CreditCard,
      subtitle: "Instrumento",
    },
    {
      id: "Transaccion",
      x: 520,
      y: 220,
      color: "#f59e0b",
      icon: GitBranch,
      subtitle: "Movimiento",
    },
    {
      id: "MensajeHSM",
      x: 730,
      y: 220,
      color: "#10b981",
      icon: Smartphone,
      subtitle: "WhatsApp",
    },
    {
      id: "Orquestador",
      x: 930,
      y: 220,
      color: "#94a3b8",
      icon: Bot,
      subtitle: "Coordinador",
    },
  ];
  const level3 = [
    {
      id: "BloqueoTemporal",
      x: 310,
      y: 380,
      color: "#ef4444",
      icon: LockKeyhole,
      subtitle: "PPE",
    },
    {
      id: "ReglaNegocio",
      x: 730,
      y: 380,
      color: "#f97316",
      icon: Scale,
      subtitle: "Motor reglas",
    },
  ];

  const nodeW = 120;
  const nodeH = 44;

  const bezierPaths = [
    {
      d: "M 470 108 C 470 150, 110 150, 110 198",
      label: "pertenece a",
      card: "N:1",
      color: "#3b82f6",
    },
    {
      d: "M 490 108 C 480 148, 310 148, 310 198",
      label: "afecta",
      card: "1:1",
      color: "#8b5cf6",
    },
    {
      d: "M 550 108 C 550 148, 520 148, 520 198",
      label: "origina",
      card: "1:1",
      color: "#f59e0b",
    },
    {
      d: "M 590 108 C 630 148, 730 148, 730 198",
      label: "genera",
      card: "1:1",
      color: "#10b981",
    },
    {
      d: "M 610 108 C 680 148, 930 148, 930 198",
      label: "orquesta",
      card: "1:N",
      color: "#94a3b8",
    },
    {
      d: "M 260 242 C 260 290, 310 330, 310 358",
      label: "bloquea",
      card: "0..1",
      color: "#ef4444",
      note: "preventivo",
    },
    {
      d: "M 790 242 C 790 290, 730 330, 730 358",
      label: "evalúa",
      card: "N:M",
      color: "#f97316",
    },
    {
      d: "M 370 242 C 420 270, 450 270, 490 242",
      label: "dispara",
      card: "1:1",
      color: "#94a3b8",
      dashed: true,
    },
    {
      d: "M 930 242 C 860 300, 400 340, 350 358",
      label: "ejecuta",
      card: "1:N",
      color: "#94a3b8",
      dashed: true,
      note: "PPE",
    },
  ];

  function renderNode(
    node: {
      id: string;
      x: number;
      y: number;
      color: string;
      icon: LucideIcon;
      subtitle: string;
    },
    isLevel1: boolean,
    delay: number,
  ) {
    const Icon = node.icon;
    const h = isLevel1 ? 60 : nodeH;
    const w = nodeW;

    return (
      <g key={node.id}>
        <motion.rect
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay, type: "spring", stiffness: 200 }}
          x={node.x - w / 2}
          y={node.y - (isLevel1 ? 30 : 22)}
          width={w}
          height={h}
          rx={isLevel1 ? 12 : 10}
          fill={isLevel1 ? "rgba(34,211,238,0.08)" : "rgba(26,26,26,0.9)"}
          stroke={node.color}
          strokeWidth={isLevel1 ? 2.5 : 2}
        />
        <foreignObject
          x={node.x - 52}
          y={node.y - (isLevel1 ? 22 : 16)}
          width="32"
          height="32"
        >
          <div
            style={{ color: node.color }}
            className="flex h-full items-center justify-center"
          >
            <Icon className={isLevel1 ? "size-6" : "size-5"} />
          </div>
        </foreignObject>
        <text
          x={node.x + 6}
          y={node.y - 2}
          textAnchor="middle"
          fill="#f8fafc"
          style={{ fontSize: isLevel1 ? 13 : 11, fontWeight: 700 }}
        >
          {node.id}
        </text>
        <text
          x={node.x + 6}
          y={node.y + 14}
          textAnchor="middle"
          fill="#94a3b8"
          style={{ fontSize: 9 }}
        >
          {node.subtitle}
        </text>
      </g>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <div className="min-w-[1050px]">
        <div className="mb-5 flex flex-wrap items-center gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded-full bg-slate-400" /> Obligatoria
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-5 rounded-full"
              style={{ borderTop: "2px dashed #64748b" }}
            />{" "}
            Indirecta
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono-jetbrains text-[10px] font-bold text-[#0033A0]">
              1:N
            </span>{" "}
            Cardinalidad
          </div>
          <div className="ml-auto text-[10px] italic text-slate-600">
            Niveles jerárquicos del modelo antifraude
          </div>
        </div>

        <svg viewBox="0 0 1050 450" className="h-auto w-full">
          <defs>
            <marker
              id="arrowOnt"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
            </marker>
          </defs>

          {bezierPaths.map((p, i) => (
            <g key={i}>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={p.dashed ? 1.5 : 2}
                strokeDasharray={p.dashed ? "6 3" : "none"}
                opacity={p.dashed ? 0.5 : 0.7}
                markerEnd="url(#arrowOnt)"
              />
              {(() => {
                const pts = p.d.match(
                  /M\s+([\d.]+)\s+([\d.]+).*?([\d.]+)\s+([\d.]+)$/,
                );
                if (!pts) return null;
                const mx = (parseFloat(pts[1]) + parseFloat(pts[3])) / 2;
                const my = (parseFloat(pts[2]) + parseFloat(pts[4])) / 2;
                return (
                  <g>
                    <rect
                      x={mx - 40}
                      y={my - 10}
                      width="80"
                      height="16"
                      rx="5"
                      fill="#1a1a1a"
                      stroke="#333"
                      strokeWidth={0.8}
                    />
                    <text
                      x={mx}
                      y={my + 2}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      style={{ fontSize: 8, fontWeight: 600 }}
                    >
                      {p.label}
                    </text>
                    <rect
                      x={mx + 34}
                      y={my - 14}
                      width="24"
                      height="10"
                      rx="3"
                      fill="rgba(34,211,238,0.15)"
                      stroke="rgba(34,211,238,0.3)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={mx + 46}
                      y={my - 7}
                      textAnchor="middle"
                      fill="#22d3ee"
                      style={{ fontSize: 6, fontWeight: 700 }}
                    >
                      {p.card}
                    </text>
                    {p.note && (
                      <text
                        x={mx}
                        y={my + 20}
                        textAnchor="middle"
                        fill="#64748b"
                        style={{ fontSize: 7, fontStyle: "italic" }}
                      >
                        ({p.note})
                      </text>
                    )}
                  </g>
                );
              })()}
            </g>
          ))}

          {level1.map((node) => renderNode(node, true, 0.1))}
          {[...level2, ...level3].map((node, i) =>
            renderNode(node, false, 0.3 + i * 0.06),
          )}

          <text
            x="18"
            y="65"
            fill="#64748b"
            style={{ fontSize: 10, fontWeight: 700 }}
          >
            NIVEL 1
          </text>
          <text
            x="18"
            y="228"
            fill="#64748b"
            style={{ fontSize: 10, fontWeight: 700 }}
          >
            NIVEL 2
          </text>
          <text
            x="18"
            y="388"
            fill="#64748b"
            style={{ fontSize: 10, fontWeight: 700 }}
          >
            NIVEL 3
          </text>
          <line x1="12" y1="72" x2="12" y2="108" stroke="#333" strokeWidth={1.5} />
          <line
            x1="12"
            y1="235"
            x2="12"
            y2="268"
            stroke="#333"
            strokeWidth={1.5}
          />
          <line
            x1="12"
            y1="395"
            x2="12"
            y2="420"
            stroke="#333"
            strokeWidth={1.5}
          />
        </svg>
      </div>
    </div>
  );
}

function TaxonomyTree() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          icon={<FolderTree className="size-5" />}
          title="Franquicias y Fuentes"
          subtitle="Clasificación del volumen de alertas por origen"
        />
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <div className="flex items-start gap-6">
            <div className="flex shrink-0 flex-col items-center pt-4">
              <div className="flex size-20 items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-100">
                <ShieldAlert className="size-8 text-[#0033A0]" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-600">
                Alerta
              </span>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 xl:grid-cols-3">
              {FRANQUICIA_TREE.map((tipo, i) => (
                <motion.div
                  key={tipo.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="space-y-2"
                >
                  <div className={`rounded-lg border p-3 ${tipo.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{tipo.label}</span>
                      <span className="font-mono-jetbrains text-[10px] opacity-70">
                        {tipo.pct}
                      </span>
                    </div>
                    {tipo.desc && (
                      <p className="mt-1 text-[10px] leading-tight opacity-80">
                        {tipo.desc}
                      </p>
                    )}
                  </div>
                  {tipo.children.length > 0 && (
                    <div className="space-y-1 border-l-2 border-[var(--border-subtle)] pl-3">
                      {tipo.children.map((child) => (
                        <div
                          key={child.label}
                          className="py-1 text-[11px] text-slate-400"
                        >
                          <span className={child.color}>{child.label}</span>
                          {child.desc && (
                            <span className="ml-1 text-slate-600">
                              — {child.desc}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={<ListChecks className="size-5" />}
          title="Tipos de Validación"
          subtitle="Categorías de validaciones aplicadas al proceso antifraude"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TIPOS_VALIDACION.map((cat, i) => (
            <motion.div
              key={cat.categoria}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
            >
              <div
                className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cat.color}`}
              >
                <CheckCircle2 className="size-3" />
                {cat.categoria}
              </div>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-slate-400"
                  >
                    <div className="size-1.5 rounded-full bg-slate-600" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle
          icon={<ArrowLeftRight className="size-5" />}
          title="Áreas del Proceso"
          subtitle="Flujo de trabajo a través de las fases del orquestador"
        />
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <div className="flex flex-col items-stretch gap-3 lg:flex-row">
            {AREAS_PROCESO.map((area, i) => (
              <motion.div
                key={area.area}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-1 items-center gap-2"
              >
                <div className={`flex-1 rounded-lg border p-3 ${area.color}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Layers className="size-4" />
                    <span className="text-xs font-bold">{area.area}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-start gap-1">
                      <User className="mt-0.5 size-3 shrink-0" />
                      {area.rol}
                    </div>
                    <div className="flex items-start gap-1">
                      <Monitor className="mt-0.5 size-3 shrink-0" />
                      {area.sistemas}
                    </div>
                    <div className="flex items-start gap-1">
                      <Target className="mt-0.5 size-3 shrink-0" />
                      {area.actividades}
                    </div>
                    <div className="flex items-start gap-1">
                      <Clock className="mt-0.5 size-3 shrink-0" />
                      {area.duracion}
                    </div>
                  </div>
                </div>
                {i < AREAS_PROCESO.length - 1 && (
                  <ArrowRight className="hidden size-4 shrink-0 text-slate-600 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StateMachineDiagram() {
  const nodeMap = Object.fromEntries(ESTADOS.map((e) => [e.id, e]));

  function getPort(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const r = 22;
    return {
      x: fromX + r * Math.cos(angle),
      y: fromY + r * Math.sin(angle),
    };
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <div className="min-w-[1240px]">
        <svg viewBox="0 0 1240 400" className="h-auto w-full">
          <defs>
            <marker
              id="arrowhead-sm"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
            </marker>
            {Object.entries(AREA_COLORS).map(([area, color]) => (
              <marker
                key={area}
                id={`arrow-${area}`}
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={color} />
              </marker>
            ))}
          </defs>

          {Object.entries(AREA_COLORS).map(([area, color]) => {
            const areaEstados = ESTADOS.filter((e) => e.area === area);
            if (areaEstados.length === 0) return null;
            const minX = Math.min(...areaEstados.map((e) => e.x)) - 50;
            const maxX = Math.max(...areaEstados.map((e) => e.x)) + 50;
            return (
              <g key={area}>
                <rect
                  x={minX}
                  y={10}
                  width={maxX - minX}
                  height="30"
                  rx="6"
                  fill={color}
                  opacity="0.08"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={(minX + maxX) / 2}
                  y="30"
                  textAnchor="middle"
                  fill={color}
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  {area}
                </text>
              </g>
            );
          })}

          {EDGES.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            const f = getPort(from.x, from.y, to.x, to.y);
            const t = getPort(to.x, to.y, from.x, from.y);
            const markerId =
              `arrow-${from.area}` in AREA_COLORS
                ? `url(#arrow-${from.area})`
                : "url(#arrowhead-sm)";
            const isBranch =
              edge.to === "Bloqueo_Preventivo" ||
              edge.to === "Bloqueo_Definitivo";
            const strokeColor = isBranch
              ? "#64748b"
              : AREA_COLORS[from.area] || "#64748b";

            return (
              <g key={i}>
                {isBranch && from.y !== to.y ? (
                  <>
                    <path
                      d={`M ${f.x} ${f.y} Q ${f.x} ${(f.y + t.y) / 2} ${(f.x + t.x) / 2} ${(f.y + t.y) / 2} Q ${t.x} ${(f.y + t.y) / 2} ${t.x} ${t.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={1.5}
                      strokeDasharray="4"
                      markerEnd={markerId}
                    />
                    {edge.label && (
                      <text
                        x={(f.x + t.x) / 2}
                        y={(f.y + t.y) / 2 + 14}
                        textAnchor="middle"
                        fill="#64748b"
                        style={{ fontSize: 9 }}
                      >
                        {edge.label}
                      </text>
                    )}
                  </>
                ) : (
                  <>
                    <motion.line
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                      x1={f.x}
                      y1={f.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={strokeColor}
                      strokeWidth={1.5}
                      markerEnd={markerId}
                    />
                    {edge.label && (
                      <text
                        x={(f.x + t.x) / 2}
                        y={(f.y + t.y) / 2 - 4}
                        textAnchor="middle"
                        fill="#64748b"
                        style={{ fontSize: 9 }}
                      >
                        {edge.label}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {ESTADOS.map((estado, i) => {
            const Icon = estado.icon;
            return (
              <g key={estado.id}>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.3 + i * 0.03,
                    type: "spring",
                    stiffness: 250,
                  }}
                  cx={estado.x}
                  cy={estado.y}
                  r="22"
                  fill="#1a1a1a"
                  stroke={estado.color}
                  strokeWidth={2.5}
                />
                <foreignObject
                  x={estado.x - 8}
                  y={estado.y - 10}
                  width="16"
                  height="16"
                >
                  <div
                    style={{
                      color: estado.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon className="size-4" />
                  </div>
                </foreignObject>
                <text
                  x={estado.x}
                  y={estado.y + 36}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  style={{ fontSize: 9, fontWeight: 500 }}
                >
                  {estado.label.split("\n").map((line, j) => (
                    <tspan key={j} x={estado.x} dy={j === 0 ? 0 : 11}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function RulesTable() {
  const severityStyle = (s: string) => {
    switch (s) {
      case "Bloqueante":
        return "border-red-200 bg-red-100 text-red-700";
      case "Advertencia":
        return "border-amber-200 bg-amber-100 text-amber-700";
      case "Operativa":
        return "border-blue-200 bg-blue-100 text-[#0033A0]";
      default:
        return "border-slate-200 bg-slate-100 text-slate-600";
    }
  };

  const severityIcon = (s: string) => {
    switch (s) {
      case "Bloqueante":
        return <XCircle className="size-3" />;
      case "Advertencia":
        return <AlertTriangle className="size-3" />;
      case "Operativa":
        return <Info className="size-3" />;
      default:
        return <Info className="size-3" />;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Regla
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Condición
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Acción
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Severidad
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {REGLAS.map((regla, i) => (
              <motion.tr
                key={regla.n}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-mono-jetbrains text-xs text-slate-600">
                  {regla.n}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-slate-700">
                  {regla.regla}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {regla.condicion}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {regla.accion}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${severityStyle(regla.severidad)}`}
                  >
                    {severityIcon(regla.severidad)}
                    {regla.severidad}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GlosarioList() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {GLOSARIO.map((item, i) => (
        <motion.div
          key={item.term}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-[#0033A0]">
            <BookOpen className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{item.term}</h4>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
              {item.def}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function OntologiaView() {
  const [activeTab, setActiveTab] = useState<OntologyTab>("entidades");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-[#0033A0]">
            <Network className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Ontología del Proceso
            </h1>
            <p className="text-sm text-slate-500">
              Modelo completo del dominio de Alertas Antifraude
            </p>
          </div>
        </div>
      </motion.div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#0033A0] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "entidades" && (
          <motion.div
            key="entidades"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SectionTitle
              icon={<Network className="size-5" />}
              title="Entidades del Dominio"
              subtitle="Entidades principales y sus atributos en el modelo antifraude"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ENTITIES.map((entity, i) => (
                <EntityCard key={entity.name} entity={entity} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "relaciones" && (
          <motion.div
            key="relaciones"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SectionTitle
              icon={<GitBranch className="size-5" />}
              title="Relaciones entre Entidades"
              subtitle="Diagrama jerárquico del modelo de dominio antifraude"
            />
            <RelationDiagram />
          </motion.div>
        )}

        {activeTab === "taxonomias" && (
          <motion.div
            key="taxonomias"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TaxonomyTree />
          </motion.div>
        )}

        {activeTab === "estados" && (
          <motion.div
            key="estados"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SectionTitle
              icon={<Workflow className="size-5" />}
              title="Máquina de Estados"
              subtitle="Estados y transiciones del ciclo de vida de una alerta transaccional"
            />
            <StateMachineDiagram />
          </motion.div>
        )}

        {activeTab === "reglas" && (
          <motion.div
            key="reglas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SectionTitle
              icon={<BookOpen className="size-5" />}
              title="Reglas de Negocio"
              subtitle="Reglas que rigen el procesamiento automatizado de alertas"
            />
            <RulesTable />
          </motion.div>
        )}

        {activeTab === "glosario" && (
          <motion.div
            key="glosario"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SectionTitle
              icon={<BookOpen className="size-5" />}
              title="Glosario"
              subtitle="Términos y definiciones clave del proceso antifraude"
            />
            <GlosarioList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
