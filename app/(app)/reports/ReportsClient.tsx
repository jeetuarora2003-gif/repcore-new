"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
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
  cash: <Wallet size={14} />,
  upi: <Smartphone size={14} />,
  card: <CreditCard size={14} />,
  bank_transfer: <Building2 size={14} />,
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#10B981", bg: "bg-[#10B981]" },
  expiring_soon: { label: "Expiring", color: "#F59E0B", bg: "bg-[#F59E0B]" },
  expired: { label: "Expired", color: "#EF4444", bg: "bg-[#EF4444]" },
  lapsed: { label: "Lapsed", color: "#A1A1AA", bg: "bg-[#71717A]" },
  frozen: { label: "Frozen", color: "#388BFD", bg: "bg-[#388BFD]" },
  no_plan: { label: "No Plan", color: "#71717A", bg: "bg-[#3F3F46]" },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-2 border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5">{label}</p>
        <p className="text-base font-bold text-[#FAFAFA] font-mono">{formatINR(payload[0].value)}</p>
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
      fill: STATUS_CONFIG[status]?.color ?? "#71717A",
    }));

  return (
    <div className="pb-24 min-h-screen bg-[#09090B] animate-fade-up">
      <div className="px-4 py-6 md:px-8 space-y-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "This Month Revenue", value: formatINR(monthRevenue), icon: TrendingUp, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", valueColor: "text-[#F59E0B]" },
            { label: "New Members", value: String(newMembersCount), icon: UserPlus, color: "text-[#10B981]", bg: "bg-[#10B981]/10", valueColor: "text-[#FAFAFA]" },
            { label: "Pending Dues", value: formatINR(totalDues), icon: AlertCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/12", valueColor: "text-[#EF4444]" },
          ].map(({ label, value, icon: Icon, color, bg, valueColor }) => (
            <div key={label} className="card p-6 flex items-center gap-5">
              <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5">{label}</p>
                <p className={`text-2xl font-bold font-mono tracking-tighter tabular-nums ${valueColor}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">Revenue History</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Revenue</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyRevenue} barSize={32}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717A", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={12}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)", radius: 8 }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Member Status Breakdown */}
          <div className="card p-6">
            <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-[0.15em] mb-8">Status Breakdown</p>
            <div className="space-y-6">
              {statusChartData.map(({ status, count, label, fill }) => {
                const pct = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
                return (
                  <div key={status} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#FAFAFA]">{label}</span>
                      <span className="text-xs font-bold font-mono text-[#A1A1AA]">{count}</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: fill }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-[0.15em] px-1">Payment Performance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {methodBreakdown.map(({ method, count, amount }) => (
                <div key={method} className="card p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-8 w-8 rounded-xl bg-surface-3 flex items-center justify-center text-[#A1A1AA] border border-white/5">
                      {METHOD_ICONS[method]}
                    </div>
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">{count} txns</span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">{METHOD_LABELS[method]}</p>
                  <p className="text-xl font-bold font-mono text-[#F59E0B] tracking-tight">{formatINR(amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
