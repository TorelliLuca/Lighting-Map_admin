import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import Card, { CardBody, CardHeader, CardFooter } from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useUser()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }
    
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <span className="text-2xl font-bold text-white">LM</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Lighting-Map</h1>
          <p className="mt-2 text-blue-300">Accedi al pannello di amministrazione</p>
        </div>
        
        <Card className="backdrop-blur-lg bg-slate-800/50 border border-blue-900/30">
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Login</h2>
          </CardHeader>
          
          <CardBody>
            {error && (
              <Alert type="error" message={error} className="mb-4" />
            )}
            
            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Inserisci la tua email"
                required
              />
              
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci la tua password"
                required
              />
              
              <Button
                type="submit"
                className="w-full mt-4"
                isLoading={loading}
              >
                Accedi
              </Button>
            </form>
          </CardBody>
          
          <CardFooter className="text-center">
            <p className="text-sm text-blue-300">
              Non hai un account? Contatta l'amministratore
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
