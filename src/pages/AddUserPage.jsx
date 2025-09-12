"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { userService, townHallService } from "../services/api"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader
} from "../components/ui/glass-card"
import { ModernButton } from "../components/ui/modern-button"
import { ModernAlert } from "../components/ui/modern-alert"
import ModernPageHeader from "../components/ui/modern-page-header"
import { Building, Search, UserPlus, Check } from "lucide-react"
import toast from "react-hot-toast"
import ReactDOM from "react-dom"


const AddUserPage = () => {
  const [users, setUsers] = useState([])
  const [townHalls, setTownHalls] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filteredTownHalls, setFilteredTownHalls] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedTownHall, setSelectedTownHall] = useState(null)
  const [userSearch, setUserSearch] = useState("")
  const [townHallSearch, setTownHallSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showTownHallDropdown, setShowTownHallDropdown] = useState(false)

  const userDropdownRef = useRef(null)
  const townHallDropdownRef = useRef(null)
  const townHallInputRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersResponse, townHallsResponse] = await Promise.all([
          userService.getAll(),
          townHallService.getAll()
        ])

        const approvedUsers = usersResponse.data.filter(
          user => user.is_approved
        )
        setUsers(approvedUsers)
        setTownHalls(townHallsResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Errore durante il caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (userSearch.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        user =>
          `${user.name} ${user.surname}`
            .toLowerCase()
            .includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [userSearch, users])

  useEffect(() => {
    if (!selectedUser) {
      setFilteredTownHalls([])
      return
    }

    const availableTownHalls = townHalls.filter(
      th => !selectedUser.town_halls_list.includes(th._id)
    )

    if (townHallSearch.trim() === "") {
      setFilteredTownHalls(availableTownHalls)
    } else {
      const filtered = availableTownHalls.filter(townHall =>
        townHall.name.toLowerCase().includes(townHallSearch.toLowerCase())
      )
      setFilteredTownHalls(filtered)
    }
  }, [townHallSearch, townHalls, selectedUser])

  useEffect(() => {
    const handleClickOutside = event => {
      // Chiudi dropdown comuni se clicchi fuori dal suo input
      // if (
      //   townHallInputRef.current &&
      //   !townHallInputRef.current.contains(event.target) &&
      //   event.target.id !== "townhall-search-input"
      // ) {
      //   setShowTownHallDropdown(false)
      // }
      // Chiudi dropdown utenti se clicchi fuori dal suo input
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        event.target.id !== "user-search-input"
      ) {
        setShowUserDropdown(false)
      }
      // Se clicchi sull'input utente, chiudi dropdown comuni
      if (event.target.id === "user-search-input") {
        setShowTownHallDropdown(false)
      }
      // Se clicchi sull'input comune, chiudi dropdown utenti
      if (event.target.id === "townhall-search-input") {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleUserSelect = user => {
    setSelectedUser({
      email: user.email,
      name: `${user.name} ${user.surname}`,
      town_halls_list: user.town_halls_list
    })
    setUserSearch(`${user.name} ${user.surname}`)
    setShowUserDropdown(false)
    setTownHallSearch("")
    setSelectedTownHall(null)
  }

  const handleTownHallSelect = townHall => {
    setSelectedTownHall({
      id: townHall._id,
      name: townHall.name
    })
    setTownHallSearch(townHall.name)
    setShowTownHallDropdown(false)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!selectedUser || !selectedTownHall) {
      toast.error("Seleziona un utente e un comune")
      return
    }

    setSubmitting(true)
    setAlert(null)

    try {
      const formData = {
        email: selectedUser.email,
        townHall: selectedTownHall.name
      }

      const response = await userService.addTownHall(formData)

      setSelectedUser({
        ...selectedUser,
        town_halls_list: [...selectedUser.town_halls_list, selectedTownHall.id]
      })

      setSelectedTownHall(null)
      setTownHallSearch("")

      setAlert({
        type: "success",
        message: "Comune associato con successo all'utente"
      })

      toast.success("Comune associato con successo")
    } catch (error) {
      console.error("Error submitting form:", error)
      setAlert({
        type: "error",
        message:
          error.response?.data || "Errore durante l'associazione del comune"
      })

      toast.error("Errore durante l'associazione del comune")
    } finally {
      setSubmitting(false)
    }
  }

  // Portal component
  const DropdownPortal = ({ children, inputRef }) => {
    const [coords, setCoords] = useState(null)

    useEffect(() => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setCoords(rect)
      }
    }, [inputRef, children])

    if (!coords) return null

    return ReactDOM.createPortal(
      <div
        style={{
          position: "absolute",
          top: coords.bottom + window.scrollY,
          left: coords.left + window.scrollX,
          width: coords.width,
          zIndex: 1000
        }}
        className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-visible"
      >
        {children}
      </div>,
      document.body
    )
  }

  return (
    <div className="space-y-8">
      <ModernPageHeader
        title="Associa Comune all'Utente"
        description="Associa un comune a un utente per consentire l'accesso ai dati"
      />

      {alert && <ModernAlert type={alert.type} message={alert.message} />}

      <div className="max-w-3xl mx-auto"> {/* <-- aumentata da 2xl a 3xl */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard variant="elevated" className={"overflow-visible"}>
            <GlassCardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Associazione Comune-Utente
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Seleziona utente e comune da associare
                  </p>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent>
              <form onSubmit={handleSubmit} className="space-y-6 overflow-visible">
                {/* User Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Seleziona Utente
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="user-search-input"
                      type="text"
                      value={userSearch}
                      onChange={e => {
                        setUserSearch(e.target.value)
                        setShowUserDropdown(true)
                        setShowTownHallDropdown(false)
                      }}
                      onFocus={e => {
                        setShowUserDropdown(true)
                        setShowTownHallDropdown(false)
                      }}
                      onClick={e => e.target.select()} // <--- aggiunto
                      placeholder="Cerca utente per nome o email..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
                      disabled={loading}
                    />
                    {selectedUser && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Check className="h-4 w-4 text-emerald-400" />
                      </div>
                    )}
                    {showUserDropdown && filteredUsers.length > 0 && (
                      <div
                        ref={userDropdownRef}
                        className="absolute z-20 mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div
                          className="max-h-60 overflow-y-auto"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#3b82f6 #1e293b"
                          }}
                        >
                          {filteredUsers.map(user => (
                            <div
                              key={user.email}
                              className="px-4 py-3 hover:bg-slate-800/50 cursor-pointer text-white border-b border-slate-700/30 last:border-b-0 transition-colors"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="font-medium">
                                {user.name} {user.surname}
                              </div>
                              <div className="text-sm text-slate-400">
                                {user.email}
                              </div>
                            </div>
                          ))}
                        </div>

                        {filteredUsers.length > 5 && (
                          <div className="text-center py-2 text-xs text-slate-400 bg-slate-900/50 border-t border-slate-700/30">
                            {filteredUsers.length} risultati
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Town Hall Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Seleziona Comune
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="townhall-search-input"
                      type="text"
                      value={townHallSearch}
                      ref={townHallInputRef}
                      onChange={e => {
                        setTownHallSearch(e.target.value)
                        setShowTownHallDropdown(true)
                        setShowUserDropdown(false)
                      }}
                      onFocus={e => {
                        setShowTownHallDropdown(true)
                        setShowUserDropdown(false)
                      }}
                      onClick={e => e.target.select()} // <--- aggiunto
                      placeholder="Cerca comune..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
                      disabled={loading || !selectedUser}
                    />
                    {selectedTownHall && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Check className="h-4 w-4 text-emerald-400" />
                      </div>
                    )}
                    {showTownHallDropdown && filteredTownHalls.length > 0 && (
                      <DropdownPortal inputRef={townHallInputRef}>
                        <div
                          className="max-h-60 overflow-y-auto"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#3b82f6 #1e293b"
                          }}
                        >
                          {filteredTownHalls.map(townHall => (
                            <div
                              key={townHall._id}
                              className="px-4 py-3 hover:bg-slate-800/50 cursor-pointer text-white border-b border-slate-700/30 last:border-b-0 transition-colors"
                              onClick={() => handleTownHallSelect(townHall)}
                            >
                              <div className="font-medium">{townHall.name}</div>
                              <div className="text-sm text-slate-400">
                                Punti luce: {townHall.light_points}
                              </div>
                            </div>
                          ))}
                        </div>
                      </DropdownPortal>
                    )}
                  </div>
                  {selectedUser &&
                    filteredTownHalls.length === 0 &&
                    townHalls.length > 0 && (
                      <p className="text-sm text-amber-400 bg-amber-900/10 border border-amber-500/20 rounded-lg p-3">
                        Non ci sono comuni disponibili da associare a questo
                        utente.
                      </p>
                    )}
                </div>

                {/* Submit Button */}
                <ModernButton
                  type="submit"
                  isLoading={submitting}
                  disabled={loading || !selectedUser || !selectedTownHall}
                  className="w-full"
                  size="lg"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  {submitting ? "Associazione in corso..." : "Associa Comune"}
                </ModernButton>
              </form>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default AddUserPage
