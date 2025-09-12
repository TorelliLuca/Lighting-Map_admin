"use client"
import { cn } from "../../utils/cn"
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { motion } from "framer-motion"

export const ModernAlert = ({ type, title, message, className, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }

  const styles = {
    success: "bg-emerald-900/20 border-emerald-500/30 text-emerald-100",
    error: "bg-red-900/20 border-red-500/30 text-red-100",
    warning: "bg-amber-900/20 border-amber-500/30 text-amber-100",
    info: "bg-blue-900/20 border-blue-500/30 text-blue-100"
  }

  const iconColors = {
    success: "text-emerald-400",
    error: "text-red-400",
    warning: "text-amber-400",
    info: "text-blue-400"
  }

  const Icon = icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative flex items-start p-4 rounded-xl border backdrop-blur-xl",
        styles[type],
        className
      )}
    >
      <Icon
        className={cn("h-5 w-5 mt-0.5 mr-3 flex-shrink-0", iconColors[type])}
      />
      <div className="flex-1">
        {title && <h4 className="text-sm font-semibold mb-1">{title}</h4>}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  )
}
