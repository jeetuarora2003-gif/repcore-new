import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-[14px] font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#10B981] text-white hover:brightness-110",
        outline:
          "border-[#30363D] bg-transparent text-[#E6EDF3] hover:bg-[#161B22] hover:border-[#71717A]",
        secondary:
          "bg-[#1C2128] text-[#E6EDF3] hover:bg-[#21262D] text-[13px] font-medium",
        ghost:
          "text-[#8B949E] hover:text-[#E4E4E7] hover:bg-[#161B22] text-[13px] font-medium",
        destructive:
          "bg-[#F85149]/10 text-[#F85149] hover:bg-[#F85149]/20 border border-[#F85149]/20",
        link: "text-[#10B981] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4",
        xs: "h-7 px-2 text-[11px] rounded-lg",
        sm: "h-8 px-3 text-[12px] rounded-lg",
        lg: "h-12 px-6 rounded-2xl text-[15px]",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
