import type { Server } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var __vetraIo: Server | undefined;
}

export type ServerEvent =
  | { name: "order:new"; room: "kitchen" | "admin"; payload: unknown }
  | { name: "order:status"; room: string; payload: unknown }
  | { name: "call:new"; room: "waiters" | "admin"; payload: unknown }
  | { name: "call:status"; room: string; payload: unknown };

export function emitEvent(event: ServerEvent) {
  const io = global.__vetraIo;
  if (!io) return;
  io.to(event.room).emit(event.name, event.payload);
}

export function broadcastOrderNew(order: unknown, tableId: string) {
  emitEvent({ name: "order:new", room: "kitchen", payload: order });
  emitEvent({ name: "order:new", room: "admin", payload: order });
  emitEvent({ name: "order:new", room: "waiters", payload: order });
}

export function broadcastOrderStatus(order: unknown, tableId: string) {
  for (const room of ["kitchen", "admin", "waiters", `table:${tableId}`]) {
    emitEvent({ name: "order:status", room, payload: order });
  }
}

export function broadcastCallNew(call: unknown) {
  emitEvent({ name: "call:new", room: "waiters", payload: call });
  emitEvent({ name: "call:new", room: "admin", payload: call });
}

export function broadcastCallStatus(call: unknown, tableId: string) {
  for (const room of ["waiters", "admin", `table:${tableId}`]) {
    emitEvent({ name: "call:status", room, payload: call });
  }
}
