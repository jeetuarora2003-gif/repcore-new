import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#30363D] bg-[#161B22] px-4 py-2 text-[14px] text-[#FAFAFA] transition-all file:border-0 file:bg-transparent file:text-[14px] file:font-medium placeholder:text-[#71717A] focus-visible:outline-none focus-visible:border-[#10B981] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
