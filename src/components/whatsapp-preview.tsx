"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, MessageCircle, Shield, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ResponseType = "yes" | "no" | null;

function DotsTyping() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-2">
        <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
        <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
        <span className="size-2 rounded-full bg-slate-400 animate-bounce" />
      </div>
    </div>
  );
}

function BankBubble({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <motion.div 
      className="flex flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#005c4b] p-3 text-sm leading-relaxed text-white shadow-md">
        {children}
      </div>
      <div className="mt-1 ml-2 text-[10px] text-slate-500">{time}</div>
    </motion.div>
  );
}

function ClientBubble({ children, time, doubleCheck = false }: { children: React.ReactNode; time: string; doubleCheck?: boolean }) {
  return (
    <motion.div 
      className="flex flex-col items-end self-end"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[75%] rounded-lg rounded-tr-none bg-[#005c4b] p-3 text-sm text-white shadow-md">{children}</div>
      <div className="mt-1 mr-2 flex items-center gap-1 text-[10px] text-slate-500">
        <span>{time}</span>
        {doubleCheck ? <span className="text-blue-300">✓✓</span> : null}
      </div>
    </motion.div>
  );
}

function ChatInterface({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-[#0b141a] shadow-lg">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 bg-[#202c33] px-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-600">
          <Shield className="size-5 text-white" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white">Centro de Operaciones</span>
            <BadgeCheck className="size-4 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-400">Alertas de Seguridad</span>
        </div>
      </div>
      
      {/* Chat Background */}
      <div 
        className="flex flex-col gap-3 p-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ScenarioSection({ 
  number, 
  title, 
  description,
  icon: Icon, 
  color,
  children 
}: { 
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Timeline connector */}
      {number < 3 && (
        <div className="absolute left-[19px] top-[60px] h-[calc(100%+20px)] w-0.5 bg-gradient-to-b from-slate-300 to-transparent" />
      )}
      
      <div className="flex gap-4">
        {/* Timeline dot */}
        <div className="relative flex flex-col items-center">
          <div className={`flex size-10 items-center justify-center rounded-full ${color} ring-4 ring-[var(--bg-surface)]`}>
            <Icon className="size-5" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 pb-8">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono-jetbrains text-xs text-slate-500">Escenario {number}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm font-semibold text-slate-900">{title}</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{description}</p>
          </div>
          
          <div className="max-w-3xl">
            <ChatInterface>{children}</ChatInterface>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Scenario1() {
  const [response, setResponse] = useState<ResponseType>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!response) {
      return;
    }

    setShowToast(true);
    const timeout = window.setTimeout(() => {
      setShowToast(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [response]);

  return (
    <>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-700"
          >
            ✓ Respuesta registrada automáticamente en el sistema
          </motion.div>
        )}
      </AnimatePresence>

      {!response && <DotsTyping />}

      <BankBubble time="1:25 p.m.">
        <div className="space-y-2">
          <p className="font-semibold">🔴 Alerta de Seguridad</p>
          <p>Detectamos una compra inusual en tu Tarjeta Visa terminada en <span className="font-semibold">1234</span>.</p>
          <p>Para protegerte, la bloqueamos preventivamente.</p>
          <div className="mt-3 space-y-1 rounded-md bg-black/20 p-2.5 text-xs">
            <p>📅 Fecha: 05/02/2026</p>
            <p>💰 Monto: $2.450.000</p>
            <p>🏪 Comercio: E-commerce internacional</p>
          </div>
          <p className="mt-3 font-semibold">¿Tú hiciste esta transacción? 🤔</p>
        </div>
      </BankBubble>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setResponse("yes")}
          disabled={response !== null}
          className={`rounded-lg border py-2.5 text-sm font-medium transition-all active:scale-95 ${
            response === "yes" 
              ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300" 
              : response === null
              ? "border-slate-600 bg-slate-700/50 text-white hover:bg-slate-700"
              : "border-slate-700 bg-slate-800/30 text-slate-500 cursor-not-allowed"
          }`}
        >
          ✅ Sí fui yo
        </button>
        <button
          type="button"
          onClick={() => setResponse("no")}
          disabled={response !== null}
          className={`rounded-lg border py-2.5 text-sm font-medium transition-all active:scale-95 ${
            response === "no" 
              ? "border-red-500/50 bg-red-500/20 text-red-300" 
              : response === null
              ? "border-slate-600 bg-slate-700/50 text-white hover:bg-slate-700"
              : "border-slate-700 bg-slate-800/30 text-slate-500 cursor-not-allowed"
          }`}
        >
          ❌ No fui yo
        </button>
      </div>
    </>
  );
}

function Scenario2() {
  return (
    <>
      <BankBubble time="1:25 p.m.">
        <div className="space-y-2">
          <p className="font-semibold">🔴 Alerta de Seguridad</p>
          <p>Detectamos una compra inusual en tu Tarjeta Visa terminada en <span className="font-semibold">1234</span>.</p>
          <div className="mt-2 space-y-1 rounded-md bg-black/20 p-2 text-xs">
            <p>📅 05/02/2026 • 💰 $2.450.000 • 🏪 E-commerce</p>
          </div>
          <p className="mt-2 font-semibold">¿Tú hiciste esta transacción?</p>
        </div>
      </BankBubble>

      <ClientBubble time="1:30 p.m." doubleCheck>
        ❌ No fui yo
      </ClientBubble>

      <BankBubble time="1:31 p.m.">
        <div className="space-y-2">
          <p className="font-semibold">🔒 Tarjeta Bloqueada Definitivamente</p>
          <p>Bloqueamos tu Tarjeta Visa <span className="font-semibold">****1234</span> por seguridad.</p>
          <div className="mt-3 space-y-1.5 rounded-md bg-black/20 p-2.5 text-xs">
            <p className="font-semibold text-emerald-200">¿Necesitas ayuda?</p>
            <p>• Consulta en tu App Banca Móvil</p>
            <p>• Llama al <span className="font-semibold">601 382 0000</span> opción 4</p>
            <p>• Habla con un asesor especializado</p>
          </div>
          <p className="mt-3 text-xs text-emerald-200">Estamos aquí para protegerte 🛡️</p>
        </div>
      </BankBubble>
    </>
  );
}

function Scenario3() {
  return (
    <>
      <BankBubble time="1:25 p.m.">
        <div className="space-y-2">
          <p className="font-semibold">🔴 Alerta de Seguridad</p>
          <p>Detectamos una compra inusual en tu Tarjeta Visa terminada en <span className="font-semibold">1234</span>.</p>
          <div className="mt-2 space-y-1 rounded-md bg-black/20 p-2 text-xs">
            <p>📅 05/02/2026 • 💰 $2.450.000 • 🏪 E-commerce</p>
          </div>
          <p className="mt-2 font-semibold">¿Tú hiciste esta transacción?</p>
        </div>
      </BankBubble>

      <ClientBubble time="1:30 p.m." doubleCheck>
        ✅ Sí fui yo
      </ClientBubble>

      <BankBubble time="1:31 p.m.">
        <div className="space-y-2">
          <p className="font-semibold">✅ Tarjeta Desbloqueada</p>
          <p>Gracias por confirmar. Tu tarjeta ya está activa nuevamente.</p>
          <div className="mt-3 space-y-1.5 rounded-md bg-black/20 p-2.5 text-xs">
            <p className="font-semibold text-emerald-200">Recomendaciones de seguridad:</p>
            <p>🔐 No compartas códigos de seguridad</p>
            <p>🏪 Verifica siempre el comercio antes de comprar</p>
            <p>📱 Reporta movimientos extraños inmediatamente</p>
            <p>💳 Activa notificaciones de transacciones</p>
          </div>
          <p className="mt-3 text-xs text-emerald-200">Tu seguridad es nuestra prioridad 💚</p>
        </div>
      </BankBubble>
    </>
  );
}

export function WhatsAppPreview() {
  return (
    <section className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <MessageCircle className="size-4 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Experiencia del Cliente</h2>
            <p className="text-xs uppercase tracking-wider text-slate-500">Comunicación automática vía WhatsApp con Kari AI</p>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        <ScenarioSection
          number={1}
          title="Alerta Detectada"
          description="El sistema detecta una transacción inusual y envía mensaje automático al cliente"
          icon={MessageCircle}
          color="bg-blue-100 text-[#0033A0]"
        >
          <Scenario1 />
        </ScenarioSection>

        <ScenarioSection
          number={2}
          title="Cliente Niega la Transacción"
          description="El cliente responde que no realizó la compra, se bloquea la tarjeta definitivamente"
          icon={XCircle}
          color="bg-red-100 text-red-700"
        >
          <Scenario2 />
        </ScenarioSection>

        <ScenarioSection
          number={3}
          title="Cliente Confirma la Transacción"
          description="El cliente confirma que sí realizó la compra, se desbloquea la tarjeta automáticamente"
          icon={CheckCircle2}
          color="bg-emerald-100 text-emerald-700"
        >
          <Scenario3 />
        </ScenarioSection>
      </div>
    </section>
  );
}
