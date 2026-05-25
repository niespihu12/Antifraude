"use client";

import {
  AlertTriangle,
  Bell,
  ClipboardList,
  Clock,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { filterLabels, useSimulation } from "@/context/simulation-context";
import { formatNumber } from "@/lib/utils";

type KpiTheme = "cyan" | "red" | "amber" | "blue" | "emerald";

type KpiCardData = {
  label: string;
  value: number;
  suffix?: string;
  trend: string;
  tone: KpiTheme;
  icon: typeof Bell;
  status: "good" | "bad" | "warning";
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
} as const;

function useCountUp(target: number, duration: number) {
  const [value, setValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const start = previous.current;
    const delta = target - start;
    let frame = 0;
    let startTime = 0;

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + delta * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);
    previous.current = target;

    return () => window.cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function themeClasses(tone: KpiTheme) {
  switch (tone) {
    case "cyan":
      return {
        glow: "",
        circle: "bg-blue-100 text-[#0033A0]",
        icon: "text-[#0033A0]",
      };
    case "red":
      return {
        glow: "",
        circle: "bg-red-100 text-red-700",
        icon: "text-red-700",
      };
    case "amber":
      return {
        glow: "",
        circle: "bg-amber-100 text-amber-700",
        icon: "text-amber-700",
      };
    case "blue":
      return {
        glow: "",
        circle: "bg-blue-100 text-blue-700",
        icon: "text-blue-700",
      };
    case "emerald":
    default:
      return {
        glow: "",
        circle: "bg-emerald-100 text-emerald-700",
        icon: "text-emerald-700",
      };
  }
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 80;
  const height = 30;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className="shrink-0">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#gradient-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function TrendBadge({ status, text }: { status: KpiCardData["status"]; text: string }) {
  const arrow = status === "good" ? "↑" : status === "bad" ? "↓" : "→";
  const percentage = status === "good" ? "+12%" : status === "bad" ? "-8%" : "0%";

  if (status === "bad") {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs text-red-600">
          {arrow} {percentage}
        </span>
        <span className="text-[10px] text-slate-500">{text}</span>
      </div>
    );
  }

  if (status === "warning") {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs text-amber-600">
          {arrow} {percentage}
        </span>
        <span className="text-[10px] text-slate-500">{text}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs text-emerald-600">
        {arrow} {percentage}
      </span>
      <span className="text-[10px] text-slate-500">{text}</span>
    </div>
  );
}

export function KpiCards() {
  const { activeFilter, metrics, speed } = useSimulation();
  const isToBe = speed >= 5;
  const responseSuffix = isToBe ? " seg" : " min";
  const responseStatus: KpiCardData["status"] = isToBe ? "good" : "bad";
  const contactability = isToBe ? 95 : 70;

  const sparklineData: Record<string, number[]> = {
    "Alertas Recibidas": [650, 680, 700, 720, 700, 710],
    "Alertas Gestionadas": [18, 19, 21, 22, 24, 28],
    "Falsos Positivos": [80, 78, 76, 75, 74, 72],
    "Tiempo Respuesta": [45, 42, 40, 38, 35, 32],
    "Fraude Bloqueado": [50, 50, 50, 50, 50, 50],
    "Contactabilidad WA": [65, 67, 68, 70, 71, 72],
  };

  const sparklineColors: Record<string, string> = {
    "Alertas Recibidas": "#0033A0",
    "Alertas Gestionadas": "#059669",
    "Falsos Positivos": "#D97706",
    "Tiempo Respuesta": "#E31837",
    "Fraude Bloqueado": "#1E4DB3",
    "Contactabilidad WA": "#059669",
  };

  const kpiCards: KpiCardData[] = [
    {
      label: "Alertas Recibidas",
      value: metrics.totalAlerts,
      trend: filterLabels[activeFilter],
      tone: "cyan",
      icon: Bell,
      status: "good",
    },
    {
      label: "Alertas Gestionadas",
      value: metrics.processedToday,
      trend: "Fases 2-5",
      tone: isToBe ? "emerald" : "red",
      icon: ClipboardList,
      status: isToBe ? "good" : "bad",
    },
    {
      label: "Falsos Positivos",
      value: metrics.falsePositives,
      suffix: "%",
      trend: isToBe ? "Objetivo IA" : "Actual simulado",
      tone: isToBe ? "emerald" : "amber",
      icon: AlertTriangle,
      status: isToBe ? "good" : "warning",
    },
    {
      label: "Tiempo Respuesta",
      value: metrics.avgResponseTime,
      suffix: responseSuffix,
      trend: isToBe ? "To-Be activo" : "Modo actual",
      tone: isToBe ? "emerald" : "red",
      icon: Clock,
      status: responseStatus,
    },
    {
      label: "Fraude Bloqueado",
      value: metrics.fraudBlocked,
      trend: "Decisión + registro",
      tone: "blue",
      icon: ShieldCheck,
      status: "good",
    },
    {
      label: "Contactabilidad WA",
      value: contactability,
      suffix: "%",
      trend: isToBe ? "Kari AI activo" : "Canal base",
      tone: "emerald",
      icon: MessageCircle,
      status: "good",
    },
  ];

  return (
    <motion.section
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {kpiCards.map((card) => {
        return (
          <KpiCardItem 
            key={card.label} 
            card={card} 
            sparklineData={sparklineData[card.label]}
            sparklineColor={sparklineColors[card.label]}
          />
        );
      })}
    </motion.section>
  );
}

function KpiCardItem({ 
  card, 
  sparklineData, 
  sparklineColor 
}: { 
  card: KpiCardData;
  sparklineData: number[];
  sparklineColor: string;
}) {
  const Icon = card.icon;
  const colors = themeClasses(card.tone);
  const count = useCountUp(card.value, 1500);
  const displayValue = `${formatNumber(count)}${card.suffix ?? ""}`;

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-transform duration-150 ${colors.glow}`}
      data-kpi-label={card.label}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`flex size-9 items-center justify-center rounded-full ${colors.circle}`}>
              <Icon className={`size-4 ${colors.icon}`} />
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">{card.label}</p>
          </div>
          <p className="mt-3 font-mono-jetbrains text-3xl font-bold text-[var(--text-primary)]" data-kpi-value={card.label}>{displayValue}</p>
          <div className="mt-1">
            <TrendBadge status={card.status} text={card.trend} />
          </div>
        </div>

        <div className="flex items-center">
          <Sparkline data={sparklineData} color={sparklineColor} />
        </div>
      </div>
    </motion.article>
  );
}
