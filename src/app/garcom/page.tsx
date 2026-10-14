"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Receipt, Soup, Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSocket } from "@/lib/socket-client";
import { playChime, primeAudio } from "@/lib/sound";
import { useToast } from "@/components/Toasts";
import { elapsedLabel } from "@/lib/format";
import type { OrderDTO, CallDTO } from "@/lib/types";

interface TableBase {
  id: string;
  number: number;
  seats: number;
}

type QueueItem =
  | { kind: "order-ready"; id: string; tableId: string; tableNumber: number; at: string; order: OrderDTO }
  | { kind: "call"; id: string; tableId: string; tableNumber: number; at: string; call: CallDTO };

export default function GarcomPage() {
  const { notify } = useToast();
  const [tables, setTables] = useState<TableBase[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [calls, setCalls] = useState<CallDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const primed = useRef(false);

  const load = useCallback(async () => {
    const [tablesRes, ordersRes, callsRes] = await Promise.all([
      fetch("/api/tables").then((r) => r.json()),
      fetch("/api/orders?active=true").then((r) => r.json()),
      fetch("/api/calls?status=pending").then((r) => r.json()),
    ]);
    setTables(tablesRes.tables.map((t: TableBase) => ({ id: t.id, number: t.number, seats: t.seats })));
    setOrders(ordersRes.orders);
    setCalls(callsRes.calls);
    setLoading(false);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // Room membership lives on the socket connection, not the client object —
    // a reconnect (wifi blip, laptop sleep) drops it silently. Re-join and
    // resync from the server every time a connection is (re)established, not
    // just once at mount, or the queue can go stale after any brief outage.
    function onConnect() {
      socket.emit("join", "waiters");
      load();
    }

    function onOrderNew(order: OrderDTO) {
      setOrders((prev) => [...prev, order]);
    }
    function onOrderStatus(order: OrderDTO) {
      setOrders((prev) => {
        if (order.status === "paid" || order.status === "cancelled") return prev.filter((o) => o.id !== order.id);
        const exists = prev.some((o) => o.id === order.id);
        return exists ? prev.map((o) => (o.id === order.id ? order : o)) : [...prev, order];
      });
      if (order.status === "ready") {
        playChime("alert");
        notify(`Mesa ${order.tableNumber}: pedido pronto para entrega!`, "success");
      }
    }
    function onCallNew(call: CallDTO) {
      setCalls((prev) => [...prev, call]);
      playChime("alert");
      notify(`Mesa ${call.tableNumber}: ${call.type === "waiter" ? "chamando o garçom" : "pediu a conta"}`, "info");
    }
    function onCallStatus(call: CallDTO) {
      setCalls((prev) => (call.status === "resolved" ? prev.filter((c) => c.id !== call.id) : prev.map((c) => (c.id === call.id ? call : c))));
    }

    socket.on("connect", onConnect);
    if (socket.connected) onConnect();
    socket.on("order:new", onOrderNew);
    socket.on("order:status", onOrderStatus);
    socket.on("call:new", onCallNew);
    socket.on("call:status", onCallStatus);
    return () => {
      socket.emit("leave", "waiters");
      socket.off("connect", onConnect);
      socket.off("order:new", onOrderNew);
      socket.off("order:status", onOrderStatus);
      socket.off("call:new", onCallNew);
      socket.off("call:status", onCallStatus);
    };
  }, [load, notify]);

  function handleFirstTap() {
    if (!primed.current) {
      primeAudio();
      primed.current = true;
    }
  }

  async function deliverOrder(order: OrderDTO) {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "delivered" } : o)));
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered" }),
    });
  }

  async function resolveCall(call: CallDTO) {
    setCalls((prev) => prev.filter((c) => c.id !== call.id));
    await fetch(`/api/calls/${call.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
  }

  const queue: QueueItem[] = [
    ...orders
      .filter((o) => o.status === "ready")
      .map((o): QueueItem => ({ kind: "order-ready", id: o.id, tableId: o.tableId, tableNumber: o.tableNumber, at: o.updatedAt, order: o })),
    ...calls.map((c): QueueItem => ({ kind: "call", id: c.id, tableId: c.tableId, tableNumber: c.tableNumber, at: c.createdAt, call: c })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  function tableState(tableId: string): { label: string; dot: string } {
    const tOrders = orders.filter((o) => o.tableId === tableId);
    const tCalls = calls.filter((c) => c.tableId === tableId);
    if (tCalls.some((c) => c.type === "bill")) return { label: "Conta pedida", dot: "bg-gold-500" };
    if (tOrders.some((o) => o.status === "ready")) return { label: "Pedido pronto", dot: "bg-ember-500" };
    if (tCalls.some((c) => c.type === "waiter")) return { label: "Chamando", dot: "bg-gold-500" };
    if (tOrders.length > 0) return { label: "Em andamento", dot: "bg-sage-500" };
    return { label: "Livre", dot: "bg-ink-100" };
  }

  const activeCount = tables.filter((t) => tableState(t.id).label !== "Livre").length;

  return (
    <div onClick={handleFirstTap} className="min-h-screen bg-cream-50 pb-10">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100 bg-cream-50/95 px-5 py-4 backdrop-blur">
        <Link href="/" className="transition active:opacity-60" aria-label="Voltar ao início">
          <Logo size="md" />
        </Link>
        <div className="text-right">
          <div className="font-mono text-lg font-bold text-ink-950">{activeCount}/{tables.length}</div>
          <div className="text-[11px] text-ink-500">mesas ativas</div>
        </div>
      </header>

      <section className="px-5 pt-5">
        <h2 className="font-display text-base font-bold text-ink-950">Precisa de atenção</h2>
        <div className="mt-3 space-y-2.5">
          {queue.length === 0 && !loading && (
            <div className="rounded-xl2 border border-dashed border-ink-100 bg-white py-8 text-center text-sm text-ink-500">
              Tudo em dia por aqui. 🎉
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {queue.map((item) => (
              <motion.div
                key={item.kind + item.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="flex items-center gap-3 rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    item.kind === "order-ready"
                      ? "bg-ember-100 text-ember-600"
                      : item.kind === "call" && item.call.type === "bill"
                        ? "bg-gold-100 text-gold-600"
                        : "bg-gold-100 text-gold-600"
                  }`}
                >
                  {item.kind === "order-ready" ? <Soup size={19} /> : item.call.type === "bill" ? <Receipt size={19} /> : <Bell size={19} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-ink-950 px-2 py-0.5 font-mono text-xs font-bold text-cream-50">
                      Mesa {item.tableNumber}
                    </span>
                    <span className="text-xs text-ink-500">há {elapsedLabel(item.at)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink-950">
                    {item.kind === "order-ready"
                      ? `Pedido pronto · ${item.order.items.length} ${item.order.items.length === 1 ? "item" : "itens"}`
                      : item.call.type === "bill"
                        ? "Solicitou a conta"
                        : "Chamando o garçom"}
                  </p>
                </div>
                <button
                  onClick={() => (item.kind === "order-ready" ? deliverOrder(item.order) : resolveCall(item.call))}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink-950 px-3.5 py-2 text-xs font-semibold text-white transition active:scale-95"
                >
                  <Check size={14} />
                  {item.kind === "order-ready" ? "Entregar" : "Atendido"}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="font-display text-base font-bold text-ink-950">Mesas</h2>
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {tables.map((t) => {
            const state = tableState(t.id);
            return (
              <div key={t.id} className="rounded-xl border border-ink-100 bg-white p-3 text-center shadow-soft">
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${state.dot}`} />
                  <span className="font-mono text-lg font-bold text-ink-950">{t.number}</span>
                </div>
                <div className="mt-1 truncate text-[10px] font-medium text-ink-500">{state.label}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
