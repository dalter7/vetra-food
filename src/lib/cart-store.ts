"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItemDTO } from "./types";

export interface CartLine {
  menuItem: MenuItemDTO;
  quantity: number;
  notes: string;
}

interface CartState {
  tableNumber: number | null;
  lines: CartLine[];
  setTableNumber: (n: number) => void;
  addItem: (item: MenuItemDTO, quantity: number, notes: string) => void;
  updateLine: (menuItemId: string, quantity: number, notes: string) => void;
  removeLine: (menuItemId: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableNumber: null,
      lines: [],
      setTableNumber: (n) => set({ tableNumber: n }),
      addItem: (item, quantity, notes) =>
        set((state) => {
          const existing = state.lines.find((l) => l.menuItem.id === item.id && l.notes === notes);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l === existing ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, { menuItem: item, quantity, notes }] };
        }),
      updateLine: (menuItemId, quantity, notes) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.menuItem.id === menuItemId ? { ...l, quantity, notes } : l))
            .filter((l) => l.quantity > 0),
        })),
      removeLine: (menuItemId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.menuItem.id !== menuItemId) })),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((sum, l) => sum + l.menuItem.price * l.quantity, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "vetra-cart" }
  )
);
