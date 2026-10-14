"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, QrCode } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/admin/mesas", label: "Mesas & QR Codes", icon: QrCode },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto md:mt-8 md:flex-col md:overflow-visible">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-ink-950 text-cream-50" : "text-ink-700 hover:bg-cream-100"
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
