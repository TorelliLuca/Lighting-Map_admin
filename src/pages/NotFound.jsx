import { Link } from 'react-router-dom'
import Button from '../components/common/Button'
import { Home, AlertTriangle } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-900/30 mb-6">
          <AlertTriangle className="h-12 w-12 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Pagina non trovata</h2>
        <p className="text-blue-300 max-w-md mx-auto">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
      </div>
      
      <Link to="/">
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Torna alla dashboard
        </Button>
      </Link>
    </div>
  )
}

export default NotFound
