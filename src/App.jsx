import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useUser } from './context/UserContext'
import MainLayout from './layouts/MainLayout'
import LoadingScreen from './components/common/LoadingScreen'

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AddUserPage = lazy(() => import('./pages/AddUserPage'))
const DownloadExcelDB = lazy(() => import('./pages/DownloadExcelDB'))
const UploadInCSVFormat = lazy(() => import('./pages/UploadInCSVFormat'))
const ValidateUser = lazy(() => import('./pages/ValidateUser'))
const ModifyUsers = lazy(() => import('./pages/ModifyUsers'))
const RemoveTownHallFromUser = lazy(() => import('./pages/RemoveTownHallFromUser'))
const RemoveTownHall = lazy(() => import('./pages/RemoveTownHall'))
const TownHallsPage = lazy(() => import("./pages/TownHallsPage"))
const UpdateTownhall = lazy(() => import("./pages/UpdateTownhall.jsx"))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const { userData, loading } = useUser()
  const location = useLocation()
  
  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={!userData ? <Login /> : <Navigate to="/" />} />
        
        <Route element={userData ? <MainLayout /> : <Navigate to="/login" state={{ from: location }} replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/aggiungi-comune-utente" element={<AddUserPage />} />
          <Route path="/scarica-report-in-excel" element={<DownloadExcelDB />} />
          <Route path="/carica-comune-in-CSV-format" element={<UploadInCSVFormat />} />
          <Route path="/valida-utente" element={<ValidateUser />} />
          <Route path="/valida-utente/modifica-utente/:email" element={<ModifyUsers />} />
          <Route path="/rimuovi-comune-da-utente" element={<RemoveTownHallFromUser />} />
          <Route path="/rimuovi-comune" element={<RemoveTownHall />} />
          <Route path="/comuni" element={userData ? <TownHallsPage /> : <Navigate to="/login" />} />
          <Route path="/gestione-comuni" element={userData ? <UpdateTownhall /> : <Navigate to="/login" />} />

        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App