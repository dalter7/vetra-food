import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCallDTO } from "@/lib/dto";
import { broadcastCallNew } from "@/lib/socket-server";

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
  const { tableNumber, type } = await req.json();

  if (!tableNumber || !["waiter", "bill"].includes(type)) {
    return NextResponse.json({ error: "Mesa e tipo são obrigatórios" }, { status: 400 });
  }

  const table = await prisma.table.findUnique({ where: { number: Number(tableNumber) } });
  if (!table) return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });

  const existing = await prisma.call.findFirst({
    where: { tableId: table.id, type, status: "pending" },
  });
  if (existing) {
    const dto = toCallDTO({ ...existing, table });
    return NextResponse.json({ call: dto }, { status: 200 });
  }

  const call = await prisma.call.create({
    data: { tableId: table.id, type },
    include: { table: true },
  });

  const dto = toCallDTO(call);
  broadcastCallNew(dto);

  return NextResponse.json({ call: dto }, { status: 201 });
}
