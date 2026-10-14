export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function minutesSince(date: string | Date): number {
  const then = typeof date === "string" ? new Date(date) : date;
  return Math.max(0, Math.floor((Date.now() - then.getTime()) / 60000));
}

export function elapsedLabel(date: string | Date): string {
  const mins = minutesSince(date);
  if (mins < 1) return "agora";
  if (mins === 1) return "1 min";
  return `${mins} min`;
}
