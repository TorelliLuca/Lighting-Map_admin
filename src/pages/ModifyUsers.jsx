import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import Card, { CardBody, CardHeader, CardFooter } from '../components/common/Card'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'
import { User, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const ModifyUsers = () => {
  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState('')
  const [userSurname, setUserSurname] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userType, setUserType] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)
  const { email } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await userService.getByEmail(email)
        const userData = response.data
        
        setUser(userData)
        setUserName(userData.name)
        setUserSurname(userData.surname)
        setUserType(userData.user_type)
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Errore durante il caricamento dei dati utente')
        navigate('/valida-utente')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setAlert(null)
    
    try {
      const formData = {
        email,
        name: userName,
        surname: userSurname,
        user_type: userType,
        password: userPassword || null
      }
      
      const response = await userService.updateUser(formData)
      
      setAlert({
        type: 'success',
        message: response.data || 'Utente aggiornato con successo'
      })
      
      toast.success('Utente aggiornato con successo')
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/valida-utente')
      }, 1500)
    } catch (error) {
      console.error('Error updating user:', error)
      setAlert({
        type: 'error',
        message: error.response?.data || 'Errore durante l\'aggiornamento dell\'utente'
      })
      
      toast.error('Errore durante l\'aggiornamento dell\'utente')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader 
        title="Modifica Utente" 
        description={`Modifica i dati dell'utente ${user?.name} ${user?.surname}`}
      />
      
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          className="mb-6"
        />
      )}
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Informazioni utente</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 p-4 bg-blue-900/20 rounded-md border border-blue-900/30">
                <p className="text-blue-300 text-sm font-medium">{email}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                
                <Input
                  label="Cognome"
                  type="text"
                  value={userSurname}
                  onChange={(e) => setUserSurname(e.target.value)}
                  required
                />
              </div>
              
              <Input
                label="Password"
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Lascia vuoto per non modificare la password"
              />
              <p className="mt-1 text-xs text-blue-300">
                Se il campo viene lasciato vuoto, la password non verrà modificata
              </p>
              
              <Select
                label="Tipo utente"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                options={[
                  { value: 'DEFAULT_USER', label: 'Utente visualizzatore' },
                  { value: 'MAINTAINER', label: 'Manutentore' },
                  { value: 'ADMINISTRATOR', label: 'Amministratore' },
                  { value: 'SUPER_ADMIN', label: 'Super Admin' }
                ]}
                className="mt-4"
              />
              
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/valida-utente')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna indietro
                </Button>
                
                <Button
                  type="submit"
                  isLoading={submitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? 'Salvataggio...' : 'Salva modifiche'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ModifyUsers
