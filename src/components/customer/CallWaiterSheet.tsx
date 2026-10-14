"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";

export function CallWaiterSheet({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  function handleConfirm() {
    onConfirm(note.trim());
    setNote("");
  }

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
            className="safe-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-white p-6"
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

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-600">
              <Bell size={24} />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-ink-950">Chamar garçom</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              O garçom mais próximo é avisado na hora. Se quiser, conta já o que você precisa — assim ele
              chega sabendo o que levar.
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: preciso de mais um talher, derrubei o guardanapo, quero pedir algo..."
              rows={3}
              maxLength={280}
              className="mt-4 w-full resize-none rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm text-ink-950 outline-none focus:border-gold-500"
            />

            <button
              onClick={handleConfirm}
              className="mt-5 w-full rounded-2xl bg-ink-950 py-4 text-center font-semibold text-white transition active:scale-[0.98]"
            >
              Chamar garçom
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
