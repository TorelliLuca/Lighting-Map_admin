"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { Sun, Moon, User, LogOut, Settings, Menu } from "lucide-react"
import logoIcon from '../../assets/faviconWhite.png'

const Navbar = () => {
  const { userData, logout } = useUser()
  const { darkMode, toggleTheme } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = userData?.role === "admin"

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-blue-900/30 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-400 hover:text-white hover:bg-blue-800/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>

            <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <img src= {logoIcon}alt="Icon" className="w-4 h-4" />
            </div>
              <span className="text-xl font-semibold text-white">Lighting-Map</span>
            </Link>
          </div>

          <div className="flex items-center">

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {userData?.name?.charAt(0)}
                    {userData?.surname?.charAt(0)}
                  </div>
                  <span className="ml-2 text-white">
                    {userData?.name} {userData?.surname}
                  </span>
                </button>
              </div>

              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-slate-800 border border-blue-900/50 backdrop-blur-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-xs text-blue-400 border-b border-blue-900/30">{userData?.email}</div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-blue-800/30"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profilo
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-blue-800/30"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Impostazioni
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-blue-800/30"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-800/30"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/aggiungi-comune-utente"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Aggiungi comune all'utente
            </Link>
            <Link
              to="/comuni"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Comuni
            </Link>
            <Link
              to="/gestione-comuni"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gestione Comuni
            </Link>
            <Link
              to="/scarica-report-in-excel"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Scarica DB comune
            </Link>
            <Link
              to="/carica-comune-in-CSV-format"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Carica comune in CSV
            </Link>
            {isAdmin && (
              <Link
                to="/valida-utente"
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gestisci utenti
              </Link>
            )}
            <Link
              to="/rimuovi-comune-da-utente"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rimuovi comune da utente
            </Link>
            {isAdmin && (
              <Link
                to="/rimuovi-comune"
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Elimina comune
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/controllo-accessi"
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-800/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Controllo accessi
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

