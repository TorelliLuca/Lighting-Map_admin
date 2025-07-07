import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'

const Alert = ({ type = 'success', message, className = '' }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  }

  const styles = {
    success: 'bg-green-900/30 border-green-500 text-green-300',
    error: 'bg-red-900/30 border-red-500 text-red-300',
    warning: 'bg-yellow-900/30 border-yellow-500 text-yellow-300',
    info: 'bg-blue-900/30 border-blue-500 text-blue-300'
  }

  return (
    <div className={`flex items-center p-4 mb-4 border-l-4 rounded-r-md backdrop-blur-sm ${styles[type]} ${className}`}>
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="text-sm font-medium">
        {message}
      </div>
    </div>
  )
}

export default Alert
