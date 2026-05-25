import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-8 text-center">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 lg:px-6">
        <Shield className="size-5 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">Banco de Bogotá | Demo Antifraude <span className="font-mono-jetbrains">2026</span></p>
        <p className="text-xs text-[var(--text-muted)] opacity-80">
          Powered by Américas SIM | Automatización Inteligente
        </p>
      </div>
    </footer>
  );
}
