"use client"
import { cn } from "../../utils/cn"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { forwardRef } from "react"

export const ModernButton = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
      secondary:
        "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-600/50 hover:border-slate-500/50",
      ghost:
        "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white",
      danger:
        "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25",
      success:
        "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25",
      glass:
        "bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 text-slate-200 hover:text-white hover:bg-slate-900/60"
    }

    const sizes = {
      sm: "h-9 px-4 text-sm font-medium",
      md: "h-11 px-6 text-sm font-semibold",
      lg: "h-14 px-8 text-base font-semibold",
      xl: "h-16 px-10 text-lg font-semibold"
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    )
  }
)

ModernButton.displayName = "ModernButton"
