import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AnimatedBackground } from "@/components/animated-background";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BdB Antifraude | Centro de Operaciones",
  description:
    "Demo cinematográfica de automatización inteligente de alertas transaccionales para el Banco de Bogotá. Proceso 100% automatizado con orquestador central, bots inteligentes y dashboard en tiempo real.",
  keywords:
    "Banco de Bogotá, antifraude, automatización, RPA, bots inteligentes, orquestador, alertas transaccionales, fraude bancario, IA",
  authors: [{ name: "Américas SIM" }],
  openGraph: {
    title: "BdB Antifraude | Centro de Operaciones",
    description: "Automatización inteligente de alertas transaccionales",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="relative min-h-full overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)]"
        suppressHydrationWarning
      >
        <AnimatedBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

