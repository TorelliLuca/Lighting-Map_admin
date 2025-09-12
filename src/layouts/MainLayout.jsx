"use client"
import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import ModernNavbar from "../components/layout/modern-navbar"
import ModernSidebar from "../components/layout/modern-sidebar"
import ModernFooter from "../components/layout/modern-footer"
import { useUser } from "../context/UserContext"

const MainLayout = () => {
  const { userData } = useUser()

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.02),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.005)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <ModernSidebar />
        <ModernNavbar />

        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-6 lg:px-8 py-8"
          >
            <Outlet />
          </motion.div>
        </main>

        <ModernFooter />
      </div>
    </div>
  )
}

export default MainLayout
