import { useState, useEffect } from 'react'
import { townHallService } from '../services/api'
import PageHeader from '../components/common/PageHeader'
import Card, { CardBody, CardHeader } from '../components/common/Card'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'
import { Upload, FileUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const csvToJson = (csv) => {
  const lines = csv.split("\n")
  const result = []
  const headers = lines[0].split(";").map(header => header.trim())

  for (let i = 1; i < lines.length - 1; i++) {
    const obj = {}
    const currentline = lines[i].split(";").map(cell => cell.trim())

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j] && currentline[j].replace(/(^"|"$)/g, '')
    }
    result.push(obj)
  }
  return result
}

const UploadInCSVFormat = () => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [alert, setAlert] = useState(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
    } else {
      toast.error('Seleziona un file CSV valido')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
    } else {
      toast.error('Seleziona un file CSV valido')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Seleziona un file CSV')
      return
    }
    
    setUploading(true)
    setAlert(null)
    
    try {
      // Read file content
      const fileContent = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsText(file)
      })
      
      // Convert CSV to JSON
      const jsonData = csvToJson(fileContent)
      
      // Extract town hall name from filename
      const nameWithoutExtension = file.name.split(/[_\.]/)[0]
      
      // Prepare data for API
      const data = {
        name: nameWithoutExtension,
        light_points: jsonData
      }
      console.log(data)
      // Try to create new town hall
      try {
        const response = await townHallService.create(data)
        setAlert({
          type: 'success',
          message: response.data || 'Comune caricato con successo'
        })
        toast.success('Comune caricato con successo')
      } catch (error) {
        // If creation fails, try to update
        if (error.response?.status === 400) {
          setAlert({
            type: 'warning',
            message: 'Il comune esiste già. Tentativo di aggiornamento in corso...'
          })
          
          try {
            console.log(data)
            const updateResponse = await townHallService.update(data)
            setAlert({
              type: 'success',
              message: updateResponse.data || 'Comune aggiornato con successo'
            })
            toast.success('Comune aggiornato con successo')
          } catch (updateError) {
            throw updateError
          }
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setAlert({
        type: 'error',
        message: error.response?.data || 'Errore durante il caricamento del file'
      })
      toast.error('Errore durante il caricamento del file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <PageHeader 
        title="Carica comune in formato CSV" 
        description="Importa o aggiorna i dati di un comune da un file CSV"
      />
      
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          className="mb-6"
        />
      )}
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Upload className="mr-2 h-5 w-5 text-blue-400" />
            Carica file CSV
          </h2>
        </CardHeader>
        <CardBody>
          <div className="mb-6 p-4 bg-blue-900/20 rounded-md border border-blue-900/30">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-300 mb-1">Nota importante</h3>
                <p className="text-sm text-blue-100">
                  Prima di aggiornare un comune, scarica il database esistente per mantenere gli ID dei punti luce. 
                  In caso contrario, i punti luce potrebbero non essere georeferenziati correttamente.
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className={`
              border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {file ? file.name : 'Trascina qui il tuo file CSV'}
            </h3>
            <p className="text-blue-300 mb-4">
              {file 
                ? `File selezionato (${(file.size / 1024).toFixed(2)} KB)` 
                : 'oppure clicca per selezionare un file'}
            </p>
            
            <input
              type="file"
              id="file-input"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors"
            >
              <Upload className="mr-2 h-4 w-4" />
              Seleziona file
            </label>
          </div>
          
          <Button
            onClick={handleUpload}
            isLoading={uploading}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Caricamento in corso...' : 'Carica file'}
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}

export default UploadInCSVFormat
