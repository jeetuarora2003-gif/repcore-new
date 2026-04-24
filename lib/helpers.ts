import { cleanIndianPhoneInput } from "@/lib/phone";

export const IST_TIME_ZONE = "Asia/Kolkata";

function isDateOnlyString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (isDateOnlyString(value)) return new Date(`${value}T00:00:00+05:30`);
  return new Date(value);
}

function getDateParts(value: string | Date, timeZone = IST_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.formatToParts(toDate(value)).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

export function toDateKey(value: string | Date, timeZone = IST_TIME_ZONE): string {
  const parts = getDateParts(value, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getTodayDateInput(timeZone = IST_TIME_ZONE): string {
  return toDateKey(new Date(), timeZone);
}

export function isSameDayInTimeZone(
  left: string | Date,
  right: string | Date,
  timeZone = IST_TIME_ZONE
): boolean {
  return toDateKey(left, timeZone) === toDateKey(right, timeZone);
}

export function startOfDayUtcIso(value: string | Date, timeZone = IST_TIME_ZONE): string {
  const key = toDateKey(value, timeZone);
  return `${key}T00:00:00+05:30`;
}

export function formatINR(amount: number | string | null | undefined): string {
  const val = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(val)) return "₹0";
  
  const hasPaise = Math.round((Math.abs(val) % 1) * 100) > 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(toDate(dateStr));
}

export function memberInitials(fullName: string | null | undefined): string {
  if (!fullName || !fullName.trim()) return "?";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[#10B981]/20 text-[#10B981]",
  "bg-[#8B5CF6]/20 text-[#8B5CF6]",
  "bg-[#F59E0B]/20 text-[#F59E0B]",
  "bg-[#EC4899]/20 text-[#EC4899]",
  "bg-[#06B6D4]/20 text-[#06B6D4]",
  "bg-[#F97316]/20 text-[#F97316]",
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

export function generateNumber(prefix: string, year: number, seq: number): string {
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
    case "active":
      return "Active";
    case "expiring_soon":
      return "Expiring";
    case "expired":
      return "Expired";
    case "lapsed":
      return "Lapsed";
    case "frozen":
      return "Frozen";
    case "no_plan":
      return "No Plan";
  }
}

export function getHourGreeting(date = new Date(), timeZone?: string): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone,
    }).format(date)
  );

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function cleanPhone(value: string): string {
  return cleanIndianPhoneInput(value);
}
