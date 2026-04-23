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
      <div className="sticky top-0 z-20 bg-[#121215]/95 backdrop-blur-md border-b border-[#3F3F46] px-4 py-3">
        <h1 className="text-lg font-bold text-[#FAFAFA]">More</h1>
      </div>
      <div className="px-4 py-4 space-y-2">
        {items.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 premium-card p-4 active:scale-[0.98] transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-[#27272A] flex items-center justify-center shrink-0">
              <Icon size={18} className="text-[#10B981]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#FAFAFA]">{label}</p>
              <p className="text-xs text-[#A1A1AA]">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#A1A1AA]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
