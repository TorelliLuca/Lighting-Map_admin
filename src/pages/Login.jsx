"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react"
import { useUser } from "../context/UserContext"
import { GlassCard, GlassCardContent } from "../components/ui/glass-card"
import { ModernButton } from "../components/ui/modern-button"
import { ModernAlert } from "../components/ui/modern-alert"
import ModernLoading from "../components/ui/modern-loading"
import logoIcon from "../assets/faviconWhite.png"

const Login = () => {
  const { login, loading } = useUser()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [alert, setAlert] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (alert) setAlert(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    setAlert(null)

    try {
      await login(formData.email, formData.password)
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Errore durante il login"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <ModernLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/25 mb-6"
          >
            <img
              src={logoIcon || "/placeholder.svg"}
              alt="Lighting-Map"
              className="w-10 h-10"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Lighting-Map
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-slate-400"
          >
            Accedi alla piattaforma di amministrazione
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <GlassCard variant="elevated">
            <GlassCardContent className="p-8">
              {alert && (
                <ModernAlert
                  type={alert.type}
                  message={alert.message}
                  className="mb-6"
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
                      placeholder="Inserisci la tua email"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
                      placeholder="Inserisci la tua password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <ModernButton
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {isSubmitting ? "Accesso in corso..." : "Accedi"}
                </ModernButton>
              </form>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-slate-500">
            © 2024 Lighting-Map. Tutti i diritti riservati.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
