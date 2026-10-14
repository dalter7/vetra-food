"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";

export function CartSheet({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  submitting: boolean;
}) {
  const { lines, updateLine, removeLine, total } = useCartStore();
  const [orderNotes, setOrderNotes] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="safe-bottom fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-[28px] bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-ink-100 p-5">
              <h2 className="font-display text-lg font-bold text-ink-950">Seu pedido</h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {lines.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-500">Seu carrinho está vazio.</p>
              ) : (
                <div className="space-y-4">
                  {lines.map((line) => (
                    <div key={line.menuItem.id + line.notes} className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-xl">
                        {line.menuItem.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-ink-950">{line.menuItem.name}</h3>
                          <button
                            onClick={() => removeLine(line.menuItem.id)}
                            className="text-ink-300"
                            aria-label="Remover item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        {line.notes && (
                          <p className="mt-0.5 text-xs italic text-ink-500">&ldquo;{line.notes}&rdquo;</p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-ink-100 px-1.5 py-1">
                            <button
                              onClick={() => updateLine(line.menuItem.id, line.quantity - 1, line.notes)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-100"
                              aria-label="Diminuir"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center font-mono text-xs font-semibold">
                              {line.quantity}
                            </span>
                            <button
                              onClick={() => updateLine(line.menuItem.id, line.quantity + 1, line.notes)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-white"
                              aria-label="Aumentar"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-mono text-sm font-semibold text-ink-950">
                            {formatBRL(line.menuItem.price * line.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Observação geral (opcional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={2}
                      placeholder="Ex: trazer tudo junto, prioridade na sobremesa..."
                      className="mt-2 w-full resize-none rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm outline-none focus:border-ember-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-ink-100 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-ink-500">Total</span>
                  <span className="font-mono text-xl font-bold text-ink-950">{formatBRL(total())}</span>
                </div>
                <button
                  disabled={submitting}
                  onClick={() => onSubmit(orderNotes)}
                  className="w-full rounded-2xl bg-ember-500 py-4 text-center font-semibold text-white shadow-glow transition active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? "Enviando..." : "Enviar pedido para a cozinha"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
