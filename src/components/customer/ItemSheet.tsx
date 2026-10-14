"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Leaf, Flame, Clock } from "lucide-react";
import type { MenuItemDTO } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export function ItemSheet({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItemDTO | null;
  onClose: () => void;
  onAdd: (item: MenuItemDTO, qty: number, notes: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setQty(1);
      setNotes("");
    }
  }, [item]);

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white p-6"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-100" />
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 text-ink-700"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cream-100 text-4xl">
              {item.emoji}
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink-950">{item.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <Clock size={13} /> {item.prepMinutes} min
              </span>
              {item.vegetarian && (
                <span className="flex items-center gap-1 text-sage-600">
                  <Leaf size={13} /> Vegetariano
                </span>
              )}
              {item.spicy && (
                <span className="flex items-center gap-1 text-rose-600">
                  <Flame size={13} /> Picante
                </span>
              )}
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Alguma observação?
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: sem cebola, ponto da carne..."
                rows={2}
                className="mt-2 w-full resize-none rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm text-ink-950 outline-none focus:border-ember-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-full border border-ink-100 px-2 py-1.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-100 text-ink-700"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={16} />
                </button>
                <span className="w-5 text-center font-mono font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-white"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="font-mono text-lg font-bold text-ink-950">
                {formatBRL(item.price * qty)}
              </span>
            </div>

            <button
              onClick={() => {
                onAdd(item, qty, notes);
                onClose();
              }}
              className="mt-5 w-full rounded-2xl bg-ember-500 py-4 text-center font-semibold text-white shadow-glow transition active:scale-[0.98]"
            >
              Adicionar ao pedido
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
