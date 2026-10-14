import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCallDTO } from "@/lib/dto";
import { broadcastCallStatus } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  if (!["pending", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const call = await prisma.call.update({
    where: { id: params.id },
    data: { status, resolvedAt: status === "resolved" ? new Date() : null },
    include: { table: true },
  });

  const dto = toCallDTO(call);
  broadcastCallStatus(dto, call.tableId);

  return NextResponse.json({ call: dto });
}
