"use client"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "../components/navigation/Navbar"
import AppSidebar from "../components/navigation/Sidebar"
import Footer from "../components/navigation/Footer"
import { useUser } from "../context/UserContext"

const MainLayout = () => {
  const { userData } = useUser()
  const location = useLocation()

  if (!userData) {
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <AppSidebar />

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default MainLayout

