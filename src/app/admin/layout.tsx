import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 md:flex">
      <aside className="border-b border-ink-100 bg-white px-5 py-5 md:w-60 md:shrink-0 md:border-b-0 md:border-r md:px-4 md:py-6">
        <Link href="/" className="inline-block transition active:opacity-60" aria-label="Voltar ao início">
          <Logo size="sm" />
        </Link>
        <AdminNav />
        <Link href="/" className="mt-8 hidden items-center gap-2 text-xs text-ink-500 hover:text-ink-950 md:flex">
          <ArrowLeft size={14} /> Voltar ao início
        </Link>
      </aside>
      <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
