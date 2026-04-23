import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary transition-all outline-none placeholder:text-text-muted focus:border-accent focus:ring-4 focus:ring-accent/5 disabled:cursor-not-allowed disabled:bg-hover disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
