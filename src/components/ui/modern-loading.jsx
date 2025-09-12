"use client"

import { motion } from "framer-motion"
import logoIcon from "../../assets/faviconWhite.png"

const ModernLoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Animated Logo with Orbital Rings */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Main Logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/25 flex items-center justify-center relative z-10"
          >
            <img src={logoIcon || "/placeholder.svg"} alt="Lighting-Map" className="w-14 h-14" />
          </motion.div>

          {/* Orbital Ring 1 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute inset-0 w-32 h-32 -m-4"
          >
            <div className="w-full h-full rounded-full border-2 border-blue-400/30 relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-1"
              />
            </div>
          </motion.div>

          {/* Orbital Ring 2 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute inset-0 w-40 h-40 -m-8"
          >
            <div className="w-full h-full rounded-full border border-blue-500/20 relative">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 right-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full"
              />
            </div>
          </motion.div>

          {/* Pulse Ring */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-0 w-24 h-24 rounded-2xl border-2 border-blue-400"
          />
        </motion.div>

        {/* Loading Text with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-3"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl font-bold text-white"
          >
            Caricamento...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-slate-400"
          >
            Stiamo preparando i tuoi dati
          </motion.p>
        </motion.div>

        {/* Modern Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            />
          ))}
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -100, -20],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
              className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModernLoadingScreen
