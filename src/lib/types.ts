export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "delivered"
  | "paid"
  | "cancelled";

export type CallType = "waiter" | "bill";
export type CallStatus = "pending" | "resolved";

export interface MenuItemDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  available: boolean;
  featured: boolean;
  spicy: boolean;
  vegetarian: boolean;
  prepMinutes: number;
  sortOrder: number;
  categoryId: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  items: MenuItemDTO[];
}

export interface OrderItemDTO {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes: string | null;
  status: OrderStatus;
  menuItemId: string | null;
}

export interface OrderDTO {
  id: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tableId: string;
  tableNumber: number;
  items: OrderItemDTO[];
  total: number;
}

export interface CallDTO {
  id: string;
  type: CallType;
  note: string | null;
  status: CallStatus;
  createdAt: string;
  resolvedAt: string | null;
  tableId: string;
  tableNumber: number;
}

export interface TableDTO {
  id: string;
  number: number;
  seats: number;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Recebido",
  preparing: "Em preparo",
  ready: "Pronto",
  delivered: "Entregue",
  paid: "Pago",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "delivered",
];
