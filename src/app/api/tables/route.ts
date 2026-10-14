import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["received", "preparing", "ready", "delivered"];

export async function GET() {
  const tables = await prisma.table.findMany({
    orderBy: { number: "asc" },
    include: {
      orders: { where: { status: { in: ACTIVE_STATUSES } }, include: { items: true } },
      calls: { where: { status: "pending" } },
    },
  });

  const result = tables.map((t) => ({
    id: t.id,
    number: t.number,
    seats: t.seats,
    activeOrders: t.orders.length,
    itemsReady: t.orders.reduce(
      (sum, o) => sum + (o.status === "ready" ? o.items.length : 0),
      0
    ),
    orderStatuses: t.orders.map((o) => o.status),
    pendingCalls: t.calls.map((c) => c.type),
  }));

  return NextResponse.json({ tables: result });
}

export async function POST(req: NextRequest) {
  const { number, seats } = await req.json();
  if (!number) return NextResponse.json({ error: "Número da mesa é obrigatório" }, { status: 400 });

  const table = await prisma.table.create({
    data: { number: Number(number), seats: seats ? Number(seats) : 4 },
  });

  return NextResponse.json({ table }, { status: 201 });
}
