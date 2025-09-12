"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Activity,
  AlertTriangle,
  Crown,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Zap,
  Info,
  Database
} from "lucide-react"
import { accessLogService } from "../services/api"

import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader
} from "../components/ui/glass-card"
import ModernPageHeader from "../components/ui/modern-page-header"
import {
  Bar,
  BarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from "recharts"
import CountUp from "react-countup"
import UserModal from "../components/UserModal"
import { userService } from "../services/api"
import { useUser } from "../context/UserContext"
import { getReadableUserAgent } from "../utils/formatters"

const AccessLogsDashboard = () => {
  const [monthlyUsers, setMonthlyUsers] = useState(0)
  const [monthlyUsersTrend, setMonthlyUsersTrend] = useState([])
  const [monthlyUsersList, setMonthlyUsersList] = useState([])
  const [topActions, setTopActions] = useState([])
  const [topUser, setTopUser] = useState(null)
  const [topUserLightPoints, setTopUserLightPoints] = useState(null)
  const [myLightPoints, setMyLightPoints] = useState(null)
  const { userData } = useUser()
  const [yearlyTrend, setYearlyTrend] = useState([])
  const [failedRequests, setFailedRequests] = useState(0)
  const [failedRequestsDetails, setFailedRequestsDetails] = useState([])
  const [actionHeatmapRaw, setActionHeatmapRaw] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyUsersAccessCount, setMonthlyUsersAccessCount] = useState(0)
  const [monthlyUsersAccessMap, setMonthlyUsersAccessMap] = useState({})
  const [showAllTownhalls, setShowAllTownhalls] = useState(false)
  const [showFailedRequestsModal, setShowFailedRequestsModal] = useState(false)
  const [selectedFailedAction, setSelectedFailedAction] = useState(null)
  const [selectedFailedDetails, setSelectedFailedDetails] = useState([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [lastLoginData, setLastLoginData] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const monthlyUsersRes = await accessLogService.getMonthlyUsers()
        setMonthlyUsersTrend(monthlyUsersRes.data)

        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()
        const found = monthlyUsersRes.data.find(
          d => d.year === currentYear && d.month === currentMonth
        )
        setMonthlyUsers(
          found
            ? found.userCount
            : monthlyUsersRes.data.length > 0
            ? monthlyUsersRes.data[monthlyUsersRes.data.length - 1].userCount
            : 0
        )

        const sortedUsers =
          found && found.users
            ? [...found.users].sort((a, b) =>
                `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`)
              )
            : []
        setMonthlyUsersList(sortedUsers)

        // FETCH ACCESS COUNT FOR ACTIVE USERS
        if (sortedUsers.length > 0) {
          const ids = sortedUsers.map(u => u._id)
          const accessCountRes = await accessLogService.accessThisMonth({ ids })
          setMonthlyUsersAccessMap(accessCountRes.data)
          
          // FETCH LAST LOGIN DATA
          try {
            const lastLoginRes = await accessLogService.getLastLogin(ids)
            console.log(lastLoginRes.data)
            // Transform array to object with userId as key
            const lastLoginMap = {}
            if (Array.isArray(lastLoginRes.data)) {
              lastLoginRes.data.forEach(item => {
                if (item.userId && item.latestLogin) {
                  lastLoginMap[item.userId] = item.latestLogin
                }
              })
            }
            setLastLoginData(lastLoginMap)
          } catch (error) {
            console.error('Error fetching last login data:', error)
            setLastLoginData({})
          }
        } else {
          setMonthlyUsersAccessMap({})
          setMonthlyUsersAccessCount(0)
          setLastLoginData({})
        }

        const topActionsRes = await accessLogService.getTopActions()
        setTopActions(topActionsRes.data)

        const topUserRes = await accessLogService.getTopUser()
        setTopUser(topUserRes.data)

        const yearlyTrendRes = await accessLogService.getYearlyTrend()
        setYearlyTrend(yearlyTrendRes.data)

        const failedRequestsRes = await accessLogService.getFailedRequests()
        console.log(failedRequestsRes);
        const failedArr = Array.isArray(failedRequestsRes.data)
          ? failedRequestsRes.data
          : []
        setFailedRequests(
          failedArr.reduce((acc, curr) => acc + (curr.count || 0), 0)
        )
        setFailedRequestsDetails(failedArr)

        const actionHeatmapRes = await accessLogService.getActionHeatmap()
        setActionHeatmapRaw(
          Array.isArray(actionHeatmapRes.data) ? actionHeatmapRes.data : []
        )

        if (topUserRes.data && topUserRes.data._id) {
          const lpRes = await userService.getLightPointsCount(
            topUserRes.data._id
          )
          setTopUserLightPoints(lpRes.data)
        }

        if (userData && (userData.id || userData._id)) {
          const lpRes = await userService.getLightPointsCount(
            userData.id || userData._id
          )
          setMyLightPoints(lpRes.data)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userData])

  const actionLabel = code => {
    const labels = {
      ADD_REPORT: "Aggiunta Report",
      ADD_OPERATION: "Operazione Effettuata",
      GET_PROFILE: "Visualizza Profilo",
      LOGIN: "Login",
      USER_MANAGEMENT: "Gestione Utenti",
      TOWN_HALLS: "Gestione Comuni",
      LIGHT_POINTS: "Gestione Punti Luce",
      REPORTS: "Gestione Report",
      OPERATIONS: "Gestione Operazioni",
      EMAIL: "Email",
      MAPS: "Mappe"
    }
    return labels[code] || code
  }

  const formattedMonthlyUsers = monthlyUsersTrend.map(d => ({
    name: `${d.month}/${d.year}`,
    value: d.userCount
  }))

  const formattedTopActions = topActions.map(a => ({
    name: actionLabel(a._id),
    value: a.count
  }))

  const formattedYearlyTrend = yearlyTrend.map(e => ({
    name: `${e.month}/${e.year}`,
    value: e.count
  }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    accent,
    children,
    className = ""
  }) => (
    <motion.div variants={cardVariants}>
      <GlassCard variant="elevated" className={`group ${className}`}>
        <GlassCardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br from-${accent}-500 to-${accent}-600 shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {description && (
                  <p className="text-sm text-slate-400 mt-1">{description}</p>
                )}
              </div>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div
            className={`text-3xl font-bold text-${accent}-400 mb-4 tracking-tight`}
          >
            <CountUp end={value} duration={2.5} separator="." />
          </div>
          {children}
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  )

  const renderHeatmap = () => {
    if (!actionHeatmapRaw.length) {
      return (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nessun dato disponibile</p>
          </div>
        </div>
      )
    }

    const actions = Array.from(new Set(actionHeatmapRaw.map(e => e.action)))
    const hours = Array.from(new Set(actionHeatmapRaw.map(e => e.hour))).sort(
      (a, b) => a - b
    )
    const matrix = hours.map(hour =>
      actions.map(action => {
        const found = actionHeatmapRaw.find(
          e => e.hour === hour && e.action === action
        )
        return found ? found.count : 0
      })
    )
    const max = Math.max(...matrix.flat())

    const getIntensity = val => (max ? val / max : 0)
    const getCellStyle = intensity => {
      if (intensity === 0) return "bg-slate-800/20 text-slate-600"
      if (intensity < 0.25) return "bg-blue-900/30 text-blue-300"
      if (intensity < 0.5) return "bg-blue-800/50 text-blue-200"
      if (intensity < 0.75) return "bg-blue-700/70 text-blue-100"
      return "bg-blue-600/90 text-white"
    }

    return (
      <div className="overflow-auto max-h-96">
        <div className="min-w-full space-y-2">
          <div className="grid grid-cols-[80px_1fr] gap-3 text-xs font-medium text-slate-400 mb-4">
            <div>Ora</div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${actions.length}, minmax(120px, 1fr))`
              }}
            >
              {actions.map(action => (
                <div key={action} className="truncate text-center">
                  {actionLabel(action)}
                </div>
              ))}
            </div>
          </div>
          {hours.map((hour, i) => (
            <div
              key={hour}
              className="grid grid-cols-[80px_1fr] gap-3 items-center"
            >
              <div className="text-sm font-medium text-slate-300 text-center">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${actions.length}, minmax(120px, 1fr))`
                }}
              >
                {actions.map((action, j) => {
                  const val = matrix[i][j]
                  const intensity = getIntensity(val)
                  return (
                    <div
                      key={action}
                      title={`${actionLabel(
                        action
                      )}: ${val} azioni alle ${hour}:00`}
                      className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer border border-slate-700/30 ${getCellStyle(
                        intensity
                      )}`}
                    >
                      {val || ""}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Funzione per mostrare dettagli richieste fallite
  const handleShowFailedDetails = async (actionId) => {
    setIsLoadingDetails(true)
    setSelectedFailedAction(actionId)
    setShowFailedRequestsModal(true)
    try {
      const res = await accessLogService.getFailedRequestsDetails(actionId)
      setSelectedFailedDetails(res.data || [])
    } catch (err) {
      setSelectedFailedDetails([])
    }
    setIsLoadingDetails(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-blue-500/30 border-t-blue-500 mx-auto mb-6"></div>
          <p className="text-slate-400 text-lg">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative">
      {/* Enhanced Background Pattern for darker theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {showModal && (
        <UserModal
          userId={selectedUser}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {showAllTownhalls && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <GlassCard variant="elevated" className="max-w-md w-full p-6 border border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-emerald-300">Tutti i Comuni</h4>
        <button
          className="text-slate-400 hover:text-emerald-400"
          onClick={() => setShowAllTownhalls(false)}
        >
          Chiudi
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
        {myLightPoints.townhalls.sort().map((town, idx) => (
          <span
            key={idx}
            className="text-xs font-medium bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30"
          >
            {town}
          </span>
        ))}
      </div>
    </GlassCard>
  </div>
)}

{showFailedRequestsModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <GlassCard variant="elevated" className="max-w-lg w-full p-6 border border-red-700 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-red-300">
          Dettagli richieste fallite: {actionLabel(selectedFailedAction)}
        </h4>
        <button
          className="text-slate-400 hover:text-red-400"
          onClick={() => setShowFailedRequestsModal(false)}
        >
          Chiudi
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-3">
        {isLoadingDetails ? (
          <div className="text-slate-400 text-sm">Caricamento...</div>
        ) : selectedFailedDetails.length === 0 ? (
          <div className="text-slate-400 text-sm">Nessun dettaglio disponibile</div>
        ) : (
          selectedFailedDetails.map((detail, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-xs text-slate-200">
  <div><span className="font-semibold text-red-400">User:</span> {detail.user ? detail.user?.name + " " + detail.user?.surname : "Anonimo"}</div>
  <div><span className="font-semibold text-red-400">Action:</span> {detail.action}</div>
  <div><span className="font-semibold text-red-400">Resource:</span> {detail.resource}</div>
  <div><span className="font-semibold text-red-400">Timestamp:</span> {new Date(detail.timestamp).toLocaleString()}</div>
  <div><span className="font-semibold text-red-400">IP:</span> {detail.ipAddress}</div>
  <div>
      <span className="font-semibold text-red-400">User Agent:</span>
      <ul className="pl-4"> {/* Aggiunto 'pl-4' per il rientro a sinistra */}
        <li className="font-semibold text-red-300">
          <strong>Browser: </strong>
          <span className="font-normal text-white">{getReadableUserAgent(detail.userAgent).browser}</span> {/* Aggiunto 'text-white' per rendere il valore bianco */}
        </li>
        <li className="font-semibold text-red-300">
          <strong>Sistema Operativo: </strong>
          <span className="font-normal text-white">{getReadableUserAgent(detail.userAgent).os}</span> {/* Aggiunto 'text-white' per rendere il valore bianco */}
        </li>
        <li className="font-semibold text-red-300">
          <strong>Dispositivo: </strong>
          <span className="font-normal text-white">{getReadableUserAgent(detail.userAgent).device}</span> {/* Aggiunto 'text-white' per rendere il valore bianco */}
        </li>
      </ul>
    </div>
    <div><span className="font-semibold text-red-400">Outcome:</span> {detail.outcome}</div>
    <div><span className="font-semibold text-red-400">Details:</span> {detail.details}</div>
  </div>
          ))
        )}
      </div>
    </GlassCard>
  </div>
)}

      <div className="relative z-10 p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-[1600px] mx-auto space-y-8"
        >
          {/* Header */}
          <ModernPageHeader
            title="Dashboard Controllo Accessi"
            description="Monitoraggio avanzato e analisi degli accessi al sistema in tempo reale"

          />

          {/* Full Width Active Users Card */}
          <motion.div variants={cardVariants} className="mb-8">
            <GlassCard variant="elevated" className="group">
              <GlassCardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Utenti Attivi</h3>
                      <p className="text-sm text-slate-400 mt-1">Utenti unici questo mese</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-400 tracking-tight">
                    <CountUp end={monthlyUsers} duration={2.5} separator="." />
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                {monthlyUsersList.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Nome</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Accessi</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Ultimo Accesso</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {monthlyUsersList.map((user, index) => (
                          <motion.tr
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="text-slate-200 font-medium">
                                {user.name} {user.surname}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-blue-300 font-semibold">
                                <CountUp
                                  end={monthlyUsersAccessMap[user._id] || 0}
                                  duration={1.5}
                                  separator="."
                                />
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-slate-300 text-sm">
                                {lastLoginData[user._id] 
                                  ? new Date(lastLoginData[user._id]).toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Mai'
                                }
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedUser(user._id)
                                  setShowModal(true)
                                }}
                                className="text-slate-400 hover:text-blue-400 transition-colors"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </motion.div>

          {/* Three Smaller Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <StatCard
              title="Richieste Fallite"
              value={failedRequests}
              icon={AlertTriangle}
              description="Errori di sistema"
              accent="red"
            >
              {failedRequestsDetails.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {failedRequestsDetails.map(item => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center p-2 rounded-lg bg-red-900/10 border border-red-800/20"
                    >
                      <span className="text-slate-300 text-sm">
                        {actionLabel(item._id)}
                      </span>
                      <span className="text-s font-medium text-red-400 bg-red-900/20 px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                      <button
                        className="ml-2 text-red-400 hover:text-red-600"
                        onClick={() => handleShowFailedDetails(item._id)}
                        title="Dettagli"
                      >
                        <Info size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </StatCard>

            <StatCard
              title="Utente più attivo"
              value={topUser?.count || 0}
              icon={Crown}
              description={
                topUser
                  ? `Accessi effettuati da ${topUser.name} ${topUser.surname}`
                  : "N/A"
              }
              accent="amber"
            >
              {topUserLightPoints && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-900/10 border border-amber-800/20">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <div>
                      <div className="text-xs text-slate-400">Punti Luce</div>
                      <div className="text-sm font-semibold text-amber-300">
                        <CountUp
                          end={topUserLightPoints.totalLightPoints}
                          duration={1.5}
                        />
                      </div>
                    </div>
                  </div>
                  {topUserLightPoints.townhalls &&
                    topUserLightPoints.townhalls.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topUserLightPoints.townhalls
                          .sort()
                          .slice(0, 3)
                          .map((town, index) => (
                            <span
                              key={index}
                              className="text-xs font-medium bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-500/30"
                            >
                              {town}
                            </span>
                          ))}
                        {topUserLightPoints.townhalls.length > 3 && (
                          <span className="text-xs font-medium bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full border border-slate-600/50">
                            +{topUserLightPoints.townhalls.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                </div>
              )}
            </StatCard>

            <StatCard
              title="I Tuoi Punti Luce"
              value={myLightPoints?.totalLightPoints || 0}
              icon={Lightbulb}
              description={
                userData ? `${userData.name} ${userData.surname}` : "N/A"
              }
              accent="emerald"
            >
              {myLightPoints &&
                myLightPoints.townhalls &&
                myLightPoints.townhalls.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {myLightPoints.townhalls
                      .sort()
                      .slice(0, 3)
                      .map((town, index) => (
                        <span
                          key={index}
                          className="text-xs font-medium bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30"
                        >
                          {town}
                        </span>
                      ))}
                    {myLightPoints.townhalls.length > 3 && (
                      <span
                        className="text-xs font-medium bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full border border-slate-600/50 cursor-pointer"
                        onClick={() => setShowAllTownhalls(true)}
                      >
                        +{myLightPoints.townhalls.length - 3}
                      </span>
                    )}
                  </div>
                )}
            </StatCard>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <motion.div variants={cardVariants}>
              <GlassCard variant="elevated">
                <GlassCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Trend Utenti Mensili
                      </h3>
                      <p className="text-sm text-slate-400">
                        Andamento degli accessi nel tempo
                      </p>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={formattedMonthlyUsers}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(51, 65, 85, 0.5)",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                            backdropFilter: "blur(12px)"
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#3b82f6"
                          radius={[6, 6, 0, 0]}
                          opacity={0.8}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>

            <motion.div variants={cardVariants}>
              <GlassCard variant="elevated">
                <GlassCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Andamento Annuale
                      </h3>
                      <p className="text-sm text-slate-400">
                        Trend delle richieste nel tempo
                      </p>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={formattedYearlyTrend}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(51, 65, 85, 0.5)",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                            backdropFilter: "blur(12px)"
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, fill: "#10b981" }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <motion.div variants={cardVariants}>
              <GlassCard variant="elevated">
                <GlassCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Azioni Più Effettuate
                      </h3>
                      <p className="text-sm text-slate-400">
                        Distribuzione delle operazioni
                      </p>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={formattedTopActions}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(51, 65, 85, 0.5)",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                            backdropFilter: "blur(12px)"
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#8b5cf6"
                          radius={[6, 6, 0, 0]}
                          opacity={0.8}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>

            <motion.div variants={cardVariants}>
              <GlassCard variant="elevated">
                <GlassCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Heatmap Attività
                      </h3>
                      <p className="text-sm text-slate-400">
                        Distribuzione oraria delle operazioni
                      </p>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>{renderHeatmap()}</GlassCardContent>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AccessLogsDashboard
