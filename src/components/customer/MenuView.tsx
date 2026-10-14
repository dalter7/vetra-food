"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Leaf, Star } from "lucide-react";
import type { CategoryDTO, MenuItemDTO } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export function MenuView({
  categories,
  onSelectItem,
}: {
  categories: CategoryDTO[];
  onSelectItem: (item: MenuItemDTO) => void;
}) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function jumpTo(id: string) {
    setActive(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    pillRefs.current[id]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  if (categories.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-500">Cardápio em breve.</p>;
  }

  return (
    <div>
      <div className="no-scrollbar sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto bg-cream-50/95 px-4 py-3 backdrop-blur">
        {categories.map((cat) => (
          <button
            key={cat.id}
            ref={(el) => {
              pillRefs.current[cat.id] = el;
            }}
            onClick={() => jumpTo(cat.id)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              active === cat.id ? "border-ink-950 text-cream-50" : "border-ink-100 bg-white text-ink-700"
            }`}
          >
            {active === cat.id && (
              <motion.span
                layoutId="category-pill-bg"
                className="absolute inset-0 rounded-full bg-ink-950"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{cat.icon}</span>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-8 pb-6 pt-4">
        {categories.map((cat) => {
          const available = cat.items.filter((i) => i.available);
          if (available.length === 0) return null;
          return (
            <div
              key={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              className="scroll-mt-32"
            >
              <h2 className="mb-3 font-display text-lg font-bold text-ink-950">
                {cat.icon} {cat.name}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {available.map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectItem(item)}
                    className="flex items-start gap-3 rounded-xl2 border border-ink-100 bg-white p-4 text-left shadow-soft transition-shadow hover:shadow-lift hover:border-ember-100"
                  >
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 text-2xl shadow-inner">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                      <span className="relative">{item.emoji}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-semibold leading-snug text-ink-950">
                          {item.name}
                        </h3>
                        {item.featured && (
                          <Star size={14} className="mt-0.5 shrink-0 fill-gold-500 text-gold-500" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-ember-600">
                          {formatBRL(item.price)}
                        </span>
                        {item.vegetarian && <Leaf size={12} className="text-sage-500" />}
                        {item.spicy && <Flame size={12} className="text-rose-500" />}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
