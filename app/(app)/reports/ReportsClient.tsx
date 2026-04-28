"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "#1A7A5E" },
  expiring_soon: { label: "Expiring", color: "#B85C00" },
  expired: { label: "Expired", color: "#C0392B" },
  lapsed: { label: "Lapsed", color: "#6B7280" },
  frozen: { label: "Frozen", color: "#2563EB" },
  no_plan: { label: "No Plan", color: "#9CA3AF" },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border-2 border-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-bold text-text-primary font-mono">{formatINR(payload[0].value)}</p>
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
      fill: STATUS_CONFIG[status]?.color ?? "#6B7280",
    }));

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Business Intelligence</h1>
        <p className="text-sm text-text-secondary mt-1">Growth metrics and revenue performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Revenue Collected", value: formatINR(monthRevenue), sub: "current month", icon: TrendingUp, accent: "border-t-[#1A7A5E]", valColor: "text-accent-text" },
          { label: "New Joinings", value: String(newMembersCount), sub: "member growth", icon: UserPlus, accent: "border-t-[#2563EB]", valColor: "text-text-primary" },
          { label: "Total Outstanding", value: formatINR(totalDues), sub: "pending dues", icon: AlertCircle, accent: "border-t-[#C0392B]", valColor: "text-status-danger-text" },
        ].map(({ label, value, sub, icon: Icon, accent, valColor }) => (
          <div key={label} className={`bg-white border border-border border-t-[3px] ${accent} rounded-2xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
              <Icon size={18} className="text-text-muted" />
            </div>
            <div>
              <p className={`text-3xl font-bold font-mono tracking-tighter tabular-nums ${valColor}`}>{value}</p>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Revenue Momentum</h3>
            <p className="text-xs text-text-secondary mt-1">Month-on-month collection history</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-light rounded-full border border-accent-border">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[10px] font-bold text-accent-text uppercase tracking-widest">Monthly Collection</span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue} barSize={40}>
              <CartesianGrid vertical={false} stroke="#F1F0EC" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9BA3AF", fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={12}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8F7F4", radius: 8 }} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#1A7A5E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Member Status Breakdown */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Membership Mix</h3>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{totalMembers} Total Members</span>
          </div>
          <div className="space-y-6">
            {statusChartData.map(({ status, count, label, fill }) => {
              const pct = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
              return (
                <div key={status} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wide">{label}</span>
                    <span className="text-xs font-bold font-mono text-text-muted">{count}</span>
                  </div>
                  <div className="h-2 bg-page rounded-full overflow-hidden border border-border/50">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
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
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Payment Channels</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methodBreakdown.map(({ method, count, amount }) => (
              <div key={method} className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:border-border-strong transition-colors group">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-10 w-10 rounded-xl bg-page flex items-center justify-center text-text-muted border border-border group-hover:bg-accent-light group-hover:text-accent-text group-hover:border-accent-border transition-all">
                    {METHOD_ICONS[method]}
                  </div>
                  <span className="text-[9px] font-bold text-text-muted bg-hover px-2 py-1 rounded-full uppercase tracking-widest">{count} txns</span>
                </div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{METHOD_LABELS[method]}</p>
                <p className="text-2xl font-bold font-mono text-text-primary tracking-tight">{formatINR(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
