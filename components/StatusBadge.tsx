"use client";

import { statusBadgeClass, statusLabel, type MemberStatusType } from "@/lib/helpers";

interface Props {
  status: MemberStatusType;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(status)} ${className}`}
    >
      {statusLabel(status)}
    </span>
  );
}
