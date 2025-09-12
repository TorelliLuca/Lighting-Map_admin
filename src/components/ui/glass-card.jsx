"use client"
import { cn } from "../../utils/cn"
import { motion } from "framer-motion"

export const GlassCard = ({
  children,
  className,
  variant = "default",
  animate = false
}) => {
  const variants = {
    default: "bg-slate-900/40 border-slate-700/50",
    elevated:
      "bg-slate-900/60 border-slate-600/60 shadow-2xl shadow-blue-500/10",
    interactive:
      "bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/60 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer"
  }

  const Component = animate ? motion.div : "div"
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" }
      }
    : {}

  return (
    <Component
      className={cn(
        "backdrop-blur-xl border rounded-2xl overflow-hidden",
        variants[variant],
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  )
}

export const GlassCardHeader = ({ children, className }) => (
  <div className={cn("p-6 pb-4 border-b border-slate-700/50", className)}>
    {children}
  </div>
)

export const GlassCardContent = ({ children, className }) => (
  <div className={cn("p-6", className)}>{children}</div>
)

export const GlassCardFooter = ({ children, className }) => (
  <div className={cn("p-6 pt-4 border-t border-slate-700/50", className)}>
    {children}
  </div>
)
