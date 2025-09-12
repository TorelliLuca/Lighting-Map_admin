"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { userService, townHallService, organizationService } from "../services/api"
import { GlassCard, GlassCardContent, GlassCardHeader } from "../components/ui/glass-card"
import { ModernButton } from "../components/ui/modern-button"
import { ModernInput } from "../components/ui/modern-input"
import { ModernAlert } from "../components/ui/modern-alert"
import ModernPageHeader from "../components/ui/modern-page-header"
import { Building, Search, Users, Check, Plus, X } from "lucide-react"
import toast from "react-hot-toast"
import { mapOrganizationTypeToItalian } from "../utils/formatters"

const AddUsersToOrganization = () => {
  const [users, setUsers] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filteredOrganizations, setFilteredOrganizations] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [userSearch, setUserSearch] = useState("")
  const [organizationSearch, setOrganizationSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersResponse, organizationsResponse] = await Promise.all([
          userService.getAll(),
          organizationService.getAll(), // Using townHallService as organizations
        ])

        const approvedUsers = usersResponse.data.filter((user) => user.is_approved)
        setUsers(approvedUsers)
        setOrganizations(organizationsResponse.data)
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
    let availableUsers = users
    console.log(selectedOrganization);
    if (selectedOrganization && Array.isArray(selectedOrganization.members)) {
      availableUsers = users.filter((user) => !selectedOrganization.members.includes(user._id))
    }
    if (userSearch.trim() === "") {
      setFilteredUsers(availableUsers)
    } else {
      const filtered = availableUsers.filter(
        (user) =>
          `${user.name} ${user.surname}`.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [userSearch, users, selectedOrganization])

  useEffect(() => {
    if (organizationSearch.trim() === "") {
      setFilteredOrganizations(organizations)
    } else {
      const filtered = organizations.filter((org) => org.name.toLowerCase().includes(organizationSearch.toLowerCase()))
      setFilteredOrganizations(filtered)
    }
  }, [organizationSearch, organizations])

  const handleOrganizationSelect = (organization) => {
    setSelectedOrganization({
      id: organization._id,
      name: organization.name,
      members: organization.members || [],
    })
  }

  const handleUserToggle = (user) => {
    const isSelected = selectedUsers.some((u) => u.id === user._id)

    if (isSelected) {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user._id))
    } else {
      setSelectedUsers((prev) => [
        ...prev,
        {
          id: user._id,
          name: `${user.name} ${user.surname}`,
          email: user.email,
          user_type: user.user_type,
        },
      ])
    }
  }

  const removeSelectedUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const getUserTypeLabel = (type) => {
    const labels = {
      DEFAULT_USER: "Utente Standard",
      MAINTAINER: "Manutentore",
      ADMINISTRATOR: "Amministratore",
      SUPER_ADMIN: "Super Admin",
    }
    return labels[type] || type
  }

  const getUserTypeColor = (type) => {
    switch (type) {
      case "DEFAULT_USER":
        return "text-slate-400"
      case "MAINTAINER":
        return "text-emerald-400"
      case "ADMINISTRATOR":
        return "text-amber-400"
      case "SUPER_ADMIN":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedOrganization || selectedUsers.length === 0) {
      toast.error("Seleziona un'organizzazione e almeno un utente")
      return
    }

    setSubmitting(true)
    setAlert(null)

    try {
      // Add each user to the organization
      const formToSend = {
        organizationId: selectedOrganization.id,
        members: selectedUsers.map((user) => user.id),
      }

      const response = await organizationService.addUsersToOrganization(formToSend)

      setAlert({
        type: "success",
        message: `${selectedUsers.length} utenti aggiunti con successo all'organizzazione`,
      })

      toast.success(`${selectedUsers.length} utenti aggiunti con successo`)

      // Reset form
      setSelectedUsers([])
      setUserSearch("")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setAlert({
        type: "error",
        message: error.response?.data || "Errore durante l'aggiunta degli utenti",
      })

      toast.error("Errore durante l'aggiunta degli utenti")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <ModernPageHeader
        title="Aggiungi Utenti all'Organizzazione"
        description="Seleziona un'organizzazione dalla tabella di sinistra e gli utenti dalla tabella di destra"
      />

      {alert && <ModernAlert type={alert.type} message={alert.message} />}

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organizations Table */}
            <GlassCard variant="elevated">
              <GlassCardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Organizzazioni</h2>
                    <p className="text-sm text-slate-400 mt-1">Seleziona un'organizzazione</p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <ModernInput
                    value={organizationSearch}
                    onChange={(e) => setOrganizationSearch(e.target.value)}
                    placeholder="Cerca organizzazione..."
                    icon={<Search className="h-4 w-4" />}
                    variant="glass"
                    disabled={loading}
                  />

                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-8 text-slate-400">Caricamento...</div>
                      ) : filteredOrganizations.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">Nessuna organizzazione trovata</div>
                      ) : (
                        filteredOrganizations.map((org) => (
                          <motion.div
                            key={org._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                              selectedOrganization?.id === org._id
                                ? "bg-blue-900/30 border-blue-500/50 shadow-lg"
                                : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50"
                            }`}
                            onClick={() => handleOrganizationSelect(org)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-white flex items-center">
                                  {org.name}
                                  {selectedOrganization?.id === org._id && (
                                    <Check className="h-4 w-4 text-emerald-400 ml-2" />
                                  )}
                                </div>
                                <div className="text-m text-slate-200">Tipo: {mapOrganizationTypeToItalian(org.type)}</div>
                                <div className="text-sm text-slate-400">Numero membri: {org.members.length || 0}</div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Users Table */}
            <GlassCard variant="elevated">
              <GlassCardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Utenti</h2>
                    <p className="text-sm text-slate-400 mt-1">Seleziona utenti ({selectedUsers.length} selezionati)</p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <ModernInput
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cerca utenti per nome o email..."
                    icon={<Search className="h-4 w-4" />}
                    variant="glass"
                    disabled={loading || !selectedOrganization}
                  />

                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-8 text-slate-400">Caricamento...</div>
                      ) : !selectedOrganization ? (
                        <div className="text-center py-8 text-slate-400">Seleziona prima un'organizzazione</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">Nessun utente trovato</div>
                      ) : (
                        filteredUsers.map((user) => {
                          const isSelected = selectedUsers.some((u) => u.id === user._id)
                          return (
                            <motion.div
                              key={user._id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? "bg-emerald-900/30 border-emerald-500/50 shadow-lg"
                                  : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50"
                              }`}
                              onClick={() => handleUserToggle(user)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-white flex items-center">
                                    {user.name} {user.surname}
                                    {isSelected && <Check className="h-4 w-4 text-emerald-400 ml-2" />}
                                  </div>
                                  <div className="text-sm text-slate-400">{user.email}</div>
                                  <div className={`text-xs ${getUserTypeColor(user.user_type)}`}>
                                    {getUserTypeLabel(user.user_type)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Selected Users Summary and Submit */}
          {selectedUsers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <GlassCard variant="elevated">
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Riepilogo Selezione</h3>
                      <div className="text-sm text-slate-400">{selectedUsers.length} utenti selezionati</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Organizzazione Selezionata</label>
                        {selectedOrganization && (
                          <div className="p-3 bg-blue-900/20 rounded-xl border border-blue-500/30">
                            <div className="font-medium text-white">{selectedOrganization.name}</div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Utenti da Aggiungere</label>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {selectedUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-2 bg-emerald-900/20 rounded-lg border border-emerald-500/30"
                            >
                              <div className="text-sm text-white">{user.name}</div>
                              <button
                                type="button"
                                onClick={() => removeSelectedUser(user.id)}
                                className="p-1 rounded hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <ModernButton
                      onClick={handleSubmit}
                      isLoading={submitting}
                      disabled={loading || !selectedOrganization || selectedUsers.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {submitting
                        ? "Aggiunta in corso..."
                        : `Aggiungi ${selectedUsers.length} Utenti all'Organizzazione`}
                    </ModernButton>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AddUsersToOrganization
