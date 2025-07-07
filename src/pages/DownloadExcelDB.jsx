import { useState, useEffect } from 'react'
import { townHallService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import Card, { CardBody, CardHeader } from '../components/common/Card'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'
import { FileSpreadsheet, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const DownloadExcelDB = () => {
  const [townHalls, setTownHalls] = useState([])
  const [selectedTownHall, setSelectedTownHall] = useState('')
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
        console.error('Error fetching town halls:', error)
        toast.error('Errore durante il caricamento dei comuni')
        setAlert({
          type: 'error',
          message: 'Impossibile caricare la lista dei comuni'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchTownHalls()
  }, [])

  const handleTownHallChange = (e) => {
    setSelectedTownHall(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedTownHall) {
      toast.error('Seleziona un comune')
      return
    }
    
    try {
      setDownloading(true)
      
      const townHallResponse = await townHallService.getByName(selectedTownHall)
      const response = await townHallService.downloadExcel(townHallResponse.data)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      const date = new Date()
      const dateTime = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
      
      link.setAttribute('download', `${selectedTownHall}_Lighting-Map-DB_${dateTime}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Download completato con successo')
    } catch (error) {
      console.error('Error downloading Excel:', error)
      toast.error('Errore durante il download del file')
      setAlert({
        type: 'error',
        message: 'Impossibile scaricare il file Excel'
      })
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadCSV = async (e) => {
    e.preventDefault()
    if (!selectedTownHall) {
      toast.error('Seleziona un comune')
      return
    }
    try {
      setDownloadingCSV(true)
      const townHallResponse = await townHallService.getByName(selectedTownHall)
      const response = await townHallService.downloadCSV(townHallResponse.data)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const date = new Date()
      const dateTime = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
      link.setAttribute('download', `${selectedTownHall}_Lighting-Map-DB_${dateTime}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Download CSV completato con successo')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      toast.error('Errore durante il download del file CSV')
      setAlert({
        type: 'error',
        message: 'Impossibile scaricare il file CSV'
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
    <div>
      <PageHeader 
        title="Scarica DB comune" 
        description="Esporta i dati di un comune in formato Excel per analisi offline"
      />
      
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          className="mb-6"
        />
      )}
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Esporta dati comune</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Select
                label="Seleziona il comune da scaricare"
                value={selectedTownHall}
                onChange={handleTownHallChange}
                options={getTownHallOptions()}
                disabled={loading || townHalls.length === 0}
              />
              
              <Button
                type="submit"
                isLoading={downloading}
                disabled={loading || !selectedTownHall}
                className="mt-4 w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Download in corso...' : 'Scarica Excel'}
              </Button>
              <Button
                type="button"
                isLoading={downloadingCSV}
                disabled={loading || !selectedTownHall}
                className="mt-2 w-full"
                onClick={handleDownloadCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloadingCSV ? 'Download in corso...' : 'Scarica CSV'}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-900/20 rounded-md border border-blue-900/30">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Informazioni</h3>
              <p className="text-sm text-blue-100">
                Il file Excel conterrà tutti i dati relativi al comune selezionato, inclusi i punti luce e le informazioni correlate. Questo file può essere utilizzato per analisi offline o per l'aggiornamento dei dati.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default DownloadExcelDB
