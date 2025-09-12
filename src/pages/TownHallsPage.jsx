"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { townHallService, userService } from "../services/api"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader
} from "../components/ui/glass-card"
import { ModernButton } from "../components/ui/modern-button"
import { ModernAlert } from "../components/ui/modern-alert"
import ModernPageHeader from "../components/ui/modern-page-header"
import ModernLoading from "../components/ui/modern-loading"
import {
  Building,
  Search,
  Users,
  Info,
  ChevronUp,
  ChevronDown,
  MapPin,
  Calendar,
  Lightbulb,
  X,
  Mail,
  Shield,
  Clock
} from "lucide-react"
import toast from "react-hot-toast"

const TownHallsPage = () => {
  const [townHalls, setTownHalls] = useState([])
  const [users, setUsers] = useState([])
  const [filteredTownHalls, setFilteredTownHalls] = useState([])
  const [townHallSearch, setTownHallSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [townHallDetailsOpen, setTownHallDetailsOpen] = useState(false)
  const [townHallDetails, setTownHallDetails] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [townHallsResponse, usersResponse] = await Promise.all([
          townHallService.getAll(),
          userService.getAll()
        ])

        setTownHalls(townHallsResponse.data)
        setFilteredTownHalls(townHallsResponse.data)
        setUsers(usersResponse.data.filter(user => user.is_approved))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Errore durante il caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter town halls based on search input
  useEffect(() => {
    if (townHallSearch.trim() === "") {
      setFilteredTownHalls(townHalls)
    } else {
      const filtered = townHalls.filter(townHall =>
        townHall.name.toLowerCase().includes(townHallSearch.toLowerCase())
      )
      setFilteredTownHalls(filtered)
    }
  }, [townHallSearch, townHalls])

  // Get users for a town hall
  const getUsersForTownHall = townHallId => {
    return users.filter(user => user.town_halls_list.includes(townHallId))
  }

  const openTownHallDetails = townHall => {
    const connectedUsers = getUsersForTownHall(townHall._id)
    const townHallWithUsers = {
      ...townHall,
      connectedUsers
    }
    setTownHallDetails(townHallWithUsers)
    setTownHallDetailsOpen(true)
  }

  // Sorting function
  const requestSort = key => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Apply sorting to filtered town halls
  const sortedTownHalls = useMemo(() => {
    const sortableTownHalls = [...filteredTownHalls]
    if (sortConfig.key) {
      sortableTownHalls.sort((a, b) => {
        let aValue, bValue

        // Handle special cases for sorting
        if (sortConfig.key === "users_count") {
          aValue = getUsersForTownHall(a._id).length
          bValue = getUsersForTownHall(b._id).length
        } else if (sortConfig.key === "date") {
          aValue = new Date(a.date || "2000-01-01").getTime()
          bValue = new Date(b.date || "2000-01-01").getTime()
        } else if (sortConfig.key === "light_points") {
          aValue = Number.parseInt(a.light_points) || 0
          bValue = Number.parseInt(b.light_points) || 0
        } else {
          aValue = a[sortConfig.key]?.toString().toLowerCase() || ""
          bValue = b[sortConfig.key]?.toString().toLowerCase() || ""
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableTownHalls
  }, [filteredTownHalls, sortConfig, users])

  // Format date
  const formatDate = dateString => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  // Render sort indicator
  const renderSortIndicator = key => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  const getUserTypeLabel = userType => {
    switch (userType) {
      case "SUPER_ADMIN":
        return "Super Admin"
      case "ADMINISTRATOR":
        return "Amministratore"
      case "MAINTAINER":
        return "Manutentore"
      default:
        return "Utente"
    }
  }

  if (loading) {
    return <ModernLoading />
  }

  return (
    <div className="space-y-8">
      <ModernPageHeader
        title="Comuni"
        description="Visualizza e gestisci tutti i comuni e le loro associazioni"
      />

      {alert && <ModernAlert type={alert.type} message={alert.message} />}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={townHallSearch}
                onChange={e => setTownHallSearch(e.target.value)}
                placeholder="Cerca comuni..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Town Halls Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard variant="elevated">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Comuni</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {sortedTownHalls.length} comuni trovati
                  </p>
                </div>
              </div>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("name")}
                    >
                      Nome {renderSortIndicator("name")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("light_points")}
                    >
                      Punti Luce {renderSortIndicator("light_points")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("users_count")}
                    >
                      Utenti {renderSortIndicator("users_count")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("date")}
                    >
                      Data Aggiornamento {renderSortIndicator("date")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-medium text-blue-300 uppercase tracking-wider"
                    >
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/20 divide-y divide-slate-700/30">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                          <span>Caricamento comuni...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedTownHalls.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        <Building className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                        <p className="text-lg">Nessun comune trovato</p>
                        <p className="text-sm mt-2">
                          {townHallSearch
                            ? "Prova a modificare il termine di ricerca"
                            : "Non ci sono comuni disponibili"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sortedTownHalls.map(townHall => (
                      <motion.tr
                        key={townHall._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-800/30 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600/50">
                              <Building className="h-5 w-5 text-slate-300" />
                            </div>
                            <div className="text-sm font-medium text-white">
                              {townHall.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Lightbulb className="h-4 w-4 text-slate-400" />
                            <span>{townHall.light_points || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>
                              {getUsersForTownHall(townHall._id).length}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{formatDate(townHall.updated_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => openTownHallDetails(townHall)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Dettagli
                          </ModernButton>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Town Hall Details Modal */}
      <AnimatePresence>
        {townHallDetailsOpen && townHallDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setTownHallDetailsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Dettagli Comune
                    </h2>
                    <p className="text-sm text-slate-400">
                      {townHallDetails.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTownHallDetailsOpen(false)}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <h3 className="text-sm font-medium text-blue-300 mb-2">
                        Informazioni Generali
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-400">Nome</p>
                          <p className="text-white font-medium">
                            {townHallDetails.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Punti Luce</p>
                          <p className="text-white font-medium">
                            {townHallDetails.light_points || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            Utenti Associati
                          </p>
                          <p className="text-white font-medium">
                            {townHallDetails.connectedUsers.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Date
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-400">Creazione</p>
                          <p className="text-white font-medium">
                            {formatDate(townHallDetails.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            Ultimo Aggiornamento
                          </p>
                          <p className="text-white font-medium">
                            {formatDate(townHallDetails.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Geographic Info */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <h3 className="text-sm font-medium text-blue-300 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Informazioni Geografiche
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Provincia</p>
                      <p className="text-white font-medium">
                        {townHallDetails.province || "Non specificata"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Regione</p>
                      <p className="text-white font-medium">
                        {townHallDetails.region || "Non specificata"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Coordinate</p>
                      <p className="text-white font-medium">
                        {townHallDetails.coordinates?.lat &&
                        townHallDetails.coordinates?.lng
                          ? `${townHallDetails.coordinates.lat}, ${townHallDetails.coordinates.lng}`
                          : "Non specificate"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Light Points Stats */}
                {townHallDetails.light_points > 0 && (
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <h3 className="text-sm font-medium text-blue-300 mb-3 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Statistiche Punti Luce
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
                        <p className="text-xs text-blue-300">Totale</p>
                        <p className="text-xl font-semibold text-white">
                          {townHallDetails.light_points || 0}
                        </p>
                      </div>
                      <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
                        <p className="text-xs text-blue-300">
                          Ultimo Censimento
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {formatDate(
                            townHallDetails.updated_at ||
                              townHallDetails.date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connected Users */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <h3 className="text-sm font-medium text-blue-300 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Utenti Associati ({townHallDetails.connectedUsers.length})
                  </h3>
                  {townHallDetails.connectedUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 italic">
                        Nessun utente associato
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {townHallDetails.connectedUsers.map(user => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-700/30 hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold text-xs border border-slate-600/50">
                              {user.name?.charAt(0)}
                              {user.surname?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {user.name} {user.surname}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-slate-400">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-xs text-slate-400">
                              <Shield className="h-3 w-3" />
                              <span>{getUserTypeLabel(user.user_type)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(user.date).toLocaleDateString(
                                  "it-IT"
                                )}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-slate-700/50">
                <ModernButton onClick={() => setTownHallDetailsOpen(false)}>
                  Chiudi
                </ModernButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TownHallsPage
