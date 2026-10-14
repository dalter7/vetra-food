import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.call.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();

  for (let n = 1; n <= 12; n++) {
    await prisma.table.create({ data: { number: n, seats: n % 4 === 0 ? 6 : 4 } });
  }

  const categories = [
    {
      name: "Entradas",
      icon: "🥗",
      sortOrder: 0,
      items: [
        { name: "Pão de Alho Artesanal", description: "Pão rústico, manteiga de alho confit e ervas frescas", price: 24.9, emoji: "🥖", vegetarian: true, prepMinutes: 10 },
        { name: "Burrata com Tomates", description: "Burrata cremosa, tomates assados, pesto de manjericão e torradas", price: 42.0, emoji: "🧀", vegetarian: true, featured: true, prepMinutes: 10 },
        { name: "Carpaccio de Filé", description: "Finas lâminas de filé mignon, alcaparras, rúcula e lascas de parmesão", price: 46.0, emoji: "🥩", prepMinutes: 12 },
        { name: "Isca de Frango Crocante", description: "Tiras de frango empanadas, servidas com mostarda e mel", price: 36.0, emoji: "🍗", spicy: true, prepMinutes: 15 },
      ],
    },
    {
      name: "Pratos Principais",
      icon: "🍽️",
      sortOrder: 1,
      items: [
        { name: "Filé ao Molho Madeira", description: "Filé mignon grelhado, molho madeira, batatas rústicas e legumes salteados", price: 89.0, emoji: "🥩", featured: true, prepMinutes: 25 },
        { name: "Salmão Grelhado", description: "Salmão em crosta de ervas, purê de mandioquinha e aspargos", price: 78.0, emoji: "🐟", prepMinutes: 22 },
        { name: "Risoto de Funghi", description: "Arroz arbóreo cremoso, mix de cogumelos frescos e parmesão", price: 68.0, emoji: "🍄", vegetarian: true, prepMinutes: 20 },
        { name: "Frango à Parmegiana", description: "Peito de frango empanado, molho de tomate artesanal e muçarela gratinada", price: 59.0, emoji: "🍗", prepMinutes: 25 },
        { name: "Picanha na Brasa", description: "400g de picanha grelhada, farofa crocante, vinagrete e pão de alho", price: 96.0, emoji: "🔥", featured: true, prepMinutes: 28 },
      ],
    },
    {
      name: "Massas",
      icon: "🍝",
      sortOrder: 2,
      items: [
        { name: "Nhoque de Batata ao Sugo", description: "Nhoque artesanal, molho de tomate fresco e manjericão", price: 52.0, emoji: "🍝", vegetarian: true, prepMinutes: 18 },
        { name: "Fettuccine Alfredo", description: "Massa fresca em molho cremoso de parmesão com toque de noz-moscada", price: 56.0, emoji: "🍜", vegetarian: true, prepMinutes: 18 },
        { name: "Spaghetti à Carbonara", description: "Receita tradicional com pancetta, gema de ovo e pecorino", price: 58.0, emoji: "🍝", prepMinutes: 18 },
      ],
    },
    {
      name: "Sobremesas",
      icon: "🍰",
      sortOrder: 3,
      items: [
        { name: "Petit Gâteau", description: "Bolo quente de chocolate belga com sorvete de creme", price: 32.0, emoji: "🍫", vegetarian: true, featured: true, prepMinutes: 12 },
        { name: "Cheesecake de Frutas Vermelhas", description: "Base crocante, creme de queijo e calda artesanal de frutas vermelhas", price: 28.0, emoji: "🍰", vegetarian: true, prepMinutes: 5 },
        { name: "Tiramisù", description: "Clássico italiano com café espresso e mascarpone", price: 30.0, emoji: "☕", vegetarian: true, prepMinutes: 5 },
      ],
    },
    {
      name: "Bebidas",
      icon: "🥤",
      sortOrder: 4,
      items: [
        { name: "Suco Natural", description: "Laranja, limão ou maracujá — escolha na observação do pedido", price: 14.0, emoji: "🧃", vegetarian: true, prepMinutes: 5 },
        { name: "Água com ou sem Gás", description: "500ml", price: 8.0, emoji: "💧", vegetarian: true, prepMinutes: 2 },
        { name: "Refrigerante", description: "Lata 350ml", price: 9.0, emoji: "🥤", vegetarian: true, prepMinutes: 2 },
        { name: "Vinho Tinto (Taça)", description: "Seleção da casa — consulte o garçom sobre o rótulo do dia", price: 32.0, emoji: "🍷", prepMinutes: 3 },
        { name: "Caipirinha", description: "Limão, morango ou maracujá", price: 26.0, emoji: "🍹", prepMinutes: 8 },
      ],
    },
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        items: {
          create: cat.items.map((it, idx) => ({
            name: it.name,
            description: it.description,
            price: it.price,
            emoji: it.emoji,
            vegetarian: "vegetarian" in it ? !!it.vegetarian : false,
            spicy: "spicy" in it ? !!it.spicy : false,
            featured: "featured" in it ? !!it.featured : false,
            prepMinutes: it.prepMinutes,
            sortOrder: idx,
          })),
        },
      },
    });
  }

  console.log("Seed concluído: 12 mesas e cardápio completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
