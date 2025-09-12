"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  X,
  User,
  Mail,
  Calendar,
  Shield,
  MapPin,
  CheckCircle,
  XCircle,
  Crown,
  ExternalLink,
  Building2,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { userService, townHallService } from "../services/api"

const UserModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null)
  const [userTownHalls, setUserTownHalls] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [redirectTo, setRedirectTo] = useState("/valida-utente")

  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const [userRes, townHallsRes] = await Promise.all([userService.getById(userId), townHallService.getAll()])

        setUser(userRes.data)
        setRedirectTo(`/valida-utente?search=${userRes.data?.email || ""}`)

        const sortedTownHalls = townHallsRes.data.sort((a, b) => a.name.localeCompare(b.name))
        const assignedTownHalls = sortedTownHalls.filter((townHall) =>
          userRes.data?.town_halls_list?.some((assigned) => assigned === townHall._id),
        )
        setUserTownHalls(assignedTownHalls)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Errore nel caricamento dei dati utente")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [isOpen, userId])

  const getUserTypeLabel = (type) => {
    const labels = {
      DEFAULT_USER: "Utente Standard",
      MAINTAINER: "Manutentore",
      ADMINISTRATOR: "Amministratore",
      SUPER_ADMIN: "Super Admin",
    }
    return labels[type] || type
  }

  const getUserTypeVariant = (type) => {
    switch (type) {
      case "DEFAULT_USER":
        return "info"
      case "MAINTAINER":
        return "success"
      case "ADMINISTRATOR":
        return "warning"
      case "SUPER_ADMIN":
        return "error"
      default:
        return "secondary"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name, surname) => {
    return `${name?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase()
  }

  if (!isOpen) return null

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500/30 border-t-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Caricamento dati utente...</p>
            </div>
          </div>
        ) : user ? (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-200">{getInitials(user.name, user.surname)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">
                      {user.name} {user.surname}
                    </h2>
                    <p className="text-slate-400">Dettagli Profilo Utente</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="p-6 space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-slate-400" />
                        <CardTitle className="text-lg">Tipo Utente</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={getUserTypeVariant(user.user_type)} className="text-sm px-3 py-1">
                        {user.user_type === "SUPER_ADMIN" && <Crown className="w-4 h-4 mr-2" />}
                        {getUserTypeLabel(user.user_type)}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        {user.is_approved ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <CardTitle className="text-lg">Stato Approvazione</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={user.is_approved ? "success" : "error"} className="text-sm px-3 py-1">
                        {user.is_approved ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {user.is_approved ? "Approvato" : "In Attesa"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <CardTitle>Informazioni di Contatto</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Email</p>
                        <p className="text-slate-200 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration Date */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      <CardTitle>Data Registrazione</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                      <Clock className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Registrato il</p>
                        <p className="text-slate-200 font-medium">{formatDate(user.date)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Town Halls */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-slate-400" />
                      <CardTitle>Comuni Assegnati</CardTitle>
                      <Badge variant="secondary">{userTownHalls.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userTownHalls.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {userTownHalls.map((townHall, index) => (
                          <motion.div
                            key={townHall._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            
                          >
                            <Badge variant="info" className="w-full justify-center py-2" >
                              <MapPin className="h-4 w-4 mr-2" />
                              
                              {townHall.name}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">Nessun comune assegnato</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 p-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">

                <Button>
                  <Link to={redirectTo} className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Gestione Utenti
                  </Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <User className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Utente non trovato</p>
              <Button onClick={onClose} className="mt-4">
                Chiudi
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default UserModal
