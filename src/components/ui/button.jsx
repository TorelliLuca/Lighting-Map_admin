import React from "react"

export const Button = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-blue-600/80 text-white hover:bg-blue-500/80 border-blue-500/50",
      outline:
        "bg-transparent border border-slate-600/50 text-slate-200 hover:bg-slate-800/50",
      ghost: "bg-transparent text-slate-200 hover:bg-slate-800/30",
      glass:
        "bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 text-slate-200 hover:bg-slate-700/40"
    }

    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 px-4 text-sm",
      lg: "h-13 px-8 text-lg",
      icon: "h-11 w-11 p-0"
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
