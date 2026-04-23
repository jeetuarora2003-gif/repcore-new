"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatINR } from "@/lib/helpers";
import { TrendingUp, UserPlus, AlertCircle, Wallet, Smartphone, CreditCard, Building2 } from "lucide-react";

interface Props {
  monthRevenue: number;
  newMembersCount: number;
  totalDues: number;
  monthlyRevenue: { month: string; amount: number }[];
  methodBreakdown: { method: string; count: number; amount: number }[];
  statusBreakdown: Record<string, number>;
}

const METHOD_ICONS: Record<string, React.ReactNode> = {
  cash: <Wallet size={16} />,
  upi: <Smartphone size={16} />,
  card: <CreditCard size={16} />,
  bank_transfer: <Building2 size={16} />,
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#22C55E", bg: "bg-[#22C55E]" },
  expiring_soon: { label: "Expiring", color: "#F59E0B", bg: "bg-[#F59E0B]" },
  expired: { label: "Expired", color: "#EF4444", bg: "bg-[#EF4444]" },
  lapsed: { label: "Lapsed", color: "#64748B", bg: "bg-slate-500" },
  frozen: { label: "Frozen", color: "#3B82F6", bg: "bg-blue-500" },
  no_plan: { label: "No Plan", color: "#64748B", bg: "bg-slate-500" },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1C1C2E] border border-[#1E1E30] rounded-xl px-3 py-2">
        <p className="text-xs text-[#94A3B8]">{label}</p>
        <p className="text-sm font-bold text-[#F1F5F9]">{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function ReportsClient({ monthRevenue, newMembersCount, totalDues, monthlyRevenue, methodBreakdown, statusBreakdown }: Props) {
  const totalMembers = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
  const statusChartData = Object.entries(statusBreakdown)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      label: STATUS_CONFIG[status]?.label ?? status,
      fill: STATUS_CONFIG[status]?.color ?? "#64748B",
    }));

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D14]/95 backdrop-blur-md border-b border-[#1E1E30] px-4 py-3">
        <h1 className="text-lg font-bold text-[#F1F5F9]">Reports</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Summary Cards */}
        <div className="space-y-3">
          {[
            { label: "This Month Revenue", value: formatINR(monthRevenue), icon: TrendingUp, color: "text-[#6366F1]", bg: "bg-[#6366F1]/10" },
            { label: "New Members This Month", value: String(newMembersCount), icon: UserPlus, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
            { label: "Pending Dues Total", value: formatINR(totalDues), icon: AlertCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-4">Revenue — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyRevenue} barSize={28}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1C1C2E" }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {monthlyRevenue.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === monthlyRevenue.length - 1 ? "#6366F1" : "#6366F1"}
                    fillOpacity={index === monthlyRevenue.length - 1 ? 1 : 0.4}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member Status Breakdown */}
        <div className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-4">Member Status Breakdown</p>
          <div className="space-y-3">
            {statusChartData.map(({ status, count, label, fill }) => {
              const pct = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#F1F5F9]">{label}</span>
                    <span className="text-sm text-[#94A3B8]">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-[#1C1C2E] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">Payment Methods</p>
          <div className="grid grid-cols-2 gap-3">
            {methodBreakdown.map(({ method, count, amount }) => (
              <div key={method} className="bg-[#13131F] border border-[#1E1E30] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
                    {METHOD_ICONS[method]}
                  </div>
                  <span className="text-sm font-medium text-[#F1F5F9]">{METHOD_LABELS[method]}</span>
                </div>
                <p className="text-2xl font-bold text-[#F1F5F9]">{formatINR(amount)}</p>
                <p className="text-xs text-[#94A3B8]">{count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
