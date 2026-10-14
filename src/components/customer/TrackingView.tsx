"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { OrderDTO, CallDTO } from "@/lib/types";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from "@/lib/types";
import { formatBRL, elapsedLabel } from "@/lib/format";

export function TrackingView({
  orders,
  calls,
  onBrowseMenu,
}: {
  orders: OrderDTO[];
  calls: CallDTO[];
  onBrowseMenu: () => void;
}) {
  const pendingCalls = calls.filter((c) => c.status === "pending");

  if (orders.length === 0 && pendingCalls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl">🍽️</div>
        <h2 className="mt-4 font-display text-lg font-bold text-ink-950">Nenhum pedido ainda</h2>
        <p className="mt-1 max-w-xs text-sm text-ink-500">
          Monte seu pedido no cardápio e acompanhe tudo por aqui, em tempo real.
        </p>
        <button
          onClick={onBrowseMenu}
          className="mt-5 rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-white"
        >
          Ver cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10 pt-4">
      <AnimatePresence initial={false}>
        {pendingCalls.map((call) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl2 border border-gold-300 bg-gold-100 px-4 py-3 text-sm font-medium text-gold-600"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
            </span>
            {call.type === "waiter" ? "Garçom chamado — a caminho da sua mesa" : "Conta solicitada — o garçom já foi avisado"}
          </motion.div>
        ))}
      </AnimatePresence>

      {orders.map((order) => {
        const stepIndex = Math.max(0, ORDER_STATUS_FLOW.indexOf(order.status));
        const isReady = order.status === "ready";
        return (
          <motion.div
            layout
            key={order.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`rounded-xl2 border bg-white p-5 shadow-soft transition-colors ${
              isReady ? "border-sage-300 ring-1 ring-sage-100" : "border-ink-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink-500">
                Pedido #{order.id.slice(-5).toUpperCase()}
              </span>
              <span className="text-xs text-ink-500">{elapsedLabel(order.createdAt)} atrás</span>
            </div>

            <div className="mt-4 flex items-center">
              {ORDER_STATUS_FLOW.map((status, i) => {
                const done = i < stepIndex || order.status === "delivered";
                const isCurrent = i === stepIndex && !done;
                return (
                  <div key={status} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative flex h-8 w-8 items-center justify-center">
                        {isCurrent && (
                          <motion.span
                            className="absolute inset-0 rounded-full bg-ember-400"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                          />
                        )}
                        <motion.div
                          animate={{
                            backgroundColor: i <= stepIndex ? "#FF5A3C" : "#F3E7D8",
                            scale: isCurrent ? 1.08 : 1,
                          }}
                          transition={{ duration: 0.35 }}
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            i <= stepIndex ? "text-white" : "text-ink-300"
                          }`}
                        >
                          {done ? <Check size={14} /> : i + 1}
                        </motion.div>
                      </div>
                      <span
                        className={`text-center text-[10px] font-medium ${
                          i <= stepIndex ? "text-ink-950" : "text-ink-300"
                        }`}
                      >
                        {ORDER_STATUS_LABEL[status]}
                      </span>
                    </div>
                    {i < ORDER_STATUS_FLOW.length - 1 && (
                      <div className="relative mx-1 h-0.5 flex-1 overflow-hidden rounded bg-cream-200">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-ember-500"
                          initial={false}
                          animate={{ width: i < stepIndex ? "100%" : "0%" }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-ink-100 pt-4">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-mono text-ink-500">{formatBRL(it.unitPrice * it.quantity)}</span>
                </div>
              ))}
              {order.notes && <p className="text-xs italic text-ink-500">Obs: {order.notes}</p>}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="text-sm font-semibold text-ink-950">Subtotal</span>
              <span className="font-mono text-sm font-bold text-ink-950">{formatBRL(order.total)}</span>
            </div>
          </motion.div>
        );
      })}

      <button
        onClick={onBrowseMenu}
        className="w-full rounded-2xl border border-dashed border-ink-300 py-4 text-center text-sm font-semibold text-ink-700 transition hover:border-ember-300 hover:text-ember-600"
      >
        + Adicionar mais itens
      </button>
    </div>
  );
}
