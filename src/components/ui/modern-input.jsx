import { cn } from "../../utils/cn"
import { forwardRef } from "react"

export const ModernInput = forwardRef(
  ({ className, label, error, icon, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-slate-800/50 border-slate-600/50 focus:border-blue-500/70 focus:bg-slate-800/70",
      glass:
        "bg-slate-900/40 backdrop-blur-xl border-slate-700/50 focus:border-blue-500/70 focus:bg-slate-900/60"
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-slate-100 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-slate-900",
              icon ? "pl-10" : "",
              variants[variant],
              error ? "border-red-500/70 focus:border-red-500/70" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
      </div>
    )
  }
)

ModernInput.displayName = "ModernInput"
