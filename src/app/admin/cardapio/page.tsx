"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Star, Leaf, Flame, EyeOff } from "lucide-react";
import { formatBRL } from "@/lib/format";
import type { CategoryDTO, MenuItemDTO } from "@/lib/types";

interface ItemFormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  emoji: string;
  categoryId: string;
  prepMinutes: string;
  vegetarian: boolean;
  spicy: boolean;
  featured: boolean;
}

const EMPTY_FORM: ItemFormState = {
  name: "",
  description: "",
  price: "",
  emoji: "🍽️",
  categoryId: "",
  prepMinutes: "15",
  vegetarian: false,
  spicy: false,
  featured: false,
};

export default function CardapioPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ItemFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "🍽️" });

  async function load() {
    const res = await fetch("/api/menu").then((r) => r.json());
    setCategories(res.categories);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveItem() {
    if (!form) return;
    if (!form.name.trim() || !form.categoryId || !form.price) return;
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      emoji: form.emoji || "🍽️",
      categoryId: form.categoryId,
      prepMinutes: Number(form.prepMinutes) || 15,
      vegetarian: form.vegetarian,
      spicy: form.spicy,
      featured: form.featured,
    };
    if (form.id) {
      await fetch(`/api/menu/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setForm(null);
    load();
  }

  async function toggleAvailable(item: MenuItemDTO) {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)),
      }))
    );
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
  }

  async function deleteItem(item: MenuItemDTO) {
    if (!confirm(`Remover "${item.name}" do cardápio?`)) return;
    await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
    load();
  }

  async function addCategory() {
    if (!newCat.name.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    });
    setNewCat({ name: "", icon: "🍽️" });
    load();
  }

  async function deleteCategory(cat: CategoryDTO) {
    if (!confirm(`Remover a categoria "${cat.name}" e todos os seus ${cat.items.length} itens?`)) return;
    await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Cardápio</h1>
          <p className="mt-1 text-sm text-ink-500">Gerencie categorias, preços e disponibilidade.</p>
        </div>
      </div>

      {loading && <p className="mt-8 text-sm text-ink-500">Carregando...</p>}

      <div className="mt-6 space-y-8">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
                <span>{cat.icon}</span> {cat.name}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setForm({ ...EMPTY_FORM, categoryId: cat.id })}
                  className="flex items-center gap-1.5 rounded-full bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Plus size={14} /> Item
                </button>
                <button
                  onClick={() => deleteCategory(cat)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-300 hover:bg-rose-100 hover:text-rose-600"
                  aria-label="Remover categoria"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 divide-y divide-ink-100">
              {cat.items.length === 0 && <p className="py-4 text-sm text-ink-500">Nenhum item nesta categoria ainda.</p>}
              {cat.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-xl">
                    {item.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-semibold text-ink-950">{item.name}</h3>
                      {item.featured && <Star size={12} className="fill-gold-500 text-gold-500" />}
                      {item.vegetarian && <Leaf size={12} className="text-sage-500" />}
                      {item.spicy && <Flame size={12} className="text-rose-500" />}
                      {!item.available && <EyeOff size={12} className="text-ink-300" />}
                    </div>
                    <p className="truncate text-xs text-ink-500">{item.description}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-ink-950">{formatBRL(item.price)}</span>

                  <button
                    onClick={() => toggleAvailable(item)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${item.available ? "bg-sage-500" : "bg-ink-100"}`}
                    aria-label="Alternar disponibilidade"
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                        item.available ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>

                  <button
                    onClick={() =>
                      setForm({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: String(item.price),
                        emoji: item.emoji,
                        categoryId: item.categoryId,
                        prepMinutes: String(item.prepMinutes),
                        vegetarian: item.vegetarian,
                        spicy: item.spicy,
                        featured: item.featured,
                      })
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-100"
                    aria-label="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteItem(item)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-300 hover:bg-rose-100 hover:text-rose-600"
                    aria-label="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl2 border border-dashed border-ink-300 bg-white p-5">
          <h3 className="font-display text-sm font-bold text-ink-950">Nova categoria</h3>
          <div className="mt-3 flex gap-2">
            <input
              value={newCat.icon}
              onChange={(e) => setNewCat((c) => ({ ...c, icon: e.target.value }))}
              className="w-14 rounded-xl border border-ink-100 bg-cream-50 p-2.5 text-center text-lg outline-none focus:border-ember-500"
            />
            <input
              value={newCat.name}
              onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
              placeholder="Nome da categoria"
              className="flex-1 rounded-xl border border-ink-100 bg-cream-50 p-2.5 text-sm outline-none focus:border-ember-500"
            />
            <button onClick={addCategory} className="rounded-xl bg-ink-950 px-4 text-sm font-semibold text-white">
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {form && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-950/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setForm(null)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-6 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-950">
                  {form.id ? "Editar item" : "Novo item"}
                </h2>
                <button
                  onClick={() => setForm(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Emoji</label>
                    <input
                      value={form.emoji}
                      onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                      className="mt-1.5 w-16 rounded-xl border border-ink-100 bg-cream-50 p-3 text-center text-xl outline-none focus:border-ember-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Nome</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm outline-none focus:border-ember-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="mt-1.5 w-full resize-none rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm outline-none focus:border-ember-500"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm outline-none focus:border-ember-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Preparo (min)</label>
                    <input
                      type="number"
                      value={form.prepMinutes}
                      onChange={(e) => setForm({ ...form, prepMinutes: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm outline-none focus:border-ember-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Categoria</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-ink-100 bg-cream-50 p-3 text-sm outline-none focus:border-ember-500"
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <input
                      type="checkbox"
                      checked={form.vegetarian}
                      onChange={(e) => setForm({ ...form, vegetarian: e.target.checked })}
                      className="h-4 w-4 accent-sage-500"
                    />
                    Vegetariano
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <input
                      type="checkbox"
                      checked={form.spicy}
                      onChange={(e) => setForm({ ...form, spicy: e.target.checked })}
                      className="h-4 w-4 accent-rose-500"
                    />
                    Picante
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="h-4 w-4 accent-gold-500"
                    />
                    Destaque
                  </label>
                </div>
              </div>

              <button
                disabled={saving}
                onClick={saveItem}
                className="mt-6 w-full rounded-2xl bg-ember-500 py-3.5 text-center font-semibold text-white shadow-glow transition active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? "Salvando..." : form.id ? "Salvar alterações" : "Adicionar ao cardápio"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
