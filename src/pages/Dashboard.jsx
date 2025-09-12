"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { townHallService, userService, accessLogService } from "../services/api"
import {
  Users,
  Database,
  FileSpreadsheet,
  UserCheck,
  Building,
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity
} from "lucide-react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader
} from "../components/ui/glass-card"

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    townHalls: 0,
    pendingUsers: 0,
    totalLightPoints: 0,
    newUsers: 0,
    newTownHalls: 0,
    newLightPoints: 0
  })
  const [loading, setLoading] = useState(true)
  const { userData } = useUser()

  const isAdmin =
    userData?.user_type === "ADMINISTRATOR" ||
    userData?.user_type === "SUPER_ADMIN"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersResponse, townHallsResponse] = await Promise.all([
          userService.getAll(),
          townHallService.getAll()
        ])

        const pendingUsers = usersResponse.data.filter(
          user => !user.is_approved
        ).length
        const totalLightPoints = townHallsResponse.data.reduce(
          (sum, th) => sum + (th.light_points || 0),
          0
        )
        const newUsers = await accessLogService.getPercentageNewUsers()
        const newTownHalls = await accessLogService.getNewTownHalls()
        const newLightPoints = await accessLogService.getNewLightPoints()

        setStats({
          users: usersResponse.data.length,
          townHalls: townHallsResponse.data.length,
          pendingUsers,
          totalLightPoints,
          newUsers: newUsers.data,
          newTownHalls: newTownHalls.data,
          newLightPoints: newLightPoints.data
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Funzione per ottenere l'icona e il colore del trend
  const getTrendIndicator = (value) => {
    if (value > 0) {
      return {
        icon: TrendingUp,
        color: "text-emerald-400",
        prefix: "+"
      }
    } else if (value < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-400",
        prefix: "-"
      }
    } else {
      return {
        icon: Minus,
        color: "text-yellow-400",
        prefix: ""
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    description,
    trend,
    trendValue, 
    href
  }) => {
    const trendIndicator = getTrendIndicator(trendValue)
    const TrendIcon = trendIndicator.icon

    return (
      <motion.div variants={itemVariants}>
      <Link to={href}>
        <GlassCard variant="interactive" className="group">
          <GlassCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    {trend && (
                      <div className={`flex items-center space-x-1 text-xs ${trendIndicator.color}`}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{trendIndicator.prefix}{trend}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white">
                    {loading ? (
                      <div className="h-8 w-16 bg-slate-700/50 rounded animate-pulse" />
                    ) : (
                      value.toLocaleString()
                    )}
                  </p>
                  {description && (
                    <p className="text-sm text-slate-400">{description}</p>
                  )}
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
        </Link>
      </motion.div>
    )
  }

  const ActionCard = ({
    title,
    description,
    icon: Icon,
    href,
    color,
    badge
  }) => (
    <motion.div variants={itemVariants}>
      <Link to={href}>
        <GlassCard variant="interactive" className="h-full group">
          <GlassCardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {title}
                  </h3>
                  {badge && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="pt-0">
            <p className="text-slate-300 leading-relaxed">{description}</p>
          </GlassCardContent>
        </GlassCard>
      </Link>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 p-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Benvenuto nel pannello di amministrazione di Lighting-Map
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Utenti Totali"
                value={stats.users}
                icon={Users}
                color="from-blue-500 to-blue-600"
                description="Utenti registrati"
                trend={`${Math.abs(stats.newUsers.percentageChange)}% questo mese`}
                trendValue={stats.newUsers.percentageChange}
                href={"/valida-utente"}
              />
              <StatCard
                title="Comuni Attivi"
                value={stats.townHalls}
                icon={Building}
                color="from-emerald-500 to-emerald-600"
                description="Comuni nel sistema"
                trend={`${Math.abs(stats.newTownHalls)} nuovi questo mese`}
                trendValue={stats.newTownHalls}
                href={"/comuni"}
              />
              <StatCard
                title="Punti Luce"
                value={stats.totalLightPoints}
                icon={Activity}
                color="from-amber-500 to-amber-600"
                description="Totale punti luce"
                trend={`${Math.abs(stats.newLightPoints)} nuovi questo mese`}
                trendValue={stats.newLightPoints}
              />
              <StatCard
                title="In Attesa"
                value={stats.pendingUsers}
                icon={UserCheck}
                color="from-purple-500 to-purple-600"
                description="Utenti da validare"
                href={"/valida-utente"}
              />
          
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Azioni Rapide
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                  title="Aggiungi Comune"
                  description="Assegna comuni agli utenti per consentire loro di visualizzare e gestire i dati."
                  icon={Building}
                  href="/aggiungi-comune-utente"
                  color="from-blue-500 to-blue-600"
                />

                <ActionCard
                  title="Visualizza Comuni"
                  description="Visualizza tutti i comuni e le loro associazioni con gli utenti."
                  icon={MapPin}
                  href="/comuni"
                  color="from-emerald-500 to-emerald-600"
                />

                <ActionCard
                  title="Gestione Comuni"
                  description="Aggiorna comuni esistenti o aggiungi nuovi comuni con georeferenziazione."
                  icon={RefreshCw}
                  href="/gestione-comuni"
                  color="from-amber-500 to-amber-600"
                />

                <ActionCard
                  title="Scarica Database"
                  description="Esporta i dati di un comune in formato Excel per analisi offline."
                  icon={FileSpreadsheet}
                  href="/scarica-report-in-excel"
                  color="from-purple-500 to-purple-600"
                />

                {isAdmin && (
                  <>
                    <ActionCard
                      title="Gestisci Utenti"
                      description="Valida, modifica o elimina gli account utente."
                      icon={UserCheck}
                      href="/valida-utente"
                      color="from-red-500 to-red-600"
                      badge={`${stats.pendingUsers} in attesa`}
                    />

                    <ActionCard
                      title="Elimina Comune"
                      description="Rimuovi completamente un comune dal database."
                      icon={Database}
                      href="/rimuovi-comune"
                      color="from-slate-600 to-slate-700"
                    />
                  </>
                )}

                <ActionCard
                  title="Rimuovi Associazione"
                  description="Revoca l'accesso di un utente a un comune specifico."
                  icon={Users}
                  href="/rimuovi-comune-da-utente"
                  color="from-orange-500 to-orange-600"
                />
                <ActionCard
                  title="Controllo Accessi"
                  description="Visualizza i log di accesso e le statistiche di utilizzo."
                  icon={Users}
                  href="/controllo-accessi"
                  color="from-black-500 to-black-600"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard