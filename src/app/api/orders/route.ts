import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toOrderDTO } from "@/lib/dto";
import { broadcastOrderNew } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["received", "preparing", "ready", "delivered"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableNumber = searchParams.get("tableNumber");
  const activeOnly = searchParams.get("active") === "true";

  const orders = await prisma.order.findMany({
    where: {
      ...(tableNumber ? { table: { number: Number(tableNumber) } } : {}),
      ...(activeOnly ? { status: { in: ACTIVE_STATUSES } } : {}),
    },
    include: { items: true, table: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders: orders.map(toOrderDTO) });
}

interface IncomingItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tableNumber, items, notes } = body as {
    tableNumber: number;
    items: IncomingItem[];
    notes?: string;
  };

  if (!tableNumber || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Mesa e itens são obrigatórios" }, { status: 400 });
  }

  const table = await prisma.table.findUnique({ where: { number: Number(tableNumber) } });
  if (!table) {
    return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
  }

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  for (const line of items) {
    const mi = menuItemMap.get(line.menuItemId);
    if (!mi || !mi.available) {
      return NextResponse.json(
        { error: `Item indisponível: ${mi?.name ?? line.menuItemId}` },
        { status: 400 }
      );
    }
    if (!line.quantity || line.quantity < 1) {
      return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 });
    }
  }

  const order = await prisma.order.create({
    data: {
      tableId: table.id,
      notes: notes || null,
      items: {
        create: items.map((line) => {
          const mi = menuItemMap.get(line.menuItemId)!;
          return {
            name: mi.name,
            unitPrice: mi.price,
            quantity: line.quantity,
            notes: line.notes || null,
            menuItemId: mi.id,
          };
        }),
      },
    },
    include: { items: true, table: true },
  });

  const dto = toOrderDTO(order);
  broadcastOrderNew(dto, table.id);

  return NextResponse.json({ order: dto }, { status: 201 });
}
