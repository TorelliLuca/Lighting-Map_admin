"use client"
export const ScrollArea = ({ children, className = "", ...props }) => {
  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      <div className="h-full w-full overflow-auto scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/60">
        {children}
      </div>
    </div>
  )
}
