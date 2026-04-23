"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-text-secondary",
          actionButton:
            "group-[.toast]:bg-accent group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-hover group-[.toast]:text-text-secondary",
          success: "group-[.toaster]:border-status-success-border group-[.toaster]:bg-status-success-bg group-[.toaster]:text-status-success-text",
          error: "group-[.toaster]:border-status-danger-border group-[.toaster]:bg-status-danger-bg group-[.toaster]:text-status-danger-text",
          warning: "group-[.toaster]:border-status-warning-border group-[.toaster]:bg-status-warning-bg group-[.toaster]:text-status-warning-text",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
