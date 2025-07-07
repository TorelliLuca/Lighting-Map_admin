const Card = ({ children, className = '' }) => {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-md border border-blue-900/30 rounded-lg shadow-lg overflow-hidden ${className}`}>
        {children}
      </div>
    )
  }
  
  export const CardHeader = ({ children, className = '' }) => {
    return (
      <div className={`px-6 py-4 border-b border-blue-900/30 ${className}`}>
        {children}
      </div>
    )
  }
  
  export const CardBody = ({ children, className = '' }) => {
    return (
      <div className={`px-6 py-4 ${className}`}>
        {children}
      </div>
    )
  }
  
  export const CardFooter = ({ children, className = '' }) => {
    return (
      <div className={`px-6 py-4 border-t border-blue-900/30 ${className}`}>
        {children}
      </div>
    )
  }
  
  export default Card
  