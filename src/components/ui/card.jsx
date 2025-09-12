export const Card = ({
  children,
  className = "",
  variant = "glass",
  ...props
}) => {
  const variants = {
    default: "bg-slate-900/80 border border-slate-700/50",
    glass:
      "bg-slate-900/20 backdrop-blur-xl border border-slate-700/30 shadow-2xl",
    elevated:
      "bg-slate-900/40 backdrop-blur-xl border border-slate-600/40 shadow-2xl"
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3
      className={`text-xl font-semibold text-slate-100 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export const CardDescription = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-sm text-slate-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  )
}

export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  )
}
