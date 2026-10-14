import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const { name, icon } = await req.json();
  if (!name) return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name, icon: icon ?? "🍽️", sortOrder: count },
  });
  return NextResponse.json({ category }, { status: 201 });
}
