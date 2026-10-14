import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCallDTO } from "@/lib/dto";
import { broadcastCallNew, broadcastCallStatus } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const calls = await prisma.call.findMany({
    where: status ? { status } : {},
    include: { table: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ calls: calls.map(toCallDTO) });
}

export async function POST(req: NextRequest) {
  const { tableNumber, type, note } = await req.json();

  if (!tableNumber || !["waiter", "bill"].includes(type)) {
    return NextResponse.json({ error: "Mesa e tipo são obrigatórios" }, { status: 400 });
  }

  const cleanNote = typeof note === "string" && note.trim() ? note.trim().slice(0, 280) : null;

  const table = await prisma.table.findUnique({ where: { number: Number(tableNumber) } });
  if (!table) return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });

  const existing = await prisma.call.findFirst({
    where: { tableId: table.id, type, status: "pending" },
  });
  if (existing) {
    // Already calling — if the customer added a new note, refresh it and
    // re-notify the waiters instead of silently dropping the extra context.
    if (cleanNote && cleanNote !== existing.note) {
      const updated = await prisma.call.update({
        where: { id: existing.id },
        data: { note: cleanNote },
        include: { table: true },
      });
      const dto = toCallDTO(updated);
      broadcastCallStatus(dto, table.id);
      return NextResponse.json({ call: dto }, { status: 200 });
    }
    const dto = toCallDTO({ ...existing, table });
    return NextResponse.json({ call: dto }, { status: 200 });
  }

  const call = await prisma.call.create({
    data: { tableId: table.id, type, note: cleanNote },
    include: { table: true },
  });

  const dto = toCallDTO(call);
  broadcastCallNew(dto);

  return NextResponse.json({ call: dto }, { status: 201 });
}
