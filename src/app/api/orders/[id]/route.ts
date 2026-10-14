import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toOrderDTO } from "@/lib/dto";
import { broadcastOrderStatus } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["received", "preparing", "ready", "delivered", "paid", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      items: {
        updateMany: { where: {}, data: { status } },
      },
    },
    include: { items: true, table: true },
  });

  const dto = toOrderDTO(order);
  broadcastOrderStatus(dto, order.tableId);

  return NextResponse.json({ order: dto });
}
