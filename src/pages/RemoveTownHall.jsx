import { useState, useEffect } from 'react'
import { townHallService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import Card, { CardBody, CardHeader } from '../components/common/Card'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'
import { Trash2, Building, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const RemoveTownHall = () => {
  const [townHalls, setTownHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [deletingTownHall, setDeletingTownHall] = useState(null)

  useEffect(() => {
    const fetchTownHalls = async () => {
      try {
        setLoading(true)
        const response = await townHallService.getAll()
        setTownHalls(response.data)
      } catch (error) {
        console.error('Error fetching town halls:', error)
        toast.error('Errore durante il caricamento dei comuni')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTownHalls()
  }, [])

  const handleDelete = async (townHall) => {
    if (!confirm(`Sei sicuro di voler eliminare il comune "${townHall.name}"? Questa azione è irreversibile.`)) {
      return
    }
    
    setDeletingTownHall(townHall._id)
    setAlert(null)
    
    try {
      const response = await townHallService.delete(townHall.name)
      
      // Update local state
      setTownHalls(townHalls.filter(th => th._id !== townHall._id))
      
      setAlert({
        type: 'success',
        message: response.data || 'Comune eliminato con successo'
      })
      
      toast.success('Comune eliminato con successo')
    } catch (error) {
      console.error('Error deleting town hall:', error)
      setAlert({
        type: 'error',
        message: error.response?.data || 'Errore durante l\'eliminazione del comune'
      })
      
      toast.error('Errore durante l\'eliminazione del comune')
    } finally {
      setDeletingTownHall(null)
      setTimeout(() => setAlert(null), 5000)
    }
  }

  return (
    <div>
      <PageHeader 
        title="Elimina comune" 
        description="Rimuovi completamente un comune dal database"
      />
      
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          className="mb-6"
        />
      )}
      
      <div className="mb-6 p-4 bg-red-900/20 rounded-md border border-red-500/30">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-300 mb-1">Attenzione</h3>
            <p className="text-sm text-red-200">
              L'eliminazione di un comune è un'operazione irreversibile. Tutti i dati associati al comune, inclusi i punti luce, verranno eliminati definitivamente dal database.
            </p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : townHalls.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Building className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Nessun comune trovato</h3>
            <p className="text-blue-300">Non ci sono comuni disponibili nel database</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {townHalls.map(townHall => (
            <Card key={townHall._id} className="transform transition-all duration-300 hover:shadow-blue-900/20 hover:shadow-lg">
              <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Building className="mr-2 h-5 w-5 text-blue-400" />
                  {townHall.name}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="mb-4">
                  <p className="text-sm text-blue-300">Punti luce</p>
                  <p className="text-lg font-medium text-white">{townHall.light_points}</p>
                </div>
                
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => handleDelete(townHall)}
                  isLoading={deletingTownHall === townHall._id}
                  disabled={deletingTownHall !== null}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deletingTownHall === townHall._id ? 'Eliminazione...' : 'Elimina comune'}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default RemoveTownHall
