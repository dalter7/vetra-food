"use client";

import { useCallback, useEffect, useState } from "react";
import { Armchair, Soup, Flame, Bell } from "lucide-react";
import { getSocket } from "@/lib/socket-client";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, elapsedLabel } from "@/lib/format";
import type { OrderDTO, CallDTO } from "@/lib/types";

interface TableBase {
  id: string;
  number: number;
}

export default function AdminOverview() {
  const [tables, setTables] = useState<TableBase[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [calls, setCalls] = useState<CallDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [tablesRes, ordersRes, callsRes] = await Promise.all([
      fetch("/api/tables").then((r) => r.json()),
      fetch("/api/orders?active=true").then((r) => r.json()),
      fetch("/api/calls?status=pending").then((r) => r.json()),
    ]);
    setTables(tablesRes.tables);
    setOrders(ordersRes.orders);
    setCalls(callsRes.calls);
    setLoading(false);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // Re-join and resync on every (re)connect, not just once at mount — room
    // membership is tied to the connection, so a dropped wifi signal would
    // otherwise leave this dashboard silently stale until a manual refresh.
    function onConnect() {
      socket.emit("join", "admin");
      load();
    }

    function onOrderNew(order: OrderDTO) {
      setOrders((prev) => [order, ...prev]);
    }
    function onOrderStatus(order: OrderDTO) {
      setOrders((prev) => {
        if (order.status === "paid" || order.status === "cancelled") return prev.filter((o) => o.id !== order.id);
        const exists = prev.some((o) => o.id === order.id);
        return exists ? prev.map((o) => (o.id === order.id ? order : o)) : [order, ...prev];
      });
    }
    function onCallNew(call: CallDTO) {
      setCalls((prev) => [...prev, call]);
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
      socket.emit("leave", "admin");
      socket.off("connect", onConnect);
      socket.off("order:new", onOrderNew);
      socket.off("order:status", onOrderStatus);
      socket.off("call:new", onCallNew);
      socket.off("call:status", onCallStatus);
    };
  }, [load]);

  const activeTableIds = new Set(orders.map((o) => o.tableId));
  const ready = orders.filter((o) => o.status === "ready").length;
  const revenueToday = orders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Mesas ativas", value: `${activeTableIds.size}/${tables.length}`, icon: Armchair, tone: "bg-ink-950 text-cream-100" },
    { label: "Pedidos em andamento", value: orders.length, icon: Soup, tone: "bg-ember-500 text-white" },
    { label: "Prontos p/ entrega", value: ready, icon: Flame, tone: "bg-gold-500 text-white" },
    { label: "Chamados pendentes", value: calls.length, icon: Bell, tone: "bg-sage-500 text-white" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950">Visão geral</h1>
      <p className="mt-1 text-sm text-ink-500">Acompanhe o salão em tempo real.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift hover:border-ember-100"
          >
            <div
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${s.tone}`}
            >
              <s.icon size={16} />
            </div>
            <div className="mt-3 font-mono text-2xl font-bold text-ink-950">{s.value}</div>
            <div className="text-xs text-ink-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink-950">Pedidos ao vivo</h2>
          <span className="font-mono text-xs text-ink-500">receita em aberto · {formatBRL(revenueToday)}</span>
        </div>
        <div className="mt-4 divide-y divide-ink-100">
          {loading && <p className="py-6 text-center text-sm text-ink-500">Carregando...</p>}
          {!loading && orders.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-500">Nenhum pedido em andamento no momento.</p>
          )}
          {orders
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-cream-100 px-2.5 py-1 font-mono text-xs font-bold text-ink-950">
                    Mesa {order.tableNumber}
                  </span>
                  <div>
                    <p className="text-sm text-ink-950">
                      {order.items.length} {order.items.length === 1 ? "item" : "itens"} ·{" "}
                      <span className="font-mono">{formatBRL(order.total)}</span>
                    </p>
                    <p className="text-xs text-ink-500">há {elapsedLabel(order.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
