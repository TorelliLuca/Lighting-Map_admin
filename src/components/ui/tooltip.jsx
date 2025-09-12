"use client"
import { useState } from "react"

export const Tooltip = ({ children, content, side = "top" }) => {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2"
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 ${positions[side]} px-3 py-2 bg-slate-800/95 backdrop-blur-sm text-slate-200 text-sm rounded-lg border border-slate-700/50 whitespace-nowrap shadow-xl`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
