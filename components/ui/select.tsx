import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({ ...props }: SelectPrimitive.Root.Props<string>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group flex h-11 w-full items-center justify-between rounded-xl border border-[#30363D] bg-[#161B22] px-4 py-2 text-[14px] text-[#E4E4E7] transition-all focus-visible:outline-none focus-visible:border-[#10B981] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="size-4 shrink-0 text-[#71717A] group-aria-expanded:rotate-180 transition-transform duration-200"
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Popup
        data-slot="select-content"
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22] text-[#E4E4E7] shadow-xl transition duration-150 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpArrow className="flex cursor-default items-center justify-center py-1">
          <ChevronDownIcon className="size-4 rotate-180" />
        </SelectPrimitive.ScrollUpArrow>
        <div className="p-1">
          {children}
        </div>
        <SelectPrimitive.ScrollDownArrow className="flex cursor-default items-center justify-center py-1">
          <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ScrollDownArrow>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-3 py-1.5 text-[11px] font-semibold text-[#71717A] uppercase tracking-wider", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-3 pr-9 text-[14px] font-medium outline-none data-highlighted:bg-[#10B981]/10 data-highlighted:text-[#10B981] data-disabled:pointer-events-none data-disabled:opacity-50 transition-colors",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-3 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

export {
  Select,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectTrigger,
}
