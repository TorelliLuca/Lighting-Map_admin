"use client"

import { useState, useEffect, useRef } from "react"
import { userService, townHallService } from "../services/api"
import PageHeader from "../components/common/PageHeader"
import Card, { CardBody, CardHeader } from "../components/common/Card"
import Button from "../components/common/Button"
import Alert from "../components/common/Alert"
import { Building, Search, UserPlus } from "lucide-react"
import toast from "react-hot-toast"

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

  // Refs for detecting clicks outside of dropdown
  const userDropdownRef = useRef(null)
  const townHallDropdownRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersResponse, townHallsResponse] = await Promise.all([userService.getAll(), townHallService.getAll()])

        const approvedUsers = usersResponse.data.filter((user) => user.is_approved)
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

  // Filter users based on search input
  useEffect(() => {
    if (userSearch.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          `${user.name} ${user.surname}`.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [userSearch, users])

  // Filter town halls based on search input and selected user
  useEffect(() => {
    if (!selectedUser) {
      setFilteredTownHalls([])
      return
    }

    const availableTownHalls = townHalls.filter((th) => !selectedUser.town_halls_list.includes(th._id))

    if (townHallSearch.trim() === "") {
      setFilteredTownHalls(availableTownHalls)
    } else {
      const filtered = availableTownHalls.filter((townHall) =>
        townHall.name.toLowerCase().includes(townHallSearch.toLowerCase()),
      )
      setFilteredTownHalls(filtered)
    }
  }, [townHallSearch, townHalls, selectedUser])

  // Handle clicks outside the dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown if click is outside
      if (userDropdownRef.current && 
          !userDropdownRef.current.contains(event.target) && 
          event.target.id !== 'user-search-input') {
        setShowUserDropdown(false)
      }
      
      // Close town hall dropdown if click is outside
      if (townHallDropdownRef.current && 
          !townHallDropdownRef.current.contains(event.target) && 
          event.target.id !== 'townhall-search-input') {
        setShowTownHallDropdown(false)
      }
    }
    
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside)
    
    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleUserSelect = (user) => {
    setSelectedUser({
      email: user.email,
      name: `${user.name} ${user.surname}`,
      town_halls_list: user.town_halls_list,
    })
    setUserSearch(`${user.name} ${user.surname}`)
    setShowUserDropdown(false)
    setTownHallSearch("")
    setSelectedTownHall(null)
  }

  const handleTownHallSelect = (townHall) => {
    setSelectedTownHall({
      id: townHall._id,
      name: townHall.name,
    })
    setTownHallSearch(townHall.name)
    setShowTownHallDropdown(false)
  }

  const handleSubmit = async (e) => {
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
        townHall: selectedTownHall.name,
      }

      const response = await userService.addTownHall(formData)

      // Update local state
      setSelectedUser({
        ...selectedUser,
        town_halls_list: [...selectedUser.town_halls_list, selectedTownHall.id],
      })

      // Reset town hall selection
      setSelectedTownHall(null)
      setTownHallSearch("")

      setAlert({
        type: "success",
        message: "Comune associato con successo all'utente",
      })

      toast.success("Comune associato con successo")
    } catch (error) {
      console.error("Error submitting form:", error)
      setAlert({
        type: "error",
        message: error.response?.data || "Errore durante l'associazione del comune",
      })

      toast.error("Errore durante l'associazione del comune")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Associa comune all'utente"
        description="Associa un comune a un utente per consentire l'accesso ai dati"
      />

      {alert && <Alert type={alert.type} message={alert.message} className="mb-6" />}

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-blue-400" />
            Associazione comune-utente
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">Seleziona utente</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-blue-400" />
                </div>
                <input
                  id="user-search-input"
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value)
                    setShowUserDropdown(true)
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="Cerca utente per nome o email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div 
                    ref={userDropdownRef}
                    className="relative z-10 mt-1 w-full bg-slate-800 border border-blue-900/30 rounded-md shadow-lg overflow-hidden"
                  >
                    <div
                      className="overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-700"
                      style={{ height: filteredUsers.length <= 5 ? `${filteredUsers.length * 68}px` : '340px' }}
                    >
                      {filteredUsers.map((user) => (
                        <div
                          key={user.email}
                          className="px-4 py-3 hover:bg-blue-800/30 cursor-pointer text-white border-b border-blue-900/20 last:border-b-0"
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="font-medium">
                            {user.name} {user.surname}
                          </div>
                          <div className="text-sm text-blue-300">{user.email}</div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredUsers.length > 5 && (
                      <div className="text-center py-1 text-xs text-blue-400 bg-slate-900/50 border-t border-blue-900/30">
                        {filteredUsers.length} risultati
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Town hall selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">Seleziona comune</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-blue-400" />
                </div>
                <input
                  id="townhall-search-input"
                  type="text"
                  value={townHallSearch}
                  onChange={(e) => {
                    setTownHallSearch(e.target.value)
                    setShowTownHallDropdown(true)
                  }}
                  onFocus={() => setShowTownHallDropdown(true)}
                  placeholder="Cerca comune..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || !selectedUser}
                />
                {showTownHallDropdown && filteredTownHalls.length > 0 && (
                  <div 
                    ref={townHallDropdownRef}
                    className="relative z-10 mt-1 w-full bg-slate-800 border border-blue-900/30 rounded-md shadow-lg overflow-hidden"
                  >
                    <div
                      className="overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-700" 
                      style={{ height: filteredTownHalls.length <= 5 ? `${filteredTownHalls.length * 68}px` : '340px' }}
                    >
                      {filteredTownHalls.map((townHall) => (
                        <div
                          key={townHall._id}
                          className="px-4 py-3 hover:bg-blue-800/30 cursor-pointer text-white border-b border-blue-900/20 last:border-b-0"
                          onClick={() => handleTownHallSelect(townHall)}
                        >
                          <div className="font-medium">{townHall.name}</div>
                          <div className="text-sm text-blue-300">Punti luce: {townHall.light_points}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedUser && filteredTownHalls.length === 0 && townHalls.length > 0 && (
                <p className="text-sm text-yellow-300">Non ci sono comuni disponibili da associare a questo utente.</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              isLoading={submitting}
              disabled={loading || !selectedUser || !selectedTownHall}
              className="w-full"
            >
              Associa comune
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default AddUserPage