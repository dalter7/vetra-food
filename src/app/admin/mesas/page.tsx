"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Plus, Trash2, Download, Copy, Printer } from "lucide-react";
import { useToast } from "@/components/Toasts";

interface TableRow {
  id: string;
  number: number;
  seats: number;
}

export default function MesasPage() {
  const { notify } = useToast();
  const [tables, setTables] = useState<TableRow[]>([]);
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTable, setNewTable] = useState({ number: "", seats: "4" });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function load() {
    const res = await fetch("/api/tables").then((r) => r.json());
    const rows: TableRow[] = res.tables
      .map((t: TableRow) => ({ id: t.id, number: t.number, seats: t.seats }))
      .sort((a: TableRow, b: TableRow) => a.number - b.number);
    setTables(rows);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!origin || tables.length === 0) return;
    (async () => {
      const entries = await Promise.all(
        tables.map(async (t) => {
          const url = `${origin}/mesa/${t.number}`;
          const dataUrl = await QRCode.toDataURL(url, {
            margin: 1,
            width: 320,
            color: { dark: "#15120F", light: "#FFFBF5" },
          });
          return [t.id, dataUrl] as const;
        })
      );
      setQrs(Object.fromEntries(entries));
    })();
  }, [origin, tables]);

  async function addTable() {
    if (!newTable.number) return;
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: Number(newTable.number), seats: Number(newTable.seats) || 4 }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      notify(data.error || "Não foi possível criar a mesa.", "error");
      return;
    }
    setNewTable({ number: "", seats: "4" });
    load();
  }

  async function removeTable(t: TableRow) {
    if (!confirm(`Remover a mesa ${t.number}? Pedidos e chamados dela serão apagados.`)) return;
    await fetch(`/api/tables/${t.number}`, { method: "DELETE" });
    load();
  }

  function copyLink(number: number) {
    navigator.clipboard.writeText(`${origin}/mesa/${number}`);
    notify("Link copiado!", "success");
  }

  function downloadQr(t: TableRow) {
    const link = document.createElement("a");
    link.href = qrs[t.id];
    link.download = `vetra-food-mesa-${t.number}.png`;
    link.click();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Mesas & QR Codes</h1>
          <p className="mt-1 text-sm text-ink-500">
            Imprima o QR Code de cada mesa — ele leva direto ao cardápio dela.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-cream-100 print:hidden"
        >
          <Printer size={15} /> Imprimir todas
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-2 rounded-xl2 border border-dashed border-ink-300 bg-white p-4 print:hidden">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Número</label>
          <input
            type="number"
            value={newTable.number}
            onChange={(e) => setNewTable((s) => ({ ...s, number: e.target.value }))}
            placeholder="13"
            className="mt-1.5 w-24 rounded-xl border border-ink-100 bg-cream-50 p-2.5 text-sm outline-none focus:border-ember-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Lugares</label>
          <input
            type="number"
            value={newTable.seats}
            onChange={(e) => setNewTable((s) => ({ ...s, seats: e.target.value }))}
            className="mt-1.5 w-24 rounded-xl border border-ink-100 bg-cream-50 p-2.5 text-sm outline-none focus:border-ember-500"
          />
        </div>
        <button
          onClick={addTable}
          className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={15} /> Nova mesa
        </button>
      </div>

      {loading && <p className="mt-8 text-sm text-ink-500">Carregando...</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3">
        {tables.map((t) => (
          <div
            key={t.id}
            className="flex flex-col items-center rounded-xl2 border border-ink-100 bg-white p-5 text-center shadow-soft print:break-inside-avoid print:shadow-none"
          >
            <span className="font-mono text-xs text-ink-500">MESA</span>
            <span className="font-display text-3xl font-bold text-ink-950">{t.number}</span>
            <span className="text-xs text-ink-500">{t.seats} lugares</span>

            <div className="mt-3 flex h-36 w-36 items-center justify-center rounded-xl bg-cream-100">
              {qrs[t.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrs[t.id]} alt={`QR Code mesa ${t.number}`} className="h-full w-full rounded-lg" />
              ) : (
                <div className="h-28 w-28 animate-pulse rounded-lg bg-ink-100" />
              )}
            </div>

            <p className="mt-2 break-all font-mono text-[10px] text-ink-500">/mesa/{t.number}</p>

            <div className="mt-3 flex gap-1.5 print:hidden">
              <button
                onClick={() => copyLink(t.number)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-100 text-ink-700 hover:bg-cream-100"
                aria-label="Copiar link"
              >
                <Copy size={13} />
              </button>
              <button
                onClick={() => downloadQr(t)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-100 text-ink-700 hover:bg-cream-100"
                aria-label="Baixar QR"
              >
                <Download size={13} />
              </button>
              <button
                onClick={() => removeTable(t)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-100 text-ink-300 hover:bg-rose-100 hover:text-rose-600"
                aria-label="Remover mesa"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
