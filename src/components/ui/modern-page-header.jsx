"use client"
import { motion } from "framer-motion"

const ModernPageHeader = ({ title, description, badge, actions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-lg text-slate-400 max-w-3xl">{description}</p>
          )}
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
        </div>

        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}
      </div>
    </motion.div>
  )
}

export default ModernPageHeader
