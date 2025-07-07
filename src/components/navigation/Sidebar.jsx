"use client"

import { useState, useEffect, useRef } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
  Database,
  Upload,
  Download,
  UserCheck,
  UserMinus,
  Building,
  BuildingIcon as Buildings,
} from "lucide-react"
import { useUser } from "../../context/UserContext"
import { cn } from "../../utils/cn"
import logoIcon from '../../assets/faviconWhite.png'

const AppSidebar = () => {
  const { userData, logout } = useUser()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const sidebarRef = useRef(null)
  const triggerRef = useRef(null)

  const isAdmin = userData?.user_type === "ADMINISTRATOR" || userData?.user_type === "SUPER_ADMIN"

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Aggiungi comune all'utente", href: "/aggiungi-comune-utente", icon: Building },
    { name: "Comuni", href: "/comuni", icon: Buildings },
    { name: "Scarica DB comune", href: "/scarica-report-in-excel", icon: Download },
    { name: "Carica/Modifica comune", href: "/gestione-comuni", icon: Upload, admin: true },
    { name: "Gestisci utenti", href: "/valida-utente", icon: UserCheck, admin: true },
    { name: "Rimuovi comune da utente", href: "/rimuovi-comune-da-utente", icon: UserMinus },
    { name: "Elimina comune", href: "/rimuovi-comune", icon: Database, admin: true },
    
  ]

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter((item) => !item.admin || isAdmin)

  // Handle mouse enter/leave for the trigger area
  const handleTriggerMouseEnter = () => {
    setIsVisible(true)
  }

  // Handle mouse leave for the sidebar
  const handleSidebarMouseLeave = () => {
    setIsVisible(false)
  }

  // Close sidebar on route change
  useEffect(() => {
    setIsVisible(false)
  }, [location.pathname])

  // Handle clicks outside the sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isVisible])

  return (
    <>
      {/* Trigger area - thin strip on the left edge */}
      <div
        ref={triggerRef}
        className="fixed left-0 top-0 w-3 h-full z-20 bg-transparent"
        onMouseEnter={handleTriggerMouseEnter}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 h-screen bg-slate-900/90 backdrop-blur-md border-r border-blue-900/30 transform transition-transform duration-300 ease-in-out",
          isVisible ? "translate-x-0" : "-translate-x-full",
        )}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-900/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <img src= {logoIcon}alt="Icon" className="w-4 h-4" />
            </div>
            <span className="text-xl font-semibold text-white">Lighting-Map</span>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-800/30 text-white border-l-4 border-blue-500"
                      : "text-blue-100 hover:bg-blue-800/20",
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 text-blue-400" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-blue-900/30 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {userData?.name?.charAt(0)}
                {userData?.surname?.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {userData?.name} {userData?.surname}
                </p>
                <p className="text-xs font-medium text-blue-300 group-hover:text-blue-200">
                  {userData?.user_type === "SUPER_ADMIN"
                    ? "Super Admin"
                    : userData?.user_type === "ADMINISTRATOR"
                      ? "Amministratore"
                      : userData?.user_type === "MAINTAINER"
                        ? "Manutentore"
                        : "Utente"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppSidebar

