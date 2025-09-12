"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { organizationService, userService, townHallService } from "../services/api"
import { GlassCard, GlassCardContent, GlassCardHeader } from "../components/ui/glass-card"
import { ModernButton } from "../components/ui/modern-button"
import { ModernAlert } from "../components/ui/modern-alert"
import ModernPageHeader from "../components/ui/modern-page-header"
import ModernLoading from "../components/ui/modern-loading"
import { ModernInput } from "../components/ui/modern-input"
import { ModernSelect } from "../components/ui/modern-select"
import {
  Building,
  Search,
  Users,
  Info,
  ChevronUp,
  ChevronDown,
  Calendar,
  X,
  Mail,
  Shield,
  Clock,
  UserMinus,
  Tag,
  MapPin,
  PersonStanding,
  FileText,
BriefcaseBusiness,
EuroIcon,
UserCheck,
Trash,
UserCog
} from "lucide-react"
import toast from "react-hot-toast"
import ModernDialog from "../components/ui/modern-dialog"



const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([])
  const [users, setUsers] = useState([])
  const [townhalls, setTownhalls] = useState([])
  const [filteredOrganizations, setFilteredOrganizations] = useState([])
  const [organizationSearch, setOrganizationSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [organizationDetailsOpen, setOrganizationDetailsOpen] = useState(false)
  const [organizationDetails, setOrganizationDetails] = useState(null)
  const [removingUser, setRemovingUser] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  })

  // Stati per la gestione del modal del contratto
  const [contractModalOpen, setContractModalOpen] = useState(false)
  const [currentOrganization, setCurrentOrganization] = useState(null)
  const [contractData, setContractData] = useState({
    start_date: "",
    end_date: "",
    details: "",
    price: "",
    townhall_associated: "",
  })
  const [contractErrors, setContractErrors] = useState({})

  const [townhallModalOpen, setTownhallModalOpen] = useState(false)
  const [currentTownhallAssociation, setCurrentTownhallAssociation] = useState(null)
  const [townhallAssociationData, setTownhallAssociationData] = useState({
    associated_townhall_id: ""
  })
  const [townhallAssociationErrors, setTownhallAssociationErrors] = useState({})
  const [confirmTownhallModalOpen, setConfirmTownhallModalOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [currentInfoOrganization, setCurrentInfoOrganization] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState(null)



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [organizationsResponse, usersResponse, townhallsResponse] = await Promise.all([
          organizationService.getAll(),
          userService.getAll(),
          townHallService.getAll(),
        ])

        setOrganizations(organizationsResponse.data)
        setFilteredOrganizations(organizationsResponse.data)
        setUsers(usersResponse.data.filter((user) => user.is_approved))
        setTownhalls(townhallsResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Errore durante il caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter organizations based on search input
  useEffect(() => {
    if (organizationSearch.trim() === "") {
      setFilteredOrganizations(organizations)
    } else {
      const filtered = organizations.filter((org) => org.name.toLowerCase().includes(organizationSearch.toLowerCase()))
      setFilteredOrganizations(filtered)
    }
  }, [organizationSearch, organizations])

  // Get users for an organization
  const getUsersForOrganization = (organization) => {
    if (!organization.members || !Array.isArray(organization.members)) {
      return []
    }

    return users.filter((user) =>
      organization.members.some((memberId) => typeof memberId === "string" ? memberId === user._id : memberId._id === user._id)
    )
  }

  const openOrganizationDetails = (organization) => {
    const connectedUsers = getUsersForOrganization(organization)
    const organizationWithUsers = {
      ...organization,
      connectedUsers,
    }
    setOrganizationDetails(organizationWithUsers)
    setOrganizationDetailsOpen(true)
  }

  const openModalDelete = (organization) =>{
    setDeleteModalOpen(true);
    setOrganizationToDelete(organization)
  }

  // Funzione per aprire il modal del contratto
  const openContractModal = (organization) => {
    setCurrentOrganization(organization)
    setContractModalOpen(true)
    setContractErrors({})
    setContractData({
      start_date: "",
      end_date: "",
      details: "",
      price: "",
      townhall_associated: "",
    })
  }

  const openInfoModal = (organization) => {
    setCurrentInfoOrganization(organization);
    setInfoModalOpen(true);
  }

  // Funzione per gestire i dati del form del contratto
  const handleContractInputChange = (field, value) => {
    setContractData((prev) => ({ ...prev, [field]: value }))
  }

  // Funzione per inviare il contratto
  const handleContractSubmit = async (e) => {
    e.preventDefault()
    setContractErrors({})

    const newErrors = {}
    if (!contractData.start_date) newErrors.start_date = "La data di inizio è richiesta."
    if (!contractData.end_date) newErrors.end_date = "La data di fine è richiesta."
    if (contractData.start_date && contractData.end_date && new Date(contractData.start_date) >= new Date(contractData.end_date)) {
      newErrors.end_date = "La data di fine deve essere successiva a quella di inizio."
    }
    if (currentOrganization.type === "ENTERPRISE" && !contractData.townhall_associated) {
      newErrors.townhall_associated = "Il comune associato è richiesto per le aziende."
    }

    if (Object.keys(newErrors).length > 0) {
      setContractErrors(newErrors)
      toast.error("Correggi gli errori nel modulo.")
      return
    }

    try {
      const contractPayload = {
        organizationId: currentOrganization._id,
        contract: {
          ...contractData,
          price: parseFloat(contractData.price) || 0,
        }
      }
      await organizationService.createContract(contractPayload)
      toast.success("Contratto creato con successo!")
      setContractModalOpen(false)

      // Aggiorna lo stato delle organizzazioni dopo la creazione del contratto
      const updatedOrganizations = await organizationService.getAll()
      setOrganizations(updatedOrganizations.data)
      setFilteredOrganizations(updatedOrganizations.data)
      
    } catch (error) {
      console.error("Error creating contract:", error)
      toast.error("Errore durante la creazione del contratto.")
    }
  }

  // Nuova funzione per aprire il modal di associazione del comune
  const openTownhallModal = (organization) => {
    setCurrentTownhallAssociation(organization)
    setTownhallAssociationErrors({})
    // Pre-popola il campo se il comune è già associato
    setTownhallAssociationData({
      associated_townhall_id: organization.townhallId || ""
    })

    // Logica di avviso
    if (organization.townhallId) {
      setConfirmTownhallModalOpen(true);
    } else {
      setTownhallModalOpen(true);
    }
  }

  // Funzione per gestire l'invio dell'associazione del comune
  const handleTownhallAssociationSubmit = async (e) => {
    e.preventDefault()
    setTownhallAssociationErrors({})

    const newErrors = {}
    if (!townhallAssociationData.associated_townhall_id) {
      newErrors.associated_townhall_id = "Il comune da associare è richiesto."
    }

    if (Object.keys(newErrors).length > 0) {
      setTownhallAssociationErrors(newErrors)
      toast.error("Seleziona un comune per l'associazione.")
      return
    }

    try {
      const payload = {
        organizationId: currentTownhallAssociation._id,
        townhallId: townhallAssociationData.associated_townhall_id
      }
      await organizationService.associateTownhall(payload)
      toast.success("Comune associato con successo!")
      setTownhallModalOpen(false)

      // Aggiorna lo stato per riflettere il cambiamento nella UI
      setOrganizations((prevOrgs) =>
        prevOrgs.map((org) =>
          org._id === currentTownhallAssociation._id
            ? { ...org, townhallId: payload.townhallId }
            : org
        )
      )
      // Per assicurarsi che la visualizzazione sia aggiornata, potresti ricaricare i dati completi.
      // Se l'API restituisce l'oggetto aggiornato, è più efficiente aggiornare direttamente lo stato.
      const updatedOrganization = {
        ...currentTownhallAssociation,
        townhallId: payload.townhallId,
        associated_townhall: townhalls.find(t => t._id === payload.townhallId)
      }
      setOrganizations((prevOrgs) => 
        prevOrgs.map((org) => org._id === updatedOrganization._id ? updatedOrganization : org)
      )
    } catch (error) {
      console.error("Error associating townhall:", error)
      toast.error("Errore durante l'associazione del comune.")
    }
  }

  // Remove user from organization
  const removeUserFromOrganization = async (userId) => {
    if (!organizationDetails) return

    try {
      setRemovingUser(userId)
      await organizationService.removeUserFromOrganization({ userId: userId, organizationId: organizationDetails._id })

      const updatedUsers = organizationDetails.connectedUsers.filter((user) => user._id !== userId)
      setOrganizationDetails((prev) => ({
        ...prev,
        connectedUsers: updatedUsers,
      }))

      setOrganizations((prevOrgs) =>
        prevOrgs.map((org) =>
          org._id === organizationDetails._id
            ? {
              ...org,
              members: org.members.filter((memberId) => typeof memberId === "string" ? memberId !== userId : memberId._id !== userId),
            }
            : org
        )
      )

      toast.success("Utente rimosso dall'organizzazione")
    } catch (error) {
      console.error("Error removing user:", error)
      toast.error("Errore durante la rimozione dell'utente")
    } finally {
      setRemovingUser(null)
    }
  }

 const handleDeleteOrganization = async (hasToDeleteAll) => {
    if (!organizationToDelete) return;
    try {
      if (hasToDeleteAll) {
        await organizationService.deleteWithUsers(organizationToDelete._id);
        toast.success("Organizzazione e utenti associati eliminati con successo!");
      } else {
        await organizationService.delete(organizationToDelete._id);
        toast.success("Organizzazione eliminata con successo!");
      }

      // Rimuovi l'organizzazione dall'elenco locale
      setOrganizations((prevOrgs) =>
        prevOrgs.filter((org) => org._id !== organizationToDelete._id)
      );
      setDeleteModalOpen(false);
      setConfirmDeleteOpen(false);
      setOrganizationToDelete(null);
    } catch (error) {
      console.error("Error deleting organization:", error);
      // Gestisci diversi tipi di errore dal backend, se necessario
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Errore: ${error.response.data.message}`);
      } else {
        toast.error("Errore durante l'eliminazione dell'organizzazione.");
      }
    }
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Apply sorting to filtered organizations
  const sortedOrganizations = useMemo(() => {
    const sortableOrganizations = [...filteredOrganizations]
    if (sortConfig.key) {
      sortableOrganizations.sort((a, b) => {
        let aValue, bValue

        // Handle special cases for sorting
        if (sortConfig.key === "users_count") {
          aValue = getUsersForOrganization(a).length
          bValue = getUsersForOrganization(b).length
        } else if (sortConfig.key === "created_at" || sortConfig.key === "updated_at") {
          aValue = new Date(a[sortConfig.key] || "2000-01-01").getTime()
          bValue = new Date(b[sortConfig.key] || "2000-01-01").getTime()
        } else if (sortConfig.key === "location") {
          aValue = a.location?.city || ""
          bValue = b.location?.city || ""
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
    return sortableOrganizations
  }, [filteredOrganizations, sortConfig, users])

  // Memoized townhall options
  const townhallOptions = useMemo(() => {
    return townhalls.map((townhall) => ({
      value: townhall._id,
      label: `${townhall.name}`,
    }))
  }, [townhalls])

  // Nuovo memo per le opzioni del modal di associazione
  const townhallAssociationOptions = useMemo(() => {
    // Filtra i comuni che non sono già associati a un'organizzazione di tipo TOWNHALL
    const townhallOrganizations = organizations.filter(org => org.type === "TOWNHALL")
    const associatedTownhallIds = townhallOrganizations.map(org => org.townhallId).filter(Boolean)

    return townhalls
      .filter(townhall => 
        !associatedTownhallIds.includes(townhall._id) ||
        (currentTownhallAssociation && currentTownhallAssociation.townhallId === townhall._id)
      )
      .map((townhall) => ({
        value: townhall._id,
        label: `${townhall.name}`,
      }))
  }, [townhalls, organizations, currentTownhallAssociation])


  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      minute: "2-digit",
      hour: "2-digit",
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

  const getUserTypeLabel = (userType) => {
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

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case "SUPER_ADMIN":
        return "text-red-400"
      case "ADMINISTRATOR":
        return "text-amber-400"
      case "MAINTAINER":
        return "text-emerald-400"
      default:
        return "text-slate-400"
    }
  }

  const getOrganizationTypeLabel = (type) => {
    switch (type) {
      case "TOWNHALL":
        return "Comune"
      case "ENTERPRISE":
        return "Azienda"
      default:
        return "N/A"
    }
  }

  const getOrganizationTypeColor = (type) => {
    switch (type) {
      case "TOWNHALL":
        return "text-blue-400"
      case "ENTERPRISE":
        return "text-emerald-400"
      default:
        return "text-slate-400"
    }
  }

  const formatLocation = (location) => {
    if (!location) return "N/A"
    const parts = [location.city, location.province, location.state].filter(Boolean)
    return parts.join(", ") || "N/A"
  }
  const formatAddress = (address) => {
    if (!address ) return "N/A"
    const parts = [address.street, address.postal_code, address.city, address.province, address.state].filter(Boolean)
    return parts.join(", ") || "N/A"
  }

  // Funzione per ottenere il nome del comune associato
  const getAssociatedTownhallName = (organization) => {
    const associatedTownhall = townhalls.find(t => t._id === organization.townhallId);
    return associatedTownhall ? associatedTownhall.name : "Nessuno";
  }

  const getResponsibleName = (responsible) => {
    
    return responsible ? `${responsible.name} ${responsible.surname}` : "N/A";
  }


  if (loading) {
    return <ModernLoading />
  }

  return (
    <div className="space-y-8">
      <ModernPageHeader
        title="Gestione Organizzazioni"
        description="Visualizza e gestisci tutte le organizzazioni e i loro utenti associati"
      />

      {alert && <ModernAlert type={alert.type} message={alert.message} />}

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={organizationSearch}
                onChange={(e) => setOrganizationSearch(e.target.value)}
                placeholder="Cerca organizzazioni..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Organizations Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard variant="elevated">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Organizzazioni</h2>
                  <p className="text-sm text-slate-400 mt-1">{sortedOrganizations.length} organizzazioni trovate</p>
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
                      onClick={() => requestSort("type")}
                    >
                      Tipo {renderSortIndicator("type")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => requestSort("location")}
                    >
                      Località {renderSortIndicator("location")}
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
                      onClick={() => requestSort("updated_at")}
                    >
                      Ultimo Aggiornamento {renderSortIndicator("updated_at")}
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
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                          <span>Caricamento organizzazioni...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        <Building className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                        <p className="text-lg">Nessuna organizzazione trovata</p>
                        <p className="text-sm mt-2">
                          {organizationSearch
                            ? "Prova a modificare il termine di ricerca"
                            : "Non ci sono organizzazioni disponibili"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sortedOrganizations.map((organization) => (
                      <motion.tr
                        key={organization._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-800/30 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600/50">
                              <Building className="h-5 w-5 text-slate-300" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{organization.name}</div>
                              {organization.description && (
                                <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                                  {organization.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm">
                            <Tag className="h-4 w-4 text-slate-400" />
                            <span className={getOrganizationTypeColor(organization.type)}>
                              {getOrganizationTypeLabel(organization.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{formatLocation(organization.address)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>{getUsersForOrganization(organization).length}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{formatDate(organization.updated_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => openOrganizationDetails(organization)}
                            title="Gestisci utenti"
                          >
                            <UserCog className="h-4 w-4" />
   
                          </ModernButton>
                          <ModernButton
                            variant="danger"
                            size="sm"
                            onClick={() => openModalDelete(organization)}
                            title="Rimuovi organizzazione"
                            className="ml-2"
                          >
                            <Trash className="h-4 w-4" />
   
                          </ModernButton>
                          <ModernButton
                            variant="glass"
                            size="sm"
                            title="Info organizzazione"
                            onClick={() => openInfoModal(organization)
                            }
                            className="ml-2"
                          >
                            <Info className="h-4 w-4 " /> 
                          </ModernButton>
                          {organization.type === "ENTERPRISE" ? (
                            <ModernButton
                              variant="secondary"
                              size="sm"
                              onClick={() => openContractModal(organization)}
                              className="ml-2"
                              title="Crea contratto"
                            >
                              <Calendar className="h-4 w-4" />
                            </ModernButton>
                          ) : (
                            <ModernButton
                              variant="secondary"
                              size="sm"
                              onClick={() => openTownhallModal(organization)}
                              className="ml-2"
                              title="Associa Comune"
                            >
                              <PersonStanding className="h-4 w-4" />
                            </ModernButton>
                          )}
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

      {/* Organization Details Modal */}
      <AnimatePresence>
        {organizationDetailsOpen && organizationDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOrganizationDetailsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Gestione Utenti</h2>
                    <p className="text-sm text-slate-400">
                      {organizationDetails.name} - {organizationDetails.connectedUsers.length} utenti
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOrganizationDetailsOpen(false)}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6">
                {/* Connected Users */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    Utenti Associati ({organizationDetails.connectedUsers.length})
                  </h3>
                  {/* 📍 AGGIUNGI QUI LE INFORMAZIONI SUL COMUNE ASSOCIATO PER IL MODAL TOWNHALL */}
                  {organizationDetails.type === "TOWNHALL" && (
                    <div className="flex items-center space-x-2 text-sm text-slate-400 mt-2">
                      <PersonStanding className="h-4 w-4" />
                      <span>Comune Associato: <strong>{getAssociatedTownhallName(organizationDetails)}</strong></span>
                    </div>
                  )}

                  {organizationDetails.connectedUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">Nessun utente associato</p>
                      <p className="text-slate-500 text-sm mt-2">
                        Aggiungi utenti a questa organizzazione dalla pagina di gestione
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {organizationDetails.connectedUsers.map((user) => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold border border-slate-600/50">
                              {user.name?.charAt(0)}
                              {user.surname?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {user.name} {user.surname}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{user.email}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Shield className="h-3 w-3" />
                                  <span className={getUserTypeColor(user.user_type)}>
                                    {getUserTypeLabel(user.user_type)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(user.date).toLocaleDateString("it-IT")}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <ModernButton
                            variant="danger"
                            size="sm"
                            onClick={() => removeUserFromOrganization(user._id, user.email)}
                            isLoading={removingUser === user._id}
                            disabled={removingUser === user._id}
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Rimuovi
                          </ModernButton>
                        </motion.div>
                      ))}
                  </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-slate-700/50">
                  <ModernButton onClick={() => setOrganizationDetailsOpen(false)}>Chiudi</ModernButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Modal */}
      <AnimatePresence>
        {contractModalOpen && currentOrganization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setContractModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Crea Contratto di Manutenzione</h2>
                    <p className="text-sm text-slate-400">
                      Organizzazione: {currentOrganization.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setContractModalOpen(false)}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Form Content */}
              <form onSubmit={handleContractSubmit}>
                <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6 space-y-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ModernInput label="Data Inizio *" value={contractData.start_date} onChange={(e) => handleContractInputChange("start_date", e.target.value)} type="date" variant="glass" icon={<Calendar className="h-4 w-4" />} />
                        {contractErrors.start_date && <p className="text-red-400 text-xs mt-1 ml-1">{contractErrors.start_date}</p>}
                      </div>
                      <div>
                        <ModernInput label="Data Fine *" value={contractData.end_date} onChange={(e) => handleContractInputChange("end_date", e.target.value)} type="date" variant="glass" icon={<Calendar className="h-4 w-4" />} />
                        {contractErrors.end_date && <p className="text-red-400 text-xs mt-1 ml-1">{contractErrors.end_date}</p>}
                      </div>
                    </div>
                    <ModernInput label="Dettagli Contratto" value={contractData.details} onChange={(e) => handleContractInputChange("details", e.target.value)} placeholder="Dettagli, termini, o note..." variant="glass" icon={<FileText className="h-4 w-4" />} />
                    <ModernInput label="Prezzo (€)" value={contractData.price} onChange={(e) => handleContractInputChange("price", e.target.value)} placeholder="es. 1500.00" type="number" step="0.01" variant="glass" icon={<EuroIcon className="h-4 w-4" />} />
                    <ModernSelect label="Comune Associato *" value={contractData.townhall_associated} onValueChange={(value) => handleContractInputChange("townhall_associated", value)} options={townhallOptions} variant="glass" placeholder="Cerca e seleziona un comune..." />
                    {contractErrors.townhall_associated && <p className="text-red-400 text-xs mt-1 ml-1">{contractErrors.townhall_associated}</p>}
                  </motion.div>
                </div>
                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-slate-700/50">
                  <ModernButton type="button" variant="ghost" onClick={() => setContractModalOpen(false)} className="mr-2">Annulla</ModernButton>
                  <ModernButton type="submit" variant="primary">Crea Contratto</ModernButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmTownhallModalOpen && (
          <ModernDialog
            title="Attenzione"
            description={`L'organizzazione ${currentTownhallAssociation?.name} è già associata al comune ${getAssociatedTownhallName(currentTownhallAssociation)}. Procedere comunque?`}
            onConfirm={() => {
              setConfirmTownhallModalOpen(false);
              setTownhallModalOpen(true);
            }}
            onCancel={() => setConfirmTownhallModalOpen(false)}
            isOpen={confirmTownhallModalOpen}
          />
        )}
      </AnimatePresence>

      {/* 📍 NUOVO MODAL PER L'ASSOCIAZIONE DEL COMUNE */}
      <AnimatePresence>
        {townhallModalOpen && currentTownhallAssociation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setTownhallModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <PersonStanding className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Associa Comune a {currentTownhallAssociation.name}</h2>
                    <p className="text-sm text-slate-400">
                      Seleziona il comune da associare a questa organizzazione
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTownhallModalOpen(false)}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Form Content */}
              <form onSubmit={handleTownhallAssociationSubmit}>
                <div className="p-6 space-y-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ModernSelect
                      label="Comune da associare *"
                      value={townhallAssociationData.associated_townhall_id}
                      onValueChange={(value) => setTownhallAssociationData({ associated_townhall_id: value })}
                      options={townhallAssociationOptions}
                      variant="glass"
                      placeholder="Seleziona un comune..."
                    />
                    {townhallAssociationErrors.associated_townhall_id && <p className="text-red-400 text-xs mt-1 ml-1">{townhallAssociationErrors.associated_townhall_id}</p>}
                  </motion.div>
                </div>
                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-slate-700/50">
                  <ModernButton type="button" variant="ghost" onClick={() => setTownhallModalOpen(false)} className="mr-2">Annulla</ModernButton>
                  <ModernButton type="submit" variant="primary">Associa Comune</ModernButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
<AnimatePresence>
        {infoModalOpen && currentInfoOrganization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setInfoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Informazioni su {currentInfoOrganization.name}</h2>
                    <p className="text-sm text-slate-400">
                      Dettagli completi dell'organizzazione.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInfoModalOpen(false)}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome e Descrizione */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-slate-400" /> Dati Generali</h3>
                    <div className="space-y-2">
                      <p><strong className="text-white">Nome:</strong> {currentInfoOrganization.name}</p>
                      <p><strong className="text-white">Tipo:</strong> <span className={getOrganizationTypeColor(currentInfoOrganization.type)}>{getOrganizationTypeLabel(currentInfoOrganization.type)}</span></p>
                      <p><strong className="text-white">Descrizione:</strong> {currentInfoOrganization.description || "N/A"}</p>
                    </div>
                  </div>

                  {/* Responsabile e Comune Associato */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><UserMinus className="h-5 w-5 text-slate-400" /> Relazioni</h3>
                    <div className="space-y-2">
                      <p><strong className="text-white">Responsabile:</strong> {getResponsibleName(currentInfoOrganization.responsible)}</p>
                      <p><strong className="text-white">Membri:</strong> {getUsersForOrganization(currentInfoOrganization).length} membri</p>
                      <p><strong className="text-white">Comune Associato:</strong> {getAssociatedTownhallName(currentInfoOrganization)}</p>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-700/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dati temporali */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><Clock className="h-5 w-5 text-slate-400" /> Dati Temporali</h3>
                    <div className="space-y-2">
                      <p><strong className="text-white">Creato il:</strong> {formatDate(currentInfoOrganization.created_at)}</p>
                      <p><strong className="text-white">Ultimo aggiornamento:</strong> {formatDate(currentInfoOrganization.updated_at)}</p>
                    </div>
                  </div>

                  {/* Indirizzo */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-slate-400" /> Indirizzo</h3>
                    <p>{formatAddress(currentInfoOrganization.address)}</p>
                  </div>
                </div>

                {/* Dettagli Contratti (solo per ENTERPRISE) */}
                {currentInfoOrganization.type === "ENTERPRISE" && currentInfoOrganization.contracts && currentInfoOrganization.contracts.length > 0 && (
                  <>
                    <hr className="border-slate-700/50" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-slate-400" /> Contratti</h3>
                      <div className="space-y-4">
                        {currentInfoOrganization.contracts.map((contract, index) => (
                          <div key={index} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
                            <p className="flex items-center gap-2"><EuroIcon className="h-4 w-4 text-emerald-400" /> <strong className="text-white">Prezzo:</strong> {contract.price ? contract.price + " €" : "Importo non definito"}</p>
                            <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-400" /> <strong className="text-white">Periodo:</strong> {formatDate(contract.start_date)} - {formatDate(contract.end_date)}</p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">
                              <strong className="text-white">Dettagli:</strong> {contract.details || "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {
          deleteModalOpen && (
            <ModernDialog
            title="Attenzione"
            description={`Vuoi davvero eliminare l'organizzazione ${organizationToDelete?.name}?`}
            onConfirm={() => {
              setConfirmDeleteOpen(true);
              setDeleteModalOpen(false);
            }}
            onCancel={() => setDeleteModalOpen(false)}
            isOpen={deleteModalOpen}
          />
          )
        }
        {
          deleteModalOpen && (
            <ModernDialog
              title="Attenzione"
              description={`Vuoi davvero eliminare l'organizzazione ${organizationToDelete?.name}?`}
              onConfirm={() => {
                // Se l'organizzazione non ha utenti, chiedi conferma diretta
                const usersCount = getUsersForOrganization(organizationToDelete).length;
                if (usersCount === 0) {
                  handleDeleteOrganization(false);
                  setDeleteModalOpen(false);
                } else {
                  // Altrimenti, passa al secondo modal di conferma
                  setConfirmDeleteOpen(true);
                  setDeleteModalOpen(false);
                }
              }}
              onCancel={() => setDeleteModalOpen(false)}
              isOpen={deleteModalOpen}
            />
          )
        }
        {
          confirmDeleteOpen && (
            <ModernDialog
              title="Attenzione"
              description={`Vuoi eliminare anche tutti gli utenti associati all'organizzazione ${organizationToDelete?.name}?`}
              onConfirm={() => {
                // Chiama la funzione di eliminazione passando "true" per eliminare anche gli utenti
                handleDeleteOrganization(true);
                setConfirmDeleteOpen(false);
              }}
              onCancel={() => {
                // Chiama la funzione di eliminazione passando "false" per eliminare solo l'organizzazione
                handleDeleteOrganization(false);
                setConfirmDeleteOpen(false);
              }}
              isOpen={confirmDeleteOpen}
              confirmText="Elimina anche utenti associati"
              cancelText="Elimina solo l'organizzazione"
            />
          )
        }
      </AnimatePresence>
    </div>
  )
}

export default OrganizationManagement