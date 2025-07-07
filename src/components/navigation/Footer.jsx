import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-md border-t border-blue-900/30 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2 space-x-6">
            <Link to="https://www.torellistudio.com/LIGHTING-MAP/resource.php" className="text-blue-400 hover:text-blue-300">
              Risorse
            </Link>
            <Link to="https://www.torellistudio.com/studio/" className="text-blue-400 hover:text-blue-300">
              Studio Torelli
            </Link>
            <Link to="https://www.torellistudio.com/studio/ufaq-category/utilizzo-lighting-map/" className="text-blue-400 hover:text-blue-300">
              FAQ
            </Link>
            <Link to="https://www.torellistudio.com/studio/contatti/" className="text-blue-400 hover:text-blue-300">
              Contatti
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-blue-300">
              &copy; {new Date().getFullYear()} Lighting-map. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
