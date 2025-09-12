import { cn } from "../../utils/cn"
import { ChevronDown } from "lucide-react"
import { forwardRef } from "react"

export const ModernSelect = forwardRef(
  (
    { className, label, error, options, variant = "default", ...props },
    ref
  ) => {
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
          <select
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-slate-900",
              variants[variant],
              error ? "border-red-500/70 focus:border-red-500/70" : "",
              className
            )}
            value={props.value}
            onChange={e => {
              if (props.onValueChange) props.onValueChange(e.target.value)
            }}
            {...props}
          >
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-800 text-slate-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
      </div>
    )
  }
)

ModernSelect.displayName = "ModernSelect"
