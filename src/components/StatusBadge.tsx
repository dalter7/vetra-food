import clsx from "clsx";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABEL } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  received: "bg-ink-100 text-ink-700",
  preparing: "bg-gold-100 text-gold-600",
  ready: "bg-sage-100 text-sage-600",
  delivered: "bg-cream-200 text-ink-500",
  paid: "bg-ink-100 text-ink-500",
  cancelled: "bg-rose-100 text-rose-600",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        STYLES[status],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
