"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { userService, townHallService } from "../services/api"
import PageHeader from "../components/common/PageHeader"
import Card, { CardBody } from "../components/common/Card"
import Button from "../components/common/Button"
import Alert from "../components/common/Alert"
import { UserCheck, UserX, Edit, Search, Check, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronUp, ChevronDown, Info } from "lucide-react"
import React from "react"

const ValidateUser = () => {
  const [users, setUsers] = useState([])
  const [userTypes, setUserTypes] = useState({})
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const navigate = useNavigate()

  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [userDetails, setUserDetails] = useState(null)

  const [townHalls, setTownHalls] = useState([])

  // Funzione per scaricare il CSV di tutti gli utenti
  const handleDownloadCSV = async () => {
    try {
      const response = await userService.downloadCSV()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const downloadName = "utenti_" + new Date().toISOString().split('T')[0] + ".csv"
      link.setAttribute('download', downloadName)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.success('CSV utenti scaricato con successo')
    } catch (error) {
      console.error('Errore durante il download del CSV:', error)
      toast.error('Errore durante il download del CSV utenti')
    }
  }

  // Mock getUserTypeLabel function (replace with actual logic)
  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case "SUPER_ADMIN":
        return "Super Admin"
      case "ADMINISTRATOR":
        return "Amministratore"
      case "MAINTAINER":
        return "Manutentore"
      default:
        return "Utente visualizzatore"
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const [usersResponse, townHallsResponse] = await Promise.all([userService.getAll(), townHallService.getAll()])
        setUsers(usersResponse.data)
        setTownHalls(townHallsResponse.data)

        // Initialize user types
        const types = {}
        usersResponse.data.forEach((user) => {
          if (!user.is_approved) {
            types[user.email] = user.user_type || "DEFAULT_USER"
          }
        })
        setUserTypes(types)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Errore durante il caricamento degli utenti")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleUserTypeSelect = (email, value) => {
    setUserTypes({
      ...userTypes,
      [email]: value,
    })
  }

  const handleValidate = async (user) => {
    setActionInProgress(user.email)
    setAlert(null)

    try {
      const formData = {
        email: user.email,
        user_type: userTypes[user.email] || "DEFAULT_USER",
      }

      const response = await userService.validateUser(formData)

      // Send approval email
      try {
        await userService.sendApprovalEmail({ to: user.email, user })
      } catch (emailError) {
        console.error("Error sending approval email:", emailError)
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.email === user.email ? { ...u, is_approved: true, user_type: userTypes[user.email] || "DEFAULT_USER" } : u,
        ),
      )

      toast.success("Utente validato con successo")
      setAlert({
        type: "success",
        message: response.data || "Utente validato con successo",
      })
    } catch (error) {
      console.error("Error validating user:", error)
      toast.error("Errore durante la validazione dell'utente")
      setAlert({
        type: "error",
        message: error.response?.data || "Errore durante la validazione dell'utente",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const openDeleteDialog = (user) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    setActionInProgress(userToDelete.email)
    setAlert(null)

    try {
      const formData = {
        email: userToDelete.email,
      }

      const response = await userService.removeUser(formData)

      // Update local state
      setUsers(users.filter((u) => u.email !== userToDelete.email))

      toast.success("Utente eliminato con successo")
      setAlert({
        type: "success",
        message: response.data || "Utente eliminato con successo",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Errore durante l'eliminazione dell'utente")
      setAlert({
        type: "error",
        message: error.response?.data || "Errore durante l'eliminazione dell'utente",
      })
    } finally {
      setActionInProgress(null)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleNavigate = (user) => {
    navigate(`/valida-utente/modifica-utente/${user.email}`)
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get assigned town halls for a user
  const getAssignedTownHalls = (user) => {
    if (!user || !user.town_halls_list) return []
    return user.town_halls_list.map((thId) => townHalls.find((th) =>{ 
      return th._id === thId})).filter(Boolean)
  }

  const openUserDetails = (user) => {
    const assignedTownHalls = getAssignedTownHalls(user)
    const userWithTownHalls = {
      ...user,
      assignedTownHalls,
    }
    setUserDetails(userWithTownHalls)
    setUserDetailsOpen(true)
  }

  // Sorting function
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
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

  // First, keep the existing filter logic
  const filteredUsers = users.filter((user) => {
    // First apply tab filter
    let matches = true
    if (activeTab === "notValidated") matches = !user.is_approved
    if (activeTab === "validated") matches = user.is_approved

    // Then apply search filter
    if (searchQuery && matches) {
      const query = searchQuery.toLowerCase()
      return (
        user.name.toLowerCase().includes(query) ||
        user.surname.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    }

    return matches
  })

  // Then add this code to apply sorting
  const sortedUsers = React.useMemo(() => {
    const sortableUsers = [...filteredUsers]
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        let aValue, bValue

        // Handle special cases for sorting
        if (sortConfig.key === "name") {
          aValue = `${a.name} ${a.surname}`.toLowerCase()
          bValue = `${b.name} ${b.surname}`.toLowerCase()
        } else if (sortConfig.key === "town_halls_count") {
          aValue = a.town_halls_list ? a.town_halls_list.length : 0
          bValue = b.town_halls_list ? b.town_halls_list.length : 0
        } else if (sortConfig.key === "date") {
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
        } else {
          aValue = a[sortConfig.key]?.toLowerCase() || ""
          bValue = b[sortConfig.key]?.toLowerCase() || ""
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
    return sortableUsers
  }, [filteredUsers, sortConfig])

  function renderUserTable(users) {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="h-12 w-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 text-blue-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">Nessun utente trovato</h3>
          <p className="text-blue-300">
            {activeTab === "notValidated"
              ? "Non ci sono utenti in attesa di validazione"
              : "Nessun utente corrisponde ai criteri di ricerca"}
          </p>
        </div>
      )
    }

    return (
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
                onClick={() => requestSort("email")}
              >
                Email {renderSortIndicator("email")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("date")}
              >
                Data di iscrizione {renderSortIndicator("date")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("town_halls_count")}
              >
                Comuni {renderSortIndicator("town_halls_count")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider"
              >
                Stato
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider"
              >
                Tipo utente
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
            {sortedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-700/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.name} {user.surname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatDate(user.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.town_halls_list ? user.town_halls_list.length : 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.is_approved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-500/30">
                      <Check className="mr-1 h-3 w-3" />
                      Validato
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300 border border-yellow-500/30">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      In attesa
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {!user.is_approved ? (
                    <Select
                      value={userTypes[user.email] || "DEFAULT_USER"}
                      onValueChange={(value) => handleUserTypeSelect(user.email, value)}
                    >
                      <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-blue-900/30 text-white">
                        <SelectItem value="DEFAULT_USER">Utente visualizzatore</SelectItem>
                        <SelectItem value="MAINTAINER">Manutentore</SelectItem>
                        <SelectItem value="ADMINISTRATOR">Amministratore</SelectItem>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getUserTypeLabel(user.user_type)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUserDetails(user)}
                      disabled={actionInProgress !== null}
                      title="Visualizza dettagli"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    {!user.is_approved && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleValidate(user)}
                        isLoading={actionInProgress === user.email}
                        disabled={actionInProgress !== null}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Valida
                      </Button>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleNavigate(user)}
                      disabled={actionInProgress !== null}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifica
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      disabled={actionInProgress !== null}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Elimina
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div>
      <PageHeader title="Gestione Utenti" description="Valida, modifica o elimina gli account utente" />

      {alert && <Alert type={alert.type} message={alert.message} className="mb-6" />}

      <Card className="mb-6">
        <CardBody className="p-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList className="bg-slate-800 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Tutti gli utenti
                </TabsTrigger>
                <TabsTrigger
                  value="notValidated"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Da validare
                </TabsTrigger>
                <TabsTrigger
                  value="validated"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Validati
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                <Button
                  variant="primary"
                  onClick={handleDownloadCSV}
                  className="mb-2 sm:mb-0"
                >
                  Scarica CSV utenti
                </Button>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Cerca utenti..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {renderUserTable(filteredUsers)}
            </TabsContent>
            <TabsContent value="notValidated" className="mt-0">
              {renderUserTable(filteredUsers)}
            </TabsContent>
            <TabsContent value="validated" className="mt-0">
              {renderUserTable(filteredUsers)}
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border border-blue-900/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Conferma eliminazione
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Sei sicuro di voler eliminare l'utente {userToDelete?.name} {userToDelete?.surname}? Questa azione è
              irreversibile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionInProgress === userToDelete?.email}
            >
              Annulla
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={actionInProgress === userToDelete?.email}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="bg-slate-800 border border-blue-900/30 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Dettagli Utente
            </DialogTitle>
          </DialogHeader>

          {userDetails && (
      <div className="mt-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-blue-300">Nome</h3>
            <p className="text-white">
              {userDetails.name} {userDetails.surname}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300">Email</h3>
            <p className="text-white">{userDetails.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300">Tipo Utente</h3>
            <p className="text-white">
              {userDetails.user_type === "SUPER_ADMIN"
                ? "Super Admin"
                : userDetails.user_type === "ADMINISTRATOR"
                  ? "Amministratore"
                  : userDetails.user_type === "MAINTAINER"
                    ? "Manutentore"
                    : "Utente"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300">Data Registrazione</h3>
            <p className="text-white">{formatDate(userDetails.date)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-blue-300 mb-2">Comuni Associati</h3>
          {!userDetails.assignedTownHalls || userDetails.assignedTownHalls.length === 0 ? (
            <p className="text-white italic">Nessun comune associato</p>
          ) : (
            <div className="bg-slate-700/30 rounded-md border border-blue-900/30 overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-blue-900/30">
                  <thead className="bg-slate-700/50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-300">
                        Nome
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-300">
                        Punti Luce
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/30">
                    {userDetails.assignedTownHalls.map((townHall) => (
                      <tr key={townHall._id} className="hover:bg-slate-700/20">
                        <td className="px-4 py-2 text-sm text-white">{townHall.name}</td>
                        <td className="px-4 py-2 text-sm text-white">{townHall.light_points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

          <DialogFooter className="mt-6">
            <Button onClick={() => setUserDetailsOpen(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ValidateUser

