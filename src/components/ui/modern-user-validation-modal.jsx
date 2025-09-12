"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { ModernButton } from "./modern-button"
import { ModernSelect } from "./modern-select"
import { User, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export const ModernUserValidationModal = ({
  isOpen,
  onClose,
  user,
  onValidate,
  isLoading
}) => {
  const [selectedUserType, setSelectedUserType] = useState(
    user?.user_type 
  )
  const [action, setAction] = useState(null)

  const userTypeOptions = [
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMINISTRATOR", label: "Amministratore" },
    { value: "MAINTAINER", label: "Manutentore" }
  ]

  useEffect(() => {
    if (isOpen && user) {
      setSelectedUserType(user.user_type)
      setAction(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user])

  const handleValidate = () => {
    if (action) {
      onValidate(
        user._id,
        action,
        action === "approve" ? selectedUserType : undefined
      )
      onClose()
      setAction(null)
    }
  }

  const handleClose = () => {
    onClose()
    setAction(null)
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <span>Validazione Utente</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold border border-slate-600/50">
                {user.name?.charAt(0)}
                {user.surname?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {user.name} {user.surname}
                </h3>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="text-sm text-slate-400">
              <p>
                Data registrazione:{" "}
                {new Date(user.date).toLocaleDateString("it-IT")}
              </p>
              {user.town_halls_list && user.town_halls_list.length > 0 && (
                <p>Comuni associati: {user.town_halls_list.length}</p>
              )}
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300">
              Seleziona azione:
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAction("approve")}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  action === "approve"
                    ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-800/30 border-slate-700/50 text-slate-300 hover:border-emerald-500/30"
                }`}
              >
                <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Approva</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAction("reject")}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  action === "reject"
                    ? "bg-red-900/30 border-red-500/50 text-red-300"
                    : "bg-slate-800/30 border-slate-700/50 text-slate-300 hover:border-red-500/30"
                }`}
              >
                <XCircle className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Rifiuta</span>
              </motion.button>
            </div>
          </div>

          {/* User Type Selection (only for approval) */}
          {action === "approve" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Shield className="h-4 w-4" />
                <span>Seleziona tipo utente:</span>
              </div>

              <ModernSelect
                value={selectedUserType}
                onValueChange={option => setSelectedUserType(option?.value ?? option)}
                options={userTypeOptions}
                placeholder="Seleziona tipo utente"
              />
            </motion.div>
          )}

          {/* Warning for rejection */}
          {action === "reject" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl"
            >
              <div className="flex items-center space-x-2 text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  L'utente verrà rifiutato definitivamente
                </span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <ModernButton
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Annulla
            </ModernButton>

            <ModernButton
              variant={
                action === "approve"
                  ? "success"
                  : action === "reject"
                  ? "danger"
                  : "primary"
              }
              onClick={handleValidate}
              className="flex-1"
              disabled={!action || isLoading}
              isLoading={isLoading}
            >
              {action === "approve"
                ? "Approva Utente"
                : action === "reject"
                ? "Rifiuta Utente"
                : "Seleziona Azione"}
            </ModernButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
