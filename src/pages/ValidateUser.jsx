"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { userService } from "../services/api"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader
} from "../components/ui/glass-card"
import { ModernButton } from "../components/ui/modern-button"
import { ModernAlert } from "../components/ui/modern-alert"
import { ModernUserValidationModal } from "../components/ui/modern-user-validation-modal"
import { ModernUserEditModal } from "../components/ui/modern-user-edit-modal"
import ModernPageHeader from "../components/ui/modern-page-header"
import ModernLoading from "../components/ui/modern-loading"
import {
  UserCheck,
  Mail,
  User,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Building,
  Settings,
  Edit,
  Trash,
  AlertTriangle
} from "lucide-react"
import toast from "react-hot-toast"

const ModernValidateUser = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingUser, setProcessingUser] = useState(null)
  const [alert, setAlert] = useState(null)
  const searchQuery =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("search") || ""
      : ""
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "descending"
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        user =>
          `${user.name} ${user.surname}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        if (statusFilter === "pending") return !user.is_approved
        if (statusFilter === "approved") return user.is_approved
        return true
      })
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAll()
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setAlert({
        type: "error",
        message: "Errore durante il caricamento degli utenti"
      })
      toast.error("Errore durante il caricamento degli utenti")
    } finally {
      setLoading(false)
    }
  }

  const handleUserValidation = async (userId, action, userType) => {
    setProcessingUser(userId)
    setAlert(null)

    try {
      if (action === "approve") {

        // First update user type, then approve
        if (userType) {
          console.log(userType);
          const dataToSend = {
            userId,
            user_type: userType
          }
          await userService.validateUser(dataToSend)
        }
        toast.success("Utente approvato con successo")
      } else if (action === "reject") {
        await userService.removeUserByID(userId)
        toast.success("Utente rifiutato con successo")
      }

      // Update local state
      if (action === "approve") {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? {
                  ...user,
                  is_approved: action === "approve",
                  user_type:
                    action === "approve" && userType ? userType : user.user_type
                }
              : user
          )
        )
      } else {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId))
      }

      setAlert({
        type: "success",
        message: `Utente ${
          action === "approve" ? "approvato" : "rifiutato"
        } con successo`
      })
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      const message =
        error.response?.data?.message ||
        `Errore durante ${
          action === "approve" ? "l'approvazione" : "il rifiuto"
        } dell'utente`
      setAlert({
        type: "error",
        message
      })
      toast.error(message)
    } finally {
      setProcessingUser(null)
    }
  }

  const handleUserEdit = async (userId, userData) => {
    setProcessingUser(userId)
    setAlert(null)

    try {
      const dataToSend = {
        id: userId,
        userData
      }
      await userService.updateUser(dataToSend)

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? {
                ...user,
                ...userData
              }
            : user
        )
      )

      setAlert({
        type: "success",
        message: "Utente modificato con successo"
      })
      toast.success("Utente modificato con successo")
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
      const message =
        error.response?.data?.message ||
        "Errore durante la modifica dell'utente"
      setAlert({
        type: "error",
        message
      })
      toast.error(message)
    } finally {
      setProcessingUser(null)
    }
  }
  const handleDelete = async userId => {
    setProcessingUser(userId)
    setAlert(null)

    try {
      await userService.removeUserByID(userId)
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId))
      setAlert({
        type: "success",
        message: "Utente eliminato con successo"
      })
      toast.success("Utente eliminato con successo")
      setShowConfirmDialog(null)
    } catch (error) {
      console.error("Error deleting user:", error)
      const message =
        error.response?.data?.message ||
        "Errore durante l'eliminazione dell'utente"
      setAlert({
        type: "error",
        message
      })
      toast.error(message)
    } finally {
      setProcessingUser(null)
    }
  }

  const openValidationModal = user => {
    setSelectedUser(user)
    setIsValidationModalOpen(true)
  }

  const closeValidationModal = () => {
    setSelectedUser(null)
    setIsValidationModalOpen(false)
  }

  const openEditModal = user => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setSelectedUser(null)
    setIsEditModalOpen(false)
  }

  // Sorting function
  const requestSort = key => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Apply sorting to filtered users
  const sortedUsers = useMemo(() => {
    const sortableUsers = [...filteredUsers]
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        let aValue, bValue

        if (sortConfig.key === "name") {
          aValue = `${a.name} ${a.surname}`.toLowerCase()
          bValue = `${b.name} ${b.surname}`.toLowerCase()
        } else if (
          sortConfig.key === "created_at" ||
          sortConfig.key === "date"
        ) {
          aValue = new Date(a.date || a.created_at).getTime()
          bValue = new Date(b.date || b.created_at).getTime()
        } else if (sortConfig.key === "town_halls_count") {
          aValue = a.town_halls_list?.length || 0
          bValue = b.town_halls_list?.length || 0
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
    return sortableUsers
  }, [filteredUsers, sortConfig])

  const getStatusBadge = isApproved => {
    if (isApproved) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approvato
        </div>
      )
    }
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-300 border border-amber-500/30">
        <Clock className="w-3 h-3 mr-1" />
        In attesa
      </div>
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

  // Render sort indicator
  const renderSortIndicator = key => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  const ConfirmDialog = ({ user, onConfirm, onCancel }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-red-900/20 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Conferma Eliminazione
            </h3>
            <p className="text-sm text-slate-400">
              Questa azione non può essere annullata
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-slate-300 mb-2">
            Sei sicuro di voler eliminare l'utente{" "}
            <strong className="text-white">{user?.name} {user?.surname}</strong>?
          </p>
          <div className="text-sm text-slate-400 space-y-1">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email: {user?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Tipo: {getUserTypeLabel(user?.user_type)}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <ModernButton variant="outline" onClick={onCancel} className="flex-1">
            Annulla
          </ModernButton>
          <ModernButton
            variant="destructive"
            onClick={() => onConfirm(user._id)}
            isLoading={processingUser === user._id}
            className="flex-1"
          >
            <Trash className="mr-2 h-4 w-4" />
            Elimina
          </ModernButton>
        </div>
      </motion.div>
    </motion.div>
  )

  if (loading) {
    return <ModernLoading />
  }



  const pendingUsers = users.filter(user => !user.is_approved)
  const approvedUsers = users.filter(user => user.is_approved)

  return (
    <div className="space-y-8">
      <ModernPageHeader
        title="Gestione Utenti"
        description="Approva o rifiuta le richieste di registrazione degli utenti"
      />

      {alert && <ModernAlert type={alert.type} message={alert.message} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Utenti in attesa
                  </p>
                  <p className="text-3xl font-bold text-amber-300">
                    {pendingUsers.length}
                  </p>
                </div>
                <div className="p-3 bg-amber-900/20 rounded-xl">
                  <Clock className="h-8 w-8 text-amber-400" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Utenti approvati
                  </p>
                  <p className="text-3xl font-bold text-emerald-300">
                    {approvedUsers.length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-900/20 rounded-xl">
                  <UserCheck className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Totale utenti
                  </p>
                  <p className="text-3xl font-bold text-blue-300">
                    {users.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-xl">
                  <User className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cerca per nome o email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 appearance-none"
                  >
                    <option value="all">Tutti gli stati</option>
                    <option value="pending">In attesa</option>
                    <option value="approved">Approvati</option>
                  </select>
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard variant="elevated">
          <GlassCardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Lista Utenti
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {sortedUsers.length} utenti trovati
                </p>
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
                      onClick={() => requestSort("email")}
                    >
                      Email {renderSortIndicator("email")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("user_type")}
                    >
                      Tipo {renderSortIndicator("user_type")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("town_halls_count")}
                    >
                      Comuni {renderSortIndicator("town_halls_count")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("date")}
                    >
                      Data Registrazione {renderSortIndicator("date")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider"
                    >
                      Stato
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
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        <User className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                        <p className="text-lg">Nessun utente trovato</p>
                        <p className="text-sm mt-2">
                          {searchTerm || statusFilter !== "all"
                            ? "Prova a modificare i filtri di ricerca"
                            : "Non ci sono utenti registrati"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map(user => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-800/30 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold text-sm border border-slate-600/50">
                              {user.name?.charAt(0)}
                              {user.surname?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {user.name} {user.surname}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Shield className="h-4 w-4 text-slate-400" />
                            <span>{getUserTypeLabel(user.user_type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Building className="h-4 w-4 text-slate-400" />
                            <span>{user.town_halls_list?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>
                              {new Date(
                                user.date || user.created_at
                              ).toLocaleDateString("it-IT")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.is_approved)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* Edit Button - Available for all users */}
                            <ModernButton
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              disabled={processingUser === user._id}
                            >
                              <Edit className="h-4 w-4" />
                            </ModernButton>
                            <ModernButton
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowConfirmDialog(true)
                              }}
                              disabled={processingUser === user._id}
                            >
                              <Trash className="h-4 w-4" />
                            </ModernButton>

                            {/* Validation Button - Only for pending users */}
                            {!user.is_approved && (
                              <ModernButton
                                variant="glass"
                                size="sm"
                                onClick={() => openValidationModal(user)}
                                disabled={processingUser === user._id}
                                isLoading={processingUser === user._id}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Valida
                              </ModernButton>
                            )}
                          </div>
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

      {/* Validation Modal */}
      <ModernUserValidationModal
        isOpen={isValidationModalOpen}
        onClose={closeValidationModal}
        user={selectedUser}
        onValidate={handleUserValidation}
        isLoading={processingUser !== null}
      />

      {/* Edit Modal */}
      <ModernUserEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        user={selectedUser}
        onSave={handleUserEdit}
        isLoading={processingUser !== null}
      />
      <AnimatePresence>
        {showConfirmDialog && selectedUser && (
          <ConfirmDialog
            user={selectedUser}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirmDialog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ModernValidateUser
