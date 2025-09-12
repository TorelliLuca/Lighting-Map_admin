export const Badge = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const variants = {
    default: "bg-slate-700/60 text-slate-200 border-slate-600/50",
    secondary: "bg-slate-800/60 text-slate-300 border-slate-700/50",
    success: "bg-emerald-900/60 text-emerald-200 border-emerald-700/50",
    warning: "bg-amber-900/60 text-amber-200 border-amber-700/50",
    error: "bg-red-900/60 text-red-200 border-red-700/50",
    info: "bg-blue-900/60 text-blue-200 border-blue-700/50"
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium border backdrop-blur-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
