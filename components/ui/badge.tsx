import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-white hover:bg-accent-hover",
        secondary:
          "border-transparent bg-hover text-text-primary hover:bg-border",
        destructive:
          "border-status-danger-border bg-status-danger-bg text-status-danger-text",
        outline: "text-text-primary border-border",
        success: "border-status-success-border bg-status-success-bg text-status-success-text",
        warning: "border-status-warning-border bg-status-warning-bg text-status-warning-text",
        info: "border-status-info-border bg-status-info-bg text-status-info-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
