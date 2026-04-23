export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function memberInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[#6366F1]",
  "bg-[#22C55E]",
  "bg-[#F59E0B]",
  "bg-[#EF4444]",
  "bg-[#8B5CF6]",
  "bg-[#14B8A6]",
];

export function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_AVATAR_COLORS: Record<string, string> = {
  active: "bg-[#6366F1]",
  expiring_soon: "bg-[#F59E0B]",
  expired: "bg-[#EF4444]",
  lapsed: "bg-slate-600",
  frozen: "bg-blue-600",
  no_plan: "bg-slate-600",
};

export function statusAvatarColor(status: string, id: string): string {
  return STATUS_AVATAR_COLORS[status] ?? avatarColor(id);
}

export function generateNumber(
  prefix: string,
  year: number,
  seq: number
): string {
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}

export type MemberStatusType =
  | "active"
  | "expiring_soon"
  | "expired"
  | "lapsed"
  | "frozen"
  | "no_plan";

export function statusBadgeClass(status: MemberStatusType): string {
  switch (status) {
    case "active":
      return "bg-[#22C55E]/15 text-[#22C55E]";
    case "expiring_soon":
      return "bg-[#F59E0B]/15 text-[#F59E0B]";
    case "expired":
      return "bg-[#EF4444]/15 text-[#EF4444]";
    case "lapsed":
      return "bg-slate-700 text-slate-400";
    case "frozen":
      return "bg-blue-900/30 text-blue-400";
    case "no_plan":
      return "bg-slate-700 text-slate-400";
  }
}

export function statusLabel(status: MemberStatusType): string {
  switch (status) {
    case "active": return "Active";
    case "expiring_soon": return "Expiring";
    case "expired": return "Expired";
    case "lapsed": return "Lapsed";
    case "frozen": return "❄️ Frozen";
    case "no_plan": return "No Plan";
  }
}

export function getHourGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function cleanPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}
