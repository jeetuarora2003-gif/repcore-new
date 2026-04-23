export function formatINR(amount: number): string {
  return "₹" + Math.floor(amount).toLocaleString("en-IN");
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
  "bg-[#10B981]/20 text-[#10B981]", // Emerald
  "bg-[#8B5CF6]/20 text-[#8B5CF6]", // Violet
  "bg-[#F59E0B]/20 text-[#F59E0B]", // Amber
  "bg-[#EC4899]/20 text-[#EC4899]", // Pink
  "bg-[#06B6D4]/20 text-[#06B6D4]", // Cyan
  "bg-[#F97316]/20 text-[#F97316]", // Orange
];

export function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_AVATAR_COLORS: Record<string, string> = {
  active: "bg-[#10B981]/20 text-[#10B981]",
  expiring_soon: "bg-[#F59E0B]/20 text-[#F59E0B]",
  expired: "bg-[#EF4444]/20 text-[#EF4444]",
  lapsed: "bg-[#3F3F46] text-[#71717A]",
  frozen: "bg-[#06B6D4]/20 text-[#06B6D4]",
  no_plan: "bg-[#27272A] text-[#71717A]",
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
      return "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20";
    case "expiring_soon":
      return "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20";
    case "expired":
      return "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20";
    case "lapsed":
      return "bg-[#27272A] text-[#71717A] border border-[#3F3F46]";
    case "frozen":
      return "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20";
    case "no_plan":
      return "bg-[#27272A] text-[#71717A] border border-[#3F3F46]";
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
