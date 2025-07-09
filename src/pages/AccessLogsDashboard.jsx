import React, { useEffect, useState } from "react"
import Card from "../components/common/Card"
import { accessLogService } from "../services/api"
import { userService } from "../services/api"
import { useUser } from "../context/UserContext"
import { Bar, Line } from "react-chartjs-2"
import "chart.js/auto"
import CountUp from 'react-countup'
import { FaUser, FaLightbulb, FaCity, FaCrown, FaChartBar, FaChartLine, FaExclamationTriangle, FaFireAlt, FaUsers } from 'react-icons/fa'

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
  const [actionHeatmap, setActionHeatmap] = useState({})
  const [actionHeatmapRaw, setActionHeatmapRaw] = useState([])

  useEffect(() => {
    accessLogService.getMonthlyUsers().then(res => {
      // Salva tutti i dati per il trend
      setMonthlyUsersTrend(res.data)
      // Prendi il mese corrente, oppure l’ultimo disponibile
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const found = res.data.find(
        d => d.year === currentYear && d.month === currentMonth
      )
      setMonthlyUsers(found ? found.userCount : (res.data.length > 0 ? res.data[res.data.length - 1].userCount : 0))
      setMonthlyUsersList(found && found.users ? found.users : [])
    })
    accessLogService.getTopActions().then(res => setTopActions(res.data))
    accessLogService.getTopUser().then(res => {
      setTopUser(res.data)
      if (res.data && res.data._id) {
        userService.getLightPointsCount(res.data._id).then(lpRes => setTopUserLightPoints(lpRes.data))
      } else {
        setTopUserLightPoints(null)
      }
    })
    if (userData && (userData.id || userData._id)) {
      userService.getLightPointsCount(userData.id || userData._id).then(lpRes => setMyLightPoints(lpRes.data))
    } else {
      setMyLightPoints(null)
    }
    accessLogService.getYearlyTrend().then(res => setYearlyTrend(res.data))
    accessLogService.getFailedRequests().then(res => {
      // Somma tutti i count
      const arr = Array.isArray(res.data) ? res.data : [];
      setFailedRequests(arr.reduce((acc, curr) => acc + (curr.count || 0), 0))
      setFailedRequestsDetails(arr)
    })
    accessLogService.getActionHeatmap().then(res => {
      setActionHeatmapRaw(Array.isArray(res.data) ? res.data : [])
    })
  }, [])

  // Mappa sigle azioni in label user-friendly
  const actionLabel = (code) => {
    switch (code) {
      case 'ADD_REPORT': return 'Aggiunta report';
      case 'ADD_OPERATION': return 'Operazione effettuata';
      case 'GET_PROFILE': return 'Visualizza profilo';
      case 'LOGIN': return 'Login';
      case 'USER_MANAGEMENT': return 'Gestione utenti';
      case 'TOWN_HALLS': return 'Gestione comuni';
      case 'LIGHT_POINTS': return 'Gestione punti luce';
      case 'REPORTS': return 'Gestione report';
      case 'OPERATIONS': return 'Gestione operazioni';
      case 'EMAIL': return 'Email';
      case 'MAPS': return 'Mappe';
      default: return code;
    }
  }

  // Prepara i dati per i grafici
  const topActionsData = {
    labels: topActions.map(a => actionLabel(a._id)),
    datasets: [
      {
        label: "Numero di azioni",
        data: topActions.map(a => a.count),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  }

  const monthlyUsersData = {
    labels: monthlyUsersTrend.map(d => `${d.month}/${d.year}`),
    datasets: [
      {
        label: "Utenti unici",
        data: monthlyUsersTrend.map(d => d.userCount),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  }

  const yearlyTrendData = {
    labels: yearlyTrend.map(e => `${e.month}/${e.year}`),
    datasets: [
      {
        label: "Richieste",
        data: yearlyTrend.map(e => e.count),
        fill: false,
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.3,
      },
    ],
  }

  // Funzione per calcolare il colore e il contrasto del testo
  const getHeatmapCellStyle = (val, max) => {
    const intensity = max ? val / max : 0;
    const bg = `rgba(59,130,246,${intensity})`;
    // Se l'intensità è almeno 0.15, testo bianco, altrimenti blu scuro chiaro
    let color = '#334155'; // slate-700
    if (intensity >= 0.15) color = '#fff';
    return {
      background: bg,
      color,
      fontWeight: 'bold',
      fontSize: '1rem',
      borderRadius: '0.375rem', // rounded-md
      border: '1px solid #334155', // slate-800
      minWidth: '3.5rem',
      height: '2.5rem',
      padding: '0.5rem 0.25rem',
      transition: 'background 0.2s',
    };
  };

  // Heatmap: tabella azione/ora
  const renderHeatmap = () => {
    if (!actionHeatmapRaw.length) return <div>Nessun dato</div>;
    // Trova tutte le azioni distinte e tutte le ore distinte
    const actions = Array.from(new Set(actionHeatmapRaw.map(e => e.action)));
    const hours = Array.from(new Set(actionHeatmapRaw.map(e => e.hour))).sort((a, b) => a - b);
    // Crea una matrice ora x azione
    const matrix = hours.map(hour =>
      actions.map(action => {
        const found = actionHeatmapRaw.find(e => e.hour === hour && e.action === action);
        return found ? found.count : 0;
      })
    );
    // Trova il massimo per la colorazione
    const max = Math.max(...matrix.flat());
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-center align-middle">
          <thead>
            <tr>
              <th className="bg-blue-900/40 text-blue-200 text-base py-3">Ora</th>
              {actions.map(action => (
                <th key={action} className="bg-blue-900/40 text-blue-200 text-base py-3">{actionLabel(action)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, i) => (
              <tr key={hour}>
                <td className="bg-blue-900/20 text-blue-100 text-base font-semibold py-3">{hour}:00</td>
                {actions.map((action, j) => {
                  const val = matrix[i][j];
                  return (
                    <td
                      key={action}
                      style={getHeatmapCellStyle(val, max)}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-white">Controllo Accessi - Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-cyan-900/70 to-blue-700/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="text-cyan-300 text-2xl drop-shadow" />
            <span className="text-xl font-bold tracking-tight">Utenti unici (mese)</span>
          </div>
          <div className="text-4xl font-bold text-blue-400 flex items-center gap-2">
            <CountUp end={monthlyUsers} duration={1.2} separator="." />
          </div>
          {monthlyUsersList.length > 0 && (
            <ul className="mt-4 text-blue-200 text-sm">
              {monthlyUsersList.map(u => (
                <li key={u._id}>{u.name} {u.surname}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/70 to-cyan-800/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaChartBar className="text-blue-300 text-2xl drop-shadow" />
            <span className="text-xl font-bold tracking-tight">Trend utenti mensili</span>
          </div>
          <Bar data={monthlyUsersData} options={{ plugins: { legend: { labels: { color: '#60a5fa' } } }, scales: { x: { ticks: { color: '#60a5fa' } }, y: { ticks: { color: '#60a5fa' } } } }} />
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/70 to-indigo-800/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaChartBar className="text-indigo-300 text-2xl drop-shadow" />
            <span className="text-xl font-bold tracking-tight">Azioni più effettuate</span>
          </div>
          <Bar data={topActionsData} options={{ plugins: { legend: { labels: { color: '#60a5fa' } } }, scales: { x: { ticks: { color: '#60a5fa' } }, y: { ticks: { color: '#60a5fa' } } } }} />
        </Card>
        <Card className="bg-gradient-to-br from-green-900/70 to-emerald-800/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-green-300 text-2xl drop-shadow" />
            <span className="text-xl font-bold tracking-tight">Andamento annuale richieste</span>
          </div>
          <Line data={yearlyTrendData} options={{ plugins: { legend: { labels: { color: '#34d399' } } }, scales: { x: { ticks: { color: '#34d399' } }, y: { ticks: { color: '#34d399' } } } }} />
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/70 to-blue-700/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaCrown className="text-yellow-400 text-3xl drop-shadow" />
            <span className="text-2xl font-extrabold tracking-tight">Top Utente</span>
          </div>
          <div className="text-lg font-semibold text-blue-200 mb-1 flex items-center gap-2">
            <FaUser className="text-blue-300" />
            {topUser ? `${topUser.name} ${topUser.surname}` : "N/A"}
          </div>
          <div className="text-4xl font-bold text-blue-400 flex items-center gap-2">
            <CountUp end={topUser?.count || 0} duration={1.2} separator="." />
            <span className="text-lg font-medium text-blue-200">accessi</span>
          </div>
          {topUserLightPoints && (
            <div className="mt-4 flex flex-col gap-1 text-base">
              <div className="flex items-center gap-2">
                <FaLightbulb className="text-yellow-300" />
                <span>Punti luce: <span className="font-bold text-yellow-200"><CountUp end={topUserLightPoints.totalLightPoints} duration={1.2} separator="." /></span></span>
              </div>
              {topUserLightPoints.townhalls && topUserLightPoints.townhalls.length > 0 && (
                <div className="flex items-center gap-2">
                  <FaCity className="text-green-300" />
                  <span>Comuni: <span className="font-semibold text-green-200">{topUserLightPoints.townhalls.join(", ")}</span></span>
                </div>
              )}
            </div>
          )}
        </Card>
        <Card className="bg-gradient-to-br from-red-900/70 to-orange-800/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaExclamationTriangle className="text-red-300 text-2xl drop-shadow" />
            <span className="text-xl font-bold tracking-tight">Richieste fallite</span>
          </div>
          <div className="text-4xl font-bold text-red-400 flex items-center gap-2">
            <CountUp end={failedRequests} duration={1.2} separator="." />
          </div>
          {failedRequestsDetails.length > 0 && (
            <ul className="mt-4 text-sm text-red-300">
              {failedRequestsDetails.map(item => (
                <li key={item._id}>{actionLabel(item._id)}: <CountUp end={item.count} duration={1.2} separator="." /></li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="bg-gradient-to-br from-fuchsia-900/70 to-blue-900/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaFireAlt className="text-fuchsia-300 text-2xl drop-shadow" />
            <span className="text-xl font-bold tracking-tight">Heatmap azioni</span>
          </div>
          {actionHeatmapRaw.length > 0 ? renderHeatmap() : <div>Nessun dato</div>}
        </Card>
        <Card className="bg-gradient-to-br from-violet-900/70 to-blue-800/60 border-0 shadow-xl text-white p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-2">
            <FaUser className="text-cyan-300 text-3xl drop-shadow" />
            <span className="text-2xl font-extrabold tracking-tight">I tuoi dati</span>
          </div>
          <div className="text-lg font-semibold text-cyan-200 mb-1 flex items-center gap-2">
            {userData ? `${userData.name} ${userData.surname}` : "N/A"}
          </div>
          {myLightPoints && (
            <div className="mt-4 flex flex-col gap-1 text-base">
              <div className="flex items-center gap-2">
                <FaLightbulb className="text-yellow-300" />
                <span>Punti luce: <span className="font-bold text-yellow-200"><CountUp end={myLightPoints.totalLightPoints} duration={1.2} separator="." /></span></span>
              </div>
              {myLightPoints.townhalls && myLightPoints.townhalls.length > 0 && (
                <div className="flex items-center gap-2">
                  <FaCity className="text-green-300" />
                  <span>Comuni: <span className="font-semibold text-green-200">{myLightPoints.townhalls.join(", ")}</span></span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AccessLogsDashboard 