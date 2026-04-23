"use client";

import Link from "next/link";
import { ChevronLeft, IndianRupee, Phone, ChevronRight, AlertCircle } from "lucide-react";
import { formatINR } from "@/lib/helpers";
import type { MemberStatus } from "@/lib/supabase/types";
import MemberAvatar from "@/components/MemberAvatar";

interface Props {
  members: MemberStatus[];
}

export default function DuesClient({ members }: Props) {
  const totalDues = members.reduce((sum, m) => sum + (m.balance_due ?? 0), 0);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wider mb-4"
        >
          <ChevronLeft size={14} />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Pending Dues</h1>
            <p className="text-sm text-text-secondary mt-1">Members with outstanding balances</p>
          </div>
          <div className="bg-white border border-border rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-status-danger-bg flex items-center justify-center border border-status-danger-border">
              <IndianRupee size={16} className="text-status-danger-text" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Outstanding</p>
              <p className="text-xl font-bold font-mono text-status-danger-text tracking-tighter">{formatINR(totalDues)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-16 text-center">
          <AlertCircle size={40} className="mx-auto text-accent mb-4 opacity-20" />
          <p className="text-sm font-semibold text-text-secondary">All dues are clear — great job!</p>
          <p className="text-xs text-text-muted mt-1">No members have pending balances right now.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-3 bg-page border-b border-border">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Member</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-28 text-right">Invoiced</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-28 text-right">Paid</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest w-28 text-right">Balance Due</span>
          </div>

          {members.map((m) => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto] gap-2 md:gap-4 items-start md:items-center px-5 md:px-6 py-4 hover:bg-hover transition-colors group"
            >
              {/* Member Info */}
              <div className="flex items-center gap-3 min-w-0">
                <MemberAvatar
                  name={m.full_name}
                  memberId={m.id}
                  photoUrl={m.photo_url}
                  size="md"
                  rounded="full"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{m.full_name}</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${m.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-accent font-mono transition-colors"
                    >
                      <Phone size={10} />
                      {m.phone}
                    </a>
                    {m.plan_name && (
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-page px-2 py-0.5 rounded-full border border-border">
                        {m.plan_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financials — Mobile */}
              <div className="flex items-center gap-4 pl-12 md:hidden">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Invoiced</p>
                  <p className="text-xs font-bold font-mono text-text-primary">{formatINR(m.total_invoiced)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Paid</p>
                  <p className="text-xs font-bold font-mono text-accent-text">{formatINR(m.total_paid)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Due</p>
                  <p className="text-xs font-bold font-mono text-status-danger-text">{formatINR(m.balance_due)}</p>
                </div>
              </div>

              {/* Financials — Desktop */}
              <span className="hidden md:block text-sm font-bold font-mono text-text-primary w-28 text-right">
                {formatINR(m.total_invoiced)}
              </span>
              <span className="hidden md:block text-sm font-bold font-mono text-accent-text w-28 text-right">
                {formatINR(m.total_paid)}
              </span>
              <div className="hidden md:flex items-center gap-2 w-28 justify-end">
                <span className="text-sm font-bold font-mono text-status-danger-text">
                  {formatINR(m.balance_due)}
                </span>
                <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {members.length > 0 && (
        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {members.length} member{members.length !== 1 ? "s" : ""} with pending dues
          </p>
          <p className="text-xs font-bold text-text-muted">
            Total: <span className="text-status-danger-text font-mono">{formatINR(totalDues)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
