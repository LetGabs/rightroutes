import { STATUS_CLASS, STATUS_LABEL, TIPO_CLASS, TIPO_SHORT, type DeliveryStatus, type DeliveryType } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function TipoBadge({ tipo, className }: { tipo: DeliveryType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TIPO_CLASS[tipo],
        className,
      )}
    >
      {TIPO_SHORT[tipo]}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: DeliveryStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_CLASS[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PrazoBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive whitespace-nowrap">
      ⚠️ Prazo encerrado
    </span>
  );
}
