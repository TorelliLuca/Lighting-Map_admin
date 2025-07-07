"use client"

import { useState, useEffect, useMemo } from "react"
import { townHallService, userService } from "../services/api"
import PageHeader from "../components/common/PageHeader"
import Card, { CardBody, CardHeader } from "../components/common/Card"
import Button from "../components/common/Button"
import Alert from "../components/common/Alert"
import { Building, Search, Users, Info, ChevronUp, ChevronDown, MapPin, Calendar } from "lucide-react"
import toast from "react-hot-toast"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const TownHallsPage = () => {
  const [townHalls, setTownHalls] = useState([])
  const [users, setUsers] = useState([])
  const [filteredTownHalls, setFilteredTownHalls] = useState([])
  const [townHallSearch, setTownHallSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [townHallDetailsOpen, setTownHallDetailsOpen] = useState(false)
  const [townHallDetails, setTownHallDetails] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [townHallsResponse, usersResponse] = await Promise.all([townHallService.getAll(), userService.getAll()])

        setTownHalls(townHallsResponse.data)
        setFilteredTownHalls(townHallsResponse.data)
        setUsers(usersResponse.data.filter((user) => user.is_approved))
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
      const filtered = townHalls.filter((townHall) =>
        townHall.name.toLowerCase().includes(townHallSearch.toLowerCase()),
      )
      setFilteredTownHalls(filtered)
    }
  }, [townHallSearch, townHalls])

  // Get users for a town hall
  const getUsersForTownHall = (townHallId) => {
    return users.filter((user) => user.town_halls_list.includes(townHallId))
  }

  const openTownHallDetails = (townHall) => {
    const connectedUsers = getUsersForTownHall(townHall._id)
    const townHallWithUsers = {
      ...townHall,
      connectedUsers,
    }
    setTownHallDetails(townHallWithUsers)
    setTownHallDetailsOpen(true)
  }

  // Sorting function
  const requestSort = (key) => {
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
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
        minute:"2-digit",
        hour:"2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
  }

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  return (
    <div>
      <PageHeader title="Comuni" description="Visualizza e gestisci tutti i comuni e le loro associazioni" />

      {alert && <Alert type={alert.type} message={alert.message} className="mb-6" />}

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Building className="mr-2 h-5 w-5 text-blue-400" />
            Comuni
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <input
              type="text"
              value={townHallSearch}
              onChange={(e) => setTownHallSearch(e.target.value)}
              placeholder="Cerca comuni..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-900/30">
              <thead className="bg-slate-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    Nome {renderSortIndicator("name")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("light_points")}
                  >
                    Punti Luce {renderSortIndicator("light_points")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("users_count")}
                  >
                    Utenti {renderSortIndicator("users_count")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("date")}
                  >
                    Data Aggiornamento {renderSortIndicator("date")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider"
                  >
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/50 divide-y divide-blue-900/30">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-white">
                      Caricamento comuni...
                    </td>
                  </tr>
                ) : sortedTownHalls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-white">
                      Nessun comune trovato
                    </td>
                  </tr>
                ) : (
                  sortedTownHalls.map((townHall) => (
                    <tr key={townHall._id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{townHall.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{townHall.light_points || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {getUsersForTownHall(townHall._id).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatDate(townHall.updated_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="primary" size="sm" onClick={() => openTownHallDetails(townHall)}>
                          <Info className="h-4 w-4 mr-1" />
                          Dettagli
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Town Hall Details Dialog */}
      <Dialog open={townHallDetailsOpen} onOpenChange={setTownHallDetailsOpen}>
        <DialogContent className="bg-slate-800 border border-blue-900/30 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center">
              <Building className="mr-2 h-5 w-5 text-blue-400" />
              Dettagli Comune
            </DialogTitle>
          </DialogHeader>

          {townHallDetails && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-300">Nome</h3>
                  <p className="text-white">{townHallDetails.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300">Punti Luce</h3>
                  <p className="text-white">{townHallDetails.light_points || 0}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300">Ultimo Aggiornamento</h3>
                  <p className="text-white">{formatDate(townHallDetails.updated_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300">Ultimo Aggiornamento</h3>
                  <p className="text-white">{formatDate(townHallDetails.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300">Utenti Associati</h3>
                  <p className="text-white">{townHallDetails.connectedUsers.length}</p>
                </div>
              </div>

              {/* Additional town hall information */}
              <div className="bg-slate-700/30 p-4 rounded-md border border-blue-900/30">
                <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Informazioni Geografiche
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-300">Provincia</p>
                    <p className="text-white">{townHallDetails.province || "Non specificata"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300">Regione</p>
                    <p className="text-white">{townHallDetails.region || "Non specificata"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300">Coordinate</p>
                    <p className="text-white">
                      {townHallDetails.coordinates?.lat && townHallDetails.coordinates?.lng
                        ? `${townHallDetails.coordinates.lat}, ${townHallDetails.coordinates.lng}`
                        : "Non specificate"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected users */}
              <div>
                <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Utenti Associati
                </h3>
                {townHallDetails.connectedUsers.length === 0 ? (
                  <p className="text-white italic">Nessun utente associato</p>
                ) : (
                  <div className="bg-slate-700/30 rounded-md border border-blue-900/30 overflow-hidden">
                    <table className="min-w-full divide-y divide-blue-900/30">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-300">
                            Nome
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-300">
                            Email
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-300">
                            Tipo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-900/30">
                        {townHallDetails.connectedUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-slate-700/20">
                            <td className="px-4 py-2 text-sm text-white">
                              {user.name} {user.surname}
                            </td>
                            <td className="px-4 py-2 text-sm text-white">{user.email}</td>
                            <td className="px-4 py-2 text-sm text-white">
                              {user.user_type === "SUPER_ADMIN"
                                ? "Super Admin"
                                : user.user_type === "ADMINISTRATOR"
                                  ? "Amministratore"
                                  : user.user_type === "MAINTAINER"
                                    ? "Manutentore"
                                    : "Utente"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Light points summary */}
              {townHallDetails.light_points > 0 && (
                <div className="bg-slate-700/30 p-4 rounded-md border border-blue-900/30">
                  <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Statistiche Punti Luce
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30">
                      <p className="text-xs text-blue-300">Totale</p>
                      <p className="text-xl font-semibold text-white">{townHallDetails.light_points || 0}</p>
                    </div>
                    <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30">
                      <p className="text-xs text-blue-300">Ultimo Aggiornamento</p>
                      <p className="text-sm font-semibold text-white">
                        {formatDate(townHallDetails.last_census_date || townHallDetails.date)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button onClick={() => setTownHallDetailsOpen(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TownHallsPage

