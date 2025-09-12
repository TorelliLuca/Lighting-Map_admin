"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { townHallService } from "../services/api"
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader
} from "../components/ui/glass-card"
import { ModernSelect } from "../components/ui/modern-select"
import { ModernButton } from "../components/ui/modern-button"
import { ModernAlert } from "../components/ui/modern-alert"
import ModernPageHeader from "../components/ui/modern-page-header"
import { FileSpreadsheet, FileText, Database } from "lucide-react"
import toast from "react-hot-toast"

const DownloadExcelDB = () => {
  const [townHalls, setTownHalls] = useState([])
  const [selectedTownHall, setSelectedTownHall] = useState("")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadingCSV, setDownloadingCSV] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const fetchTownHalls = async () => {
      try {
        setLoading(true)
        const response = await townHallService.getAll()
        setTownHalls(response.data)

        if (response.data.length > 0) {
          setSelectedTownHall(response.data[0].name)
        }
      } catch (error) {
        console.error("Error fetching town halls:", error)
        toast.error("Errore durante il caricamento dei comuni")
        setAlert({
          type: "error",
          message: "Impossibile caricare la lista dei comuni"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTownHalls()
  }, [])

  const handleTownHallChange = e => {
    setSelectedTownHall(e.target.value)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!selectedTownHall) {
      toast.error("Seleziona un comune")
      return
    }

    try {
      setDownloading(true)

      const townHallResponse = await townHallService.getByName(selectedTownHall)
      const response = await townHallService.downloadExcel(
        townHallResponse.data
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url

      const date = new Date()
      const dateTime = `${date.getDate()}-${date.getMonth() +
        1}-${date.getFullYear()}`

      link.setAttribute(
        "download",
        `${selectedTownHall}_Lighting-Map-DB_${dateTime}.xlsx`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Download completato con successo")
    } catch (error) {
      console.error("Error downloading Excel:", error)
      toast.error("Errore durante il download del file")
      setAlert({
        type: "error",
        message: "Impossibile scaricare il file Excel"
      })
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadCSV = async e => {
    e.preventDefault()
    if (!selectedTownHall) {
      toast.error("Seleziona un comune")
      return
    }
    try {
      setDownloadingCSV(true)
      const townHallResponse = await townHallService.getByName(selectedTownHall)
      const response = await townHallService.downloadCSV(townHallResponse.data)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      const date = new Date()
      const dateTime = `${date.getDate()}-${date.getMonth() +
        1}-${date.getFullYear()}`
      link.setAttribute(
        "download",
        `${selectedTownHall}_Lighting-Map-DB_${dateTime}.csv`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("Download CSV completato con successo")
    } catch (error) {
      console.error("Error downloading CSV:", error)
      toast.error("Errore durante il download del file CSV")
      setAlert({
        type: "error",
        message: "Impossibile scaricare il file CSV"
      })
    } finally {
      setDownloadingCSV(false)
    }
  }

  const getTownHallOptions = () => {
    return townHalls.map(th => ({
      value: th.name,
      label: th.name
    }))
  }

  return (
    <div className="space-y-8">
      <ModernPageHeader
        title="Scarica Database Comune"
        description="Esporta i dati di un comune in formato Excel o CSV per analisi offline"
      />

      {alert && <ModernAlert type={alert.type} message={alert.message} />}

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard variant="elevated">
            <GlassCardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Esporta Dati Comune
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Seleziona il comune e il formato di esportazione
                  </p>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent className="space-y-6">
              <form onSubmit={handleSubmit}>
                <ModernSelect
                  label="Seleziona il comune da scaricare"
                  value={selectedTownHall}
                  onChange={handleTownHallChange}
                  options={getTownHallOptions()}
                  disabled={loading || townHalls.length === 0}
                  variant="glass"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <ModernButton
                    type="submit"
                    isLoading={downloading}
                    disabled={loading || !selectedTownHall}
                    className="w-full"
                    size="lg"
                    variant="primary"
                  >
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    {downloading ? "Download Excel..." : "Scarica Excel"}
                  </ModernButton>

                  <ModernButton
                    type="button"
                    isLoading={downloadingCSV}
                    disabled={loading || !selectedTownHall}
                    className="w-full"
                    size="xl"
                    variant="secondary"
                    onClick={handleDownloadCSV}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    {downloadingCSV ? "Download CSV..." : "Scarica CSV"}
                  </ModernButton>
                </div>
              </form>

              {/* Info Card */}
              <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border border-blue-500/30 backdrop-blur-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-300 mb-2">
                      Informazioni sui File
                    </h3>
                    <div className="space-y-2 text-sm text-blue-100">
                      <p>
                        <strong>Excel (.xlsx):</strong> Formato completo con
                        formattazione, ideale per analisi approfondite e
                        presentazioni.
                      </p>
                      <p>
                        <strong>CSV (.csv):</strong> Formato semplice
                        compatibile con tutti i software di analisi dati e
                        database.
                      </p>
                      <p className="text-xs text-blue-200 mt-3">
                        I file conterranno tutti i dati relativi al comune
                        selezionato, inclusi punti luce e informazioni
                        correlate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default DownloadExcelDB
