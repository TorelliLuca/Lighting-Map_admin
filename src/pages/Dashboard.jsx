"use client"

import { useState, useEffect } from "react"
import { townHallService, userService } from "../services/api"
import PageHeader from "../components/common/PageHeader"
import Card, { CardBody, CardHeader } from "../components/common/Card"
import { Users, Database, FileSpreadsheet, UserCheck, Building, MapPin, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import LoadingScreen from "../components/common/LoadingScreen"

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    townHalls: 0,
    pendingUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const { userData } = useUser()

  const isAdmin = userData?.user_type === "ADMINISTRATOR" || userData?.user_type === "SUPER_ADMIN"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersResponse, townHallsResponse] = await Promise.all([userService.getAll(), townHallService.getAll()])

        const pendingUsers = usersResponse.data.filter((user) => !user.is_approved).length

        setStats({
          users: usersResponse.data.length,
          townHalls: townHallsResponse.data.length,
          pendingUsers,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Benvenuto nel pannello di amministrazione di Lighting-Map" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-900/40 to-slate-800/40">
          <CardBody className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500/20 mr-4">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Utenti Totali</p>
              <p className="text-2xl font-bold text-white">{stats.users}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-800/40">
          <CardBody className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-500/20 mr-4">
              <Building className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-300">Comuni</p>
              <p className="text-2xl font-bold text-white">{stats.townHalls}</p>
            </div>
          </CardBody>
        </Card>

        {isAdmin && (
          <Card className="bg-gradient-to-br from-purple-900/40 to-slate-800/40">
            <CardBody className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500/20 mr-4">
                <UserCheck className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-300">Utenti in Attesa</p>
                <p className="text-2xl font-bold text-white">{stats.pendingUsers}</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/aggiungi-comune-utente">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-400" />
                Aggiungi comune all'utente
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-blue-100">
                Assegna comuni agli utenti per consentire loro di visualizzare e gestire i dati.
              </p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/comuni">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                Visualizza Comuni
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-blue-100">Visualizza tutti i comuni e le loro associazioni con gli utenti.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/gestione-comuni">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-blue-400" />
                Gestione Comuni
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-blue-100">Aggiorna comuni esistenti o aggiungi nuovi comuni con georeferenziazione.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/scarica-report-in-excel">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2 text-blue-400" />
                Scarica DB comune
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-blue-100">Esporta i dati di un comune in formato Excel per analisi offline.</p>
            </CardBody>
          </Card>
        </Link>

        {isAdmin && (
          <>
            <Link to="/valida-utente">
              <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-blue-400" />
                    Gestisci utenti
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-blue-100">Valida, modifica o elimina gli account utente.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to="/rimuovi-comune">
              <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-400" />
                    Elimina comune
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-blue-100">Rimuovi completamente un comune dal database.</p>
                </CardBody>
              </Card>
            </Link>
          </>
        )}

        <Link to="/rimuovi-comune-da-utente">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20 hover:shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                Rimuovi comune da utente
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-blue-100">Revoca l'accesso di un utente a un comune specifico.</p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

