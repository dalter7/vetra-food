"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Receipt, Utensils, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MenuView } from "@/components/customer/MenuView";
import { ItemSheet } from "@/components/customer/ItemSheet";
import { CartSheet } from "@/components/customer/CartSheet";
import { CallWaiterSheet } from "@/components/customer/CallWaiterSheet";
import { TrackingView } from "@/components/customer/TrackingView";
import { useCartStore } from "@/lib/cart-store";
import { getSocket } from "@/lib/socket-client";
import { useToast } from "@/components/Toasts";
import { playChime, primeAudio } from "@/lib/sound";
import { formatBRL } from "@/lib/format";
import type { CategoryDTO, MenuItemDTO, OrderDTO, CallDTO, TableDTO } from "@/lib/types";

export default function MesaPage() {
  const params = useParams<{ numero: string }>();
  const numero = Number(params.numero);
  const { notify } = useToast();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [table, setTable] = useState<TableDTO | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [calls, setCalls] = useState<CallDTO[]>([]);
  const [tab, setTab] = useState<"menu" | "pedido">("menu");
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [callSheetOpen, setCallSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cart = useCartStore();

  // Keep the local cart scoped to a single table — a device reused at another
  // table should never silently submit a stale order.
  useEffect(() => {
    const state = useCartStore.getState();
    if (state.tableNumber !== null && state.tableNumber !== numero) {
      state.clear();
    }
    useCartStore.getState().setTableNumber(numero);
  }, [numero]);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [menuRes, tableRes] = await Promise.all([
        fetch("/api/menu").then((r) => r.json()),
        fetch(`/api/tables/${numero}`).then((r) => {
          if (!r.ok) throw new Error("not-found");
          return r.json();
        }),
      ]);
      setCategories(menuRes.categories);
      setTable(tableRes.table);
      setOrders(tableRes.orders);
      setCalls(tableRes.calls);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [numero]);

  useEffect(() => {
    load();
  }, [load]);

  const tableId = table?.id;

  useEffect(() => {
    if (!tableId) return;
    const socket = getSocket();
    const room = `table:${tableId}`;

    // Room membership lives on the socket connection, not the client object —
    // a reconnect (phone switching wifi/cell, screen lock) drops it silently.
    // Re-join and resync on every (re)connect, not just once on mount, or the
    // order tracker can freeze on a stale status after any brief outage.
    //
    // Depending on `tableId` (a stable primitive) rather than the `table`
    // object itself is load-bearing: `load()` calls setTable() with a fresh
    // object every time, and depending on that object here would re-run this
    // effect on every resync, which would call onConnect() -> load() again,
    // forever — an infinite loop that freezes the tab.
    function onConnect() {
      socket.emit("join", room);
      load();
    }

    function onOrderStatus(order: OrderDTO) {
      if (order.tableId !== tableId) return;
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === order.id);
        const next = exists ? prev.map((o) => (o.id === order.id ? order : o)) : [...prev, order];
        return next.filter((o) => !["paid", "cancelled"].includes(o.status));
      });
      if (order.status === "ready") {
        playChime("success");
        notify("Seu pedido está pronto! 🎉", "success");
      }
    }
    function onCallStatus(call: CallDTO) {
      if (call.tableId !== tableId) return;
      setCalls((prev) => prev.map((c) => (c.id === call.id ? call : c)));
      if (call.status === "resolved") {
        notify(call.type === "waiter" ? "O garçom já está na sua mesa." : "Conta a caminho!", "info");
      }
    }

    socket.on("connect", onConnect);
    if (socket.connected) onConnect();
    socket.on("order:status", onOrderStatus);
    socket.on("call:status", onCallStatus);
    return () => {
      socket.emit("leave", room);
      socket.off("connect", onConnect);
      socket.off("order:status", onOrderStatus);
      socket.off("call:status", onCallStatus);
    };
  }, [tableId, notify, load]);

  function handleAdd(item: MenuItemDTO, qty: number, notes: string) {
    cart.addItem(item, qty, notes);
    notify(`${item.name} adicionado ao pedido`, "success");
  }

  async function handleSubmitOrder(notesText: string) {
    if (!table) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: table.number,
          notes: notesText || undefined,
          items: cart.lines.map((l) => ({
            menuItemId: l.menuItem.id,
            quantity: l.quantity,
            notes: l.notes || undefined,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders((prev) => [...prev, data.order]);
      cart.clear();
      setCartOpen(false);
      setTab("pedido");
      playChime("success");
      notify("Pedido enviado para a cozinha! 👨‍🍳", "success");
    } catch {
      notify("Não foi possível enviar o pedido. Tente novamente.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendCall(type: "waiter" | "bill", note?: string) {
    if (!table) return;
    primeAudio();
    const already = calls.some((c) => c.type === type && c.status === "pending");
    if (already && !note) {
      notify(type === "waiter" ? "O garçom já foi chamado." : "A conta já foi solicitada.", "info");
      return;
    }
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber: table.number, type, note }),
      });
      const data = await res.json();
      setCalls((prev) => [...prev.filter((c) => c.id !== data.call.id), data.call]);
      notify(
        type === "waiter" ? (already ? "Observação enviada ao garçom!" : "Garçom chamado!") : "Conta solicitada!",
        "success"
      );
    } catch {
      notify("Não foi possível enviar sua solicitação.", "error");
    }
  }

  function handleCallWaiter(note: string) {
    setCallSheetOpen(false);
    sendCall("waiter", note || undefined);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <motion.div
          animate={{ opacity: [0.45, 1, 0.45], scale: [0.97, 1, 0.97] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo size="md" />
        </motion.div>
      </div>
    );
  }

  if (notFound || !table) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 text-center">
        <div className="text-5xl">🔍</div>
        <h1 className="mt-4 font-display text-xl font-bold text-ink-950">Mesa não encontrada</h1>
        <p className="mt-2 max-w-xs text-sm text-ink-500">
          Confira o QR Code na mesa ou chame um atendente para te ajudar.
        </p>
      </div>
    );
  }

  const waiterPending = calls.some((c) => c.type === "waiter" && c.status === "pending");
  const billPending = calls.some((c) => c.type === "bill" && c.status === "pending");
  const cartCount = cart.lines.reduce((n, l) => n + l.quantity, 0);
  const cartTotal = cart.lines.reduce((sum, l) => sum + l.menuItem.price * l.quantity, 0);

  return (
    <div className="min-h-screen bg-cream-50 pb-28">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-cream-50/95 px-4 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="transition active:opacity-60" aria-label="Voltar ao início">
            <Logo size="sm" />
          </Link>
          <span className="rounded-full bg-ink-950 px-2.5 py-1 font-mono text-xs font-semibold text-cream-50">
            Mesa {table.number}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              primeAudio();
              setCallSheetOpen(true);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              waiterPending
                ? "animate-pulse-ring border-gold-500 bg-gold-100 text-gold-600"
                : "border-ink-100 bg-white text-ink-700 hover:border-ink-300"
            }`}
            aria-label="Chamar garçom"
          >
            <Bell size={17} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => sendCall("bill")}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              billPending ? "border-gold-500 bg-gold-100 text-gold-600" : "border-ink-100 bg-white text-ink-700 hover:border-ink-300"
            }`}
            aria-label="Pedir a conta"
          >
            <Receipt size={17} />
          </motion.button>
        </div>
      </header>

      <main className="px-4">
        {tab === "menu" ? (
          <MenuView categories={categories} onSelectItem={setSelectedItem} />
        ) : (
          <TrackingView orders={orders} calls={calls} onBrowseMenu={() => setTab("menu")} />
        )}
      </main>

      {tab === "menu" && cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="animate-slide-up fixed inset-x-4 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-ink-950 px-5 py-4 text-white shadow-lift"
        >
          <span className="text-sm font-semibold">
            {cartCount} {cartCount === 1 ? "item" : "itens"} · {formatBRL(cartTotal)}
          </span>
          <span className="text-sm font-bold text-ember-300">Ver pedido ›</span>
        </button>
      )}

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-ink-100 bg-white">
        <TabBtn active={tab === "menu"} onClick={() => setTab("menu")} icon={Utensils} label="Cardápio" />
        <TabBtn
          active={tab === "pedido"}
          onClick={() => setTab("pedido")}
          icon={ClipboardList}
          label="Meu Pedido"
          badge={orders.length || undefined}
        />
      </nav>

      <ItemSheet item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={handleAdd} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} onSubmit={handleSubmitOrder} submitting={submitting} />
      <CallWaiterSheet open={callSheetOpen} onClose={() => setCallSheetOpen(false)} onConfirm={handleCallWaiter} />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  badge?: number;
}) {
  return (
    <button onClick={onClick} className="relative flex flex-1 flex-col items-center justify-center gap-0.5">
      <Icon size={20} className={active ? "text-ember-500" : "text-ink-300"} strokeWidth={2.3} />
      <span className={`text-[11px] font-semibold ${active ? "text-ink-950" : "text-ink-300"}`}>{label}</span>
      {!!badge && (
        <span className="absolute right-[28%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember-500 px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
