"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { townHallService } from "../services/api"
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
  Trash2,
  Building,
  Search,
  AlertTriangle,
  MapPin,
  Lightbulb,
  Calendar
} from "lucide-react"
import toast from "react-hot-toast"
import { sortArrayAlphabetically } from "../utils/formatters"

const RemoveTownHall = () => {
  const [townHalls, setTownHalls] = useState([])
  const [filteredTownHalls, setFilteredTownHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(new Set())
  const [alert, setAlert] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(null)

  useEffect(() => {
    fetchTownHalls()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTownHalls(townHalls)
    } else {
      const filtered = townHalls.filter(townHall =>
        townHall.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTownHalls(filtered)
    }
  }, [searchTerm, townHalls])

  const fetchTownHalls = async () => {
    try {
      setLoading(true)
      const response = await townHallService.getAll()
      setTownHalls(response.data)
    } catch (error) {
      console.error("Error fetching town halls:", error)
      setAlert({
        type: "error",
        message: "Errore durante il caricamento dei comuni"
      })
      toast.error("Errore durante il caricamento dei comuni")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async townHallId => {
    setDeleting(prev => new Set(prev).add(townHallId))
    setAlert(null)

    try {
      await townHallService.delete(townHallId)
      setTownHalls(prev => prev.filter(th => th._id !== townHallId))
      setAlert({
        type: "success",
        message: "Comune eliminato con successo"
      })
      toast.success("Comune eliminato con successo")
    } catch (error) {
      console.error("Error deleting town hall:", error)
      const message =
        error.response?.data || "Errore durante l'eliminazione del comune"
      setAlert({
        type: "error",
        message
      })
      toast.error(message)
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev)
        newSet.delete(townHallId)
        return newSet
      })
      setShowConfirmDialog(null)
    }
  }

  const ConfirmDialog = ({ townHall, onConfirm, onCancel }) => (
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
            Sei sicuro di voler eliminare il comune{" "}
            <strong className="text-white">{townHall.name}</strong>?
          </p>
          <div className="text-sm text-slate-400 space-y-1">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Punti luce: {townHall.light_points}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Provincia: {townHall.province}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <ModernButton variant="outline" onClick={onCancel} className="flex-1">
            Annulla
          </ModernButton>
          <ModernButton
            variant="destructive"
            onClick={() => onConfirm(townHall._id)}
            isLoading={deleting.has(townHall._id)}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </ModernButton>
        </div>
      </motion.div>
    </motion.div>
  )

  if (loading) {
    return <ModernLoading />
  }

  return (
    <div className="space-y-8">
      <ModernPageHeader
        title="Elimina Comune"
        description="Rimuovi definitivamente un comune dal sistema"
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
                placeholder="Cerca comune per nome..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Town Halls List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard variant="elevated">
          <GlassCardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Comuni Disponibili
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {filteredTownHalls.length} comuni trovati
                </p>
              </div>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            {filteredTownHalls.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nessun comune trovato</p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchTerm
                    ? "Prova a modificare il termine di ricerca"
                    : "Non ci sono comuni disponibili"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredTownHalls.map((townHall, index) => (
                    <motion.div
                      key={townHall._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-xl hover:bg-slate-800/40 transition-all duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600/50">
                              <Building className="h-6 w-6 text-slate-300" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {townHall.name}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-slate-400">
                                <MapPin className="h-4 w-4" />
                                <span>{townHall.province}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-slate-400">
                              <Lightbulb className="h-4 w-4" />
                              <span>Punti luce: {townHall.light_points}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-400">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Creato:{" "}
                                {new Date(
                                  townHall.created_at
                                ).toLocaleDateString("it-IT")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <ModernButton
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowConfirmDialog(townHall)}
                            isLoading={deleting.has(townHall._id)}
                            disabled={deleting.has(townHall._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
                          </ModernButton>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <ConfirmDialog
            townHall={showConfirmDialog}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirmDialog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default RemoveTownHall
