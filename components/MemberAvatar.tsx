"use client";

import { memberInitials, avatarColor, statusAvatarColor } from "@/lib/helpers";

interface Props {
  name: string;
  memberId: string;
  size?: "sm" | "md" | "lg";
  status?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export default function MemberAvatar({ name, memberId, size = "md", status }: Props) {
  const bgClass = status ? statusAvatarColor(status, memberId) : avatarColor(memberId);
  return (
    <div
      className={`${sizes[size]} ${bgClass} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
    >
      {memberInitials(name)}
    </div>
  );
}
