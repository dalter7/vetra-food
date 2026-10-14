import type { Order, OrderItem, Call, Table } from "@prisma/client";
import type { CallDTO, OrderDTO, OrderStatus, CallType, CallStatus } from "./types";

type OrderWithRelations = Order & { items: OrderItem[]; table: Table };

export function toOrderDTO(order: OrderWithRelations): OrderDTO {
  const total = order.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  return {
    id: order.id,
    status: order.status as OrderStatus,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    tableId: order.tableId,
    tableNumber: order.table.number,
    items: order.items.map((it) => ({
      id: it.id,
      name: it.name,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      notes: it.notes,
      status: it.status as OrderStatus,
      menuItemId: it.menuItemId,
    })),
    total,
  };
}

type CallWithTable = Call & { table: Table };

export function toCallDTO(call: CallWithTable): CallDTO {
  return {
    id: call.id,
    type: call.type as CallType,
    status: call.status as CallStatus,
    createdAt: call.createdAt.toISOString(),
    resolvedAt: call.resolvedAt ? call.resolvedAt.toISOString() : null,
    tableId: call.tableId,
    tableNumber: call.table.number,
  };
}
