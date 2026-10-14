import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["name", "icon", "sortOrder"] as const) {
    if (key in body) data[key] = body[key];
  }
  const category = await prisma.category.update({ where: { id: params.id }, data });
  return NextResponse.json({ category });
}
