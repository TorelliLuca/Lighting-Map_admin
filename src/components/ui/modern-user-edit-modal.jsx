"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { ModernButton } from "./modern-button"
import { ModernInput } from "./modern-input"
import { ModernSelect } from "./modern-select"
import { User, Mail, Shield, Eye, EyeOff, Lock, Save, X } from "lucide-react"

export const ModernUserEditModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    user_type: "MAINTAINER",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [enablePasswordChange, setEnablePasswordChange] = useState(false)
  const [errors, setErrors] = useState({})

  const userTypeOptions = [
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMINISTRATOR", label: "Amministratore" },
    { value: "MAINTAINER", label: "Manutentore" }
  ]

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        user_type: user.user_type || "MAINTAINER",
        password: "",
        confirmPassword: ""
      })
      setEnablePasswordChange(false)
      setErrors({})
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio"
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Il cognome è obbligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato email non valido"
    }

    if (enablePasswordChange) {
      if (!formData.password) {
        newErrors.password = "La password è obbligatoria"
      } else if (formData.password.length < 6) {
        newErrors.password = "La password deve essere di almeno 6 caratteri"
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Le password non coincidono"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const userData = {
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      email: formData.email.trim(),
      user_type: formData.user_type
    }

    if (enablePasswordChange && formData.password) {
      userData.password = formData.password
    }

    onSave(user._id, userData)
  }

  const handleClose = () => {
    onClose()
    setEnablePasswordChange(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
    setErrors({})
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <span>Modifica Utente</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold text-xl border border-slate-600/50">
              {formData.name?.charAt(0)}
              {formData.surname?.charAt(0)}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome
              </label>
              <ModernInput
                value={formData.name}
                onChange={e => handleInputChange("name", e.target.value)}
                placeholder="Inserisci il nome"
                error={errors.name}
                disabled={isLoading}
              />
            </div>

            {/* Surname */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cognome
              </label>
              <ModernInput
                value={formData.surname}
                onChange={e => handleInputChange("surname", e.target.value)}
                placeholder="Inserisci il cognome"
                error={errors.surname}
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <ModernInput
                  value={formData.email}
                  onChange={e => handleInputChange("email", e.target.value)}
                  placeholder="Inserisci l'email"
                  error={errors.email}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo Utente
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <ModernSelect
                  value={formData.user_type}
                  onValueChange={value => handleInputChange("user_type", value)}
                  options={userTypeOptions}
                  placeholder="Seleziona tipo utente"
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password Change Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Modifica Password
                  </p>
                  <p className="text-xs text-slate-500">
                    Abilita per cambiare la password
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnablePasswordChange(!enablePasswordChange)}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  enablePasswordChange ? "bg-blue-600" : "bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enablePasswordChange ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Password Fields */}
            {enablePasswordChange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nuova Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <ModernInput
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Inserisci la nuova password"
                      error={errors.password}
                      disabled={isLoading}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Conferma Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <ModernInput
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={e =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Conferma la nuova password"
                      error={errors.confirmPassword}
                      disabled={isLoading}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <ModernButton
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Annulla
            </ModernButton>

            <ModernButton
              variant="primary"
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading}
              isLoading={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Salva Modifiche
            </ModernButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
