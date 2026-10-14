import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toOrderDTO, toCallDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["received", "preparing", "ready", "delivered"];

export async function GET(_req: NextRequest, { params }: { params: { numero: string } }) {
  const number = Number(params.numero);
  const table = await prisma.table.findUnique({ where: { number } });

  if (!table) {
    return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
  }

  const [orders, calls] = await Promise.all([
    prisma.order.findMany({
      where: { tableId: table.id, status: { in: ACTIVE_STATUSES } },
      include: { items: true, table: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.call.findMany({
      where: { tableId: table.id, status: "pending" },
      include: { table: true },
    }),
  ]);

  return NextResponse.json({
    table: { id: table.id, number: table.number, seats: table.seats },
    orders: orders.map(toOrderDTO),
    calls: calls.map(toCallDTO),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { numero: string } }) {
  const number = Number(params.numero);
  const table = await prisma.table.findUnique({ where: { number } });
  if (!table) return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
  await prisma.table.delete({ where: { id: table.id } });
  return NextResponse.json({ ok: true });
}
