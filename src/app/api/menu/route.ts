import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, price, emoji, categoryId, vegetarian, spicy, prepMinutes, featured } = body;

  if (!name || !categoryId || typeof price !== "number") {
    return NextResponse.json({ error: "Campos obrigatórios: name, categoryId, price" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      name,
      description: description ?? "",
      price,
      emoji: emoji || "🍽️",
      categoryId,
      vegetarian: !!vegetarian,
      spicy: !!spicy,
      featured: !!featured,
      prepMinutes: prepMinutes ?? 15,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
