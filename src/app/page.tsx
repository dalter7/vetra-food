"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChefHat, Bell, LayoutDashboard, ArrowUpRight, QrCode, Zap, Radio } from "lucide-react";
import { Logo } from "@/components/Logo";

const APPS = [
  {
    href: "/cozinha",
    icon: ChefHat,
    title: "Cozinha",
    description: "Tela de pedidos em tempo real para a produção — novos, em preparo e prontos.",
    accent: "bg-ink-950 text-cream-100",
  },
  {
    href: "/garcom",
    icon: Bell,
    title: "Garçom",
    description: "Mesas, chamados e pedidos prontos para entrega, tudo em um painel ao vivo.",
    accent: "bg-ember-500 text-white",
  },
  {
    href: "/admin",
    icon: LayoutDashboard,
    title: "Painel Admin",
    description: "Cardápio, mesas, QR Codes e visão geral do salão em tempo real.",
    accent: "bg-sage-500 text-white",
  },
];

const STATS = [
  { icon: Zap, value: "Tempo real", label: "direto pra cozinha e garçom" },
  { icon: QrCode, value: "Zero app", label: "o cliente só escaneia e pede" },
  { icon: Radio, value: "4 painéis", label: "no mesmo pedido" },
];

export default function Home() {
  const demoTables = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-cream-50">
      <section className="relative overflow-hidden bg-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(255,90,60,0.22),transparent_70%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-8 sm:pt-10">
          <div className="flex items-center justify-between">
            <Logo size="md" on="ink" />
            <span className="flex items-center gap-2 rounded-full border border-cream-100/10 bg-cream-100/5 px-3 py-1.5 font-mono text-[11px] text-cream-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sage-400" />
              </span>
              sistema ao vivo
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-12 flex flex-col items-center text-center sm:mt-16"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="Vetra Food" className="h-24 w-auto sm:h-32" />
            <h1 className="mt-8 max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-cream-50 sm:text-5xl">
              O cardápio do seu restaurante, <span className="text-ember-400">direto na mesa</span> do
              cliente.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream-300">
              O cliente escaneia o QR Code, monta o pedido e envia direto para a cozinha. O garçom sabe
              exatamente qual mesa atender — sem papel, sem ruído, sem atraso.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-3"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-cream-100/10 bg-ink-900 px-4 py-2.5"
              >
                <stat.icon size={14} className="shrink-0 text-ember-400" />
                <span className="font-mono text-sm font-semibold text-cream-50">{stat.value}</span>
                <span className="text-xs text-cream-400">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="relative z-10 -mt-10 grid gap-4 sm:grid-cols-3"
        >
          {APPS.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group relative overflow-hidden rounded-xl2 border border-ink-100 bg-white p-6 shadow-lift transition hover:-translate-y-1"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${app.accent}`}>
                <app.icon size={20} strokeWidth={2.2} />
              </div>
              <div className="mt-5 flex items-center gap-1.5 font-display text-lg font-semibold text-ink-950">
                {app.title}
                <ArrowUpRight
                  size={16}
                  className="text-ink-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ember-500"
                />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{app.description}</p>
            </Link>
          ))}
        </motion.div>

        <div className="mt-10 rounded-xl2 border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2 text-ink-700">
            <QrCode size={18} />
            <h2 className="font-display text-base font-semibold text-ink-950">
              Acesso de demonstração às mesas
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Em produção, cada mesa tem seu próprio QR Code (gerado em{" "}
            <Link href="/admin/mesas" className="font-medium text-ember-600 underline underline-offset-2">
              Painel Admin → Mesas
            </Link>
            ) apontando direto para o cardápio dela. Para testar agora, escolha uma mesa:
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {demoTables.map((n) => (
              <Link
                key={n}
                href={`/mesa/${n}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-100 bg-cream-50 font-mono text-sm font-semibold text-ink-700 transition hover:border-ember-500 hover:bg-ember-50 hover:text-ember-600"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-10 pb-14 text-center text-xs text-ink-300">
          Vetra Food — pedidos por QR Code, cozinha e garçom conectados em tempo real.
        </p>
      </div>
    </main>
  );
}
