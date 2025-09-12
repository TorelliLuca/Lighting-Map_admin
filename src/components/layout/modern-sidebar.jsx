"use client"

import { useState, useEffect, useRef } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Database,
  Upload,
  Download,
  UserCheck,
  UserMinus,
  Building,
  Building2 as Buildings,
  Shield,
  Menu,
  UserPlus,
  ChevronDown,
  ChevronRight,
  X as CloseIcon, // Aggiungiamo un'icona per la chiusura
} from "lucide-react"
import { useUser } from "../../context/UserContext"
import { cn } from "../../utils/cn"
import logoIcon from "../../assets/faviconWhite.png"

const Sidebar = () => {
  const { userData, logout } = useUser()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const sidebarRef = useRef(null)
  const triggerRef = useRef(null)

  const isAdmin = userData?.user_type === "ADMINISTRATOR" || userData?.user_type === "SUPER_ADMIN"

  const navigation = [{ name: "Dashboard", href: "/", icon: Home }]

  const submenus = {
    comuni: {
      title: "Comuni",
      icon: Buildings,
      items: [
        { name: "Associa Comune-Utente", href: "/aggiungi-comune-utente", icon: Building },
        { name: "Visualizza Comuni", href: "/comuni", icon: Buildings },
        { name: "Gestione Comuni", href: "/gestione-comuni", icon: Upload, admin: true },
        { name: "Elimina Comune", href: "/rimuovi-comune", icon: Database, admin: true },
      ],
    },
    utenti: {
      title: "Utenti",
      icon: UserCheck,
      items: [
        { name: "Gestisci Utenti", href: "/valida-utente", icon: UserCheck, admin: true },
        { name: "Rimuovi Associazione", href: "/rimuovi-comune-da-utente", icon: UserMinus },
      ],
    },
    organizzazioni: {
      title: "Organizzazioni",
      icon: Building,
      items: [
        { name: "Aggiungi Organizzazione", href: "/aggiungi-organizzazione", icon: Building },
        { name: "Aggiungi Utente a Organizzazione", href: "/aggiungi-utente-organizzazione", icon: UserPlus },
        { name: "Gestione Organizzazioni", href: "/gestione-organizzazioni", icon: Buildings, admin: true },
      ],
    },
    controlloAccessi: {
      title: "Controllo accessi",
      icon: Shield,
      items: [
        { name: "Controllo Accessi", href: "/controllo-accessi", icon: Shield, admin: true },
        { name: "Scarica Database", href: "/scarica-report-in-excel", icon: Download },
      ],
    },
  }

  const filteredNavigation = navigation.filter((item) => !item.admin || isAdmin)

  const toggleSubmenu = (submenuKey) => {
    setOpenSubmenu(openSubmenu === submenuKey ? null : submenuKey)
  }

  const getFilteredSubmenuItems = (items) => {
    return items.filter((item) => !item.admin || isAdmin)
  }

  useEffect(() => {
    setIsVisible(false);
    setOpenSubmenu(null);
  }, [location.pathname]);

  // Nuova logica: gestione del click fuori dalla sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Chiudi la sidebar solo se è visibile e il click è all'esterno
      if (
        isVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsVisible(false)
        setOpenSubmenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isVisible])

  return (
    <>
      {/* Bottoni di controllo */}
      <button
        className="fixed left-6 top-5 z-50 p-2 rounded-md bg-blue-600 text-white shadow-lg xl:"
        onClick={() => setIsVisible(true)}
        aria-label="Apri menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl shadow-black/20"
          >
            {/* Header con bottone di chiusura per mobile */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <img src={logoIcon || "/placeholder.svg"} alt="Icon" className="w-6 h-6 " />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Lighting-Map</h1>
                  <p className="text-xs text-slate-400">Admin Platform</p>
                </div>
              </div>
              <button onClick={() => setIsVisible(false)} className="xl:hidden p-2 text-slate-400 hover:text-white transition-colors" aria-label="Chiudi menu">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex flex-col flex-1 overflow-y-auto py-6">
              <nav className="px-4 space-y-2">
                {filteredNavigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                            : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                        )
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5 transition-colors" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  </motion.div>
                ))}

                {Object.entries(submenus).map(([key, submenu], submenuIndex) => {
                  const filteredItems = getFilteredSubmenuItems(submenu.items)

                  if (filteredItems.length === 0) return null

                  const isOpen = openSubmenu === key
                  const hasActiveItem = filteredItems.some((item) => location.pathname === item.href)

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (filteredNavigation.length + submenuIndex) * 0.05 }}
                      className="space-y-1"
                    >
                      <button
                        onClick={() => toggleSubmenu(key)}
                        className={cn(
                          "group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                          hasActiveItem
                            ? "bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                            : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                        )}
                      >
                        <div className="flex items-center">
                          <submenu.icon className="mr-3 h-5 w-5 transition-colors" />
                          <span className="truncate">{submenu.title}</span>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 transition-transform" />
                        ) : (
                          <ChevronRight className="h-4 w-4 transition-transform" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1 overflow-hidden"
                          >
                            {filteredItems.map((item, itemIndex) => (
                              <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIndex * 0.03 }}
                              >
                                <NavLink
                                  to={item.href}
                                  className={({ isActive }) =>
                                    cn(
                                      "group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                      isActive
                                        ? "bg-gradient-to-r from-blue-600/30 to-blue-500/30 text-blue-200 border border-blue-500/40"
                                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200",
                                    )
                                  }
                                >
                                  <item.icon className="mr-3 h-4 w-4 transition-colors" />
                                  <span className="truncate">{item.name}</span>
                                </NavLink>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </nav>
            </div>

            {/* User Profile */}
            <div className="border-t border-slate-700/50 p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold text-lg border border-slate-600/50">
                  {userData?.name?.charAt(0)}
                  {userData?.surname?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {userData?.name} {userData?.surname}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsVisible(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar