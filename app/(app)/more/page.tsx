import Link from "next/link";
import { ClipboardList, BarChart2, Settings, ChevronRight } from "lucide-react";

const items = [
  { href: "/plans", icon: ClipboardList, label: "Plans", desc: "Manage membership plans" },
  { href: "/reports", icon: BarChart2, label: "Reports", desc: "Revenue & payment analytics" },
  { href: "/settings", icon: Settings, label: "Settings", desc: "Gym profile & preferences" },
];

export default function MorePage() {
  return (
    <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <h1 className="text-lg font-bold text-[#F1F5F9]">More</h1>
      </div>
      <div className="px-4 py-4 space-y-2">
        {items.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 premium-card p-4 active:scale-[0.98] transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-[#1C1C2E] flex items-center justify-center shrink-0">
              <Icon size={18} className="text-[#6366F1]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#F1F5F9]">{label}</p>
              <p className="text-xs text-[#94A3B8]">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#94A3B8]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
