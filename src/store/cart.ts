"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  couponCode: string | null;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (item: CartItem) => { ok: boolean; message: string };
  removeItem: (productId: string) => void;
  setQuantity: (
    productId: string,
    quantity: number
  ) => { ok: boolean; message: string };
  clear: () => void;
  setCouponCode: (code: string | null) => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      drawerOpen: false,

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        const nextQty = (existing?.quantity ?? 0) + item.quantity;

        if (item.stock <= 0) {
          return { ok: false, message: "This piece is SOLD OUT" };
        }
        if (nextQty > item.stock) {
          return {
            ok: false,
            message: `Only ${item.stock} available`,
          };
        }

        set((state) => {
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, ...item, quantity: nextQty }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: item.quantity }],
          };
        });

        // Do not open the cart drawer - keep shopping uninterrupted
        return { ok: true, message: "Added to bag" };
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      setQuantity: (productId, quantity) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return { ok: false, message: "Item not in bag" };
        if (quantity <= 0) {
          get().removeItem(productId);
          return { ok: true, message: "Removed" };
        }
        if (quantity > item.stock) {
          return { ok: false, message: `Only ${item.stock} available` };
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
        return { ok: true, message: "Updated" };
      },

      clear: () => set({ items: [], couponCode: null }),
      setCouponCode: (code) => set({ couponCode: code }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "tjn-cart-v1",
      // Don't persist drawer open state across reloads
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
      }),
    }
  )
);
