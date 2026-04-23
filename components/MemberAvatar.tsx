"use client";

import { memberInitials, avatarColor, statusAvatarColor } from "@/lib/helpers";

interface Props {
  name: string;
  memberId: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: string;
  rounded?: "full" | "xl" | "2xl";
}

const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-16 w-16 text-xl",
};

export default function MemberAvatar({ name, memberId, size = "md", status, rounded = "full" }: Props) {
  const bgClass = status ? statusAvatarColor(status, memberId) : avatarColor(memberId);
  const radius = rounded === "full" ? "rounded-full" : rounded === "xl" ? "rounded-xl" : "rounded-2xl";
  
  return (
    <div
      className={`${sizes[size]} ${bgClass} ${radius} flex items-center justify-center font-bold tracking-tighter shrink-0 border border-white/5 shadow-sm`}
    >
      {memberInitials(name)}
    </div>
  );
}
