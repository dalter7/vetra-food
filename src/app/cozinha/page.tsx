"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, ArrowRight, Undo2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSocket } from "@/lib/socket-client";
import { playChime, primeAudio } from "@/lib/sound";
import type { OrderDTO, OrderStatus } from "@/lib/types";
import { minutesSince } from "@/lib/format";

const COLUMNS: { status: OrderStatus; title: string; icon: string }[] = [
  { status: "received", title: "Novos", icon: "🆕" },
  { status: "preparing", title: "Em preparo", icon: "🔥" },
  { status: "ready", title: "Prontos", icon: "✅" },
];

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { received: "preparing", preparing: "ready" };
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  received: "Iniciar preparo",
  preparing: "Marcar como pronto",
};
const PREV: Partial<Record<OrderStatus, OrderStatus>> = { preparing: "received", ready: "preparing" };

export default function CozinhaPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const primed = useRef(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(() => {
    return fetch("/api/orders?active=true")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders.filter((o: OrderDTO) => o.status !== "delivered")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // Room membership lives on the socket connection, not the client object —
    // a reconnect (wifi blip) drops it silently. Re-join and resync from the
    // server on every (re)connect, not just once at mount, so a dropped order
    // never silently vanishes from the board after a brief network hiccup.
    function onConnect() {
      socket.emit("join", "kitchen");
      load();
    }

    function onNew(order: OrderDTO) {
      setOrders((prev) => [order, ...prev]);
      playChime("new");
    }
    function onStatus(order: OrderDTO) {
      setOrders((prev) => {
        if (order.status === "delivered" || order.status === "paid" || order.status === "cancelled") {
          return prev.filter((o) => o.id !== order.id);
        }
        const exists = prev.some((o) => o.id === order.id);
        return exists ? prev.map((o) => (o.id === order.id ? order : o)) : [order, ...prev];
      });
    }

    socket.on("connect", onConnect);
    if (socket.connected) onConnect();
    socket.on("order:new", onNew);
    socket.on("order:status", onStatus);
    return () => {
      socket.emit("leave", "kitchen");
      socket.off("connect", onConnect);
      socket.off("order:new", onNew);
      socket.off("order:status", onStatus);
    };
  }, [load]);

  async function advance(order: OrderDTO, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function handleFirstTap() {
    if (!primed.current) {
      primeAudio();
      primed.current = true;
    }
  }

  return (
    <div onClick={handleFirstTap} className="relative min-h-screen bg-ink-950 pb-10">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 15% 0%, rgba(255,90,60,0.08), transparent 70%), radial-gradient(ellipse 40% 35% at 90% 10%, rgba(46,158,92,0.05), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-800 bg-ink-950/95 px-6 py-4 backdrop-blur">
        <Link href="/" className="transition active:opacity-60" aria-label="Voltar ao início">
          <Logo size="md" on="ink" />
        </Link>
        <div className="flex items-center gap-6">
          {COLUMNS.map((col) => (
            <div key={col.status} className="hidden items-center gap-2 text-sm text-cream-300 sm:flex">
              <span>{col.icon}</span>
              <span>{col.title}</span>
              <span className="font-mono font-bold text-cream-100">
                {orders.filter((o) => o.status === col.status).length}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 font-mono text-sm text-cream-100">
            <Clock size={14} />
            {now ? now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </div>
        </div>
      </header>

      <div className="relative z-10 grid gap-5 px-5 pt-5 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colOrders = orders
            .filter((o) => o.status === col.status)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          return (
            <div key={col.status} className="rounded-xl2 bg-ink-900/60 p-3">
              <div className="mb-3 flex items-center justify-between px-2">
                <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-cream-200">
                  <span>{col.icon}</span>
                  {col.title}
                </h2>
                <span className="font-mono text-xs text-cream-300">{colOrders.length}</span>
              </div>

              <div className="space-y-3">
                {loading && <p className="px-2 text-sm text-cream-300">Carregando...</p>}
                {!loading && colOrders.length === 0 && (
                  <p className="px-2 py-6 text-center text-sm text-ink-500">Nenhum pedido aqui</p>
                )}
                <AnimatePresence mode="popLayout">
                  {colOrders.map((order) => (
                    <Ticket key={order.id} order={order} onAdvance={advance} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Ticket = forwardRef<
  HTMLDivElement,
  { order: OrderDTO; onAdvance: (o: OrderDTO, s: OrderStatus) => void }
>(function Ticket({ order, onAdvance }, ref) {
  const mins = minutesSince(order.createdAt);
  const urgency = mins < 5 ? "ok" : mins < 12 ? "warn" : "late";
  const urgencyStyles = {
    ok: "bg-sage-500/15 text-sage-300 border-sage-500/30",
    warn: "bg-gold-500/15 text-gold-300 border-gold-500/30",
    late: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  }[urgency];

  const next = NEXT[order.status];
  const prev = PREV[order.status];

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", damping: 26, stiffness: 300 }}
      className="rounded-xl border border-ink-800 bg-ink-900 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl font-bold text-cream-100">Mesa {order.tableNumber}</span>
        <span className={`rounded-full border px-2 py-0.5 font-mono text-xs font-semibold ${urgencyStyles}`}>
          {mins} min
        </span>
      </div>
      <span className="font-mono text-[11px] text-ink-500">#{order.id.slice(-5).toUpperCase()}</span>

      <div className="mt-3 space-y-1.5 border-t border-ink-800 pt-3">
        {order.items.map((it) => (
          <div key={it.id} className="text-sm">
            <span className="font-semibold text-cream-100">{it.quantity}x </span>
            <span className="text-cream-200">{it.name}</span>
            {it.notes && <p className="pl-5 text-xs italic text-gold-300">↳ {it.notes}</p>}
          </div>
        ))}
        {order.notes && <p className="text-xs italic text-gold-300">Obs: {order.notes}</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {prev && (
          <button
            onClick={() => onAdvance(order, prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-800 text-cream-300"
            aria-label="Voltar status"
          >
            <Undo2 size={16} />
          </button>
        )}
        {next && (
          <button
            onClick={() => onAdvance(order, next)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ember-500 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            {NEXT_LABEL[order.status]}
            <ArrowRight size={15} />
          </button>
        )}
        {order.status === "ready" && (
          <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sage-500/15 py-2.5 text-sm font-semibold text-sage-300">
            <CheckCircle2 size={15} /> Aguardando garçom
          </span>
        )}
      </div>
    </motion.div>
  );
});
