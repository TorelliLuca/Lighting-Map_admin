"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = [
    {
      name: "Risorse",
      href: "https://www.torellistudio.com/LIGHTING-MAP/resource.php"
    },
    { name: "Studio Torelli", href: "https://www.torellistudio.com/studio/" },
    {
      name: "FAQ",
      href:
        "https://www.torellistudio.com/studio/ufaq-category/utilizzo-lighting-map/"
    },
    { name: "Contatti", href: "https://www.torellistudio.com/studio/contatti/" }
  ]

  return (
    <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            {links.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={link.href}
                  className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center md:text-right"
          >
            <p className="text-sm text-slate-400">
              &copy; {currentYear} Lighting-Map. Tutti i diritti riservati.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Powered by Studio Torelli
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
