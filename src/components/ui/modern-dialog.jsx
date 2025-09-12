"use client"
import { cn } from "../../utils/cn"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { ModernButton } from "./modern-button"

export const ModernDialog = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Conferma",
  cancelText = "Annulla",
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            "bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dialog Content */}
          <div className="p-6">
            <p className="text-sm text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Dialog Footer */}
          <div className="flex justify-end p-6 border-t border-slate-700/50 space-x-2">
            <ModernButton variant="ghost" onClick={onCancel}>
              {cancelText}
            </ModernButton>
            <ModernButton variant="primary" onClick={onConfirm}>
              {confirmText}
            </ModernButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModernDialog;