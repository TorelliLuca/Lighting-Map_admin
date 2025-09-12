"use client"

import { useState, useEffect, useRef } from "react"
import { townHallService } from "../services/api"
import PageHeader from "../components/common/PageHeader"
import Card, { CardBody, CardHeader } from "../components/common/Card"
import Button from "../components/common/Button"
import Alert from "../components/common/Alert"
import Input from "../components/common/Input"
import { Upload, FileUp, AlertCircle, Building, Search, Plus, RefreshCw, MapPin, Info } from "lucide-react"
import toast from "react-hot-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Helper function to convert CSV to JSON
const csvToJson = (csv) => {
  const lines = csv.split("\n")
  const result = []
  const headers = lines[0].split(";").map((header) => header.trim())

  for (let i = 1; i < lines.length - 1; i++) {
    const obj = {}
    const currentline = lines[i].split(";").map((cell) => cell.trim())

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j] && currentline[j].replace(/(^"|"$)/g, "")
    }
    result.push(obj)
  }
  return result
}

// Add state for coordinates
const UpdateTownhall = () => {
  // Common state
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [activeTab, setActiveTab] = useState("update")

  // Existing townhalls state
  const [townHalls, setTownHalls] = useState([])
  const [filteredTownHalls, setFilteredTownHalls] = useState([])
  const [townHallSearch, setTownHallSearch] = useState("")
  const [selectedTownHall, setSelectedTownHall] = useState(null)
  const [showTownHallDropdown, setShowTownHallDropdown] = useState(false)

  // File upload state
  const [updateFile, setUpdateFile] = useState(null)
  const [newFile, setNewFile] = useState(null)
  const [isDraggingUpdate, setIsDraggingUpdate] = useState(false)
  const [isDraggingNew, setIsDraggingNew] = useState(false)

  // Form state for new townhall
  const [newTownHallName, setNewTownHallName] = useState("")
  const [newTownHallProvince, setNewTownHallProvince] = useState("")
  const [newTownHallRegion, setNewTownHallRegion] = useState("")
  const [newTownHallIstatCode, setNewTownHallIstatCode] = useState("")

  // Autocomplete state for townhall suggestions
  const [townhallSuggestions, setTownhallSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [selectedBordersId, setSelectedBordersId] = useState(null)

  // Map and coordinates state
  const [coordinates, setCoordinates] = useState({ lat: 41.9028, lng: 12.4964 }) // Default to Rome, Italy
  const [mapInitialized, setMapInitialized] = useState(false)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Operation state
  const [updating, setUpdating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [searchingLocation, setSearchingLocation] = useState(false)

  // Initialize Leaflet map
  useEffect(() => {
    if (activeTab === "create" && !mapInitialized) {
      // Load Leaflet CSS
      const linkElement = document.createElement("link")
      linkElement.rel = "stylesheet"
      linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      linkElement.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      linkElement.crossOrigin = ""
      document.head.appendChild(linkElement)

      // Load Leaflet JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      script.crossOrigin = ""
      script.onload = initializeMap
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(linkElement)
        document.head.removeChild(script)
      }
    }
  }, [activeTab])

  const initializeMap = () => {
    if (!mapRef.current || mapInitialized) return

    // Initialize the map
    const L = window.L
    const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 5)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add a marker
    const marker = L.marker([coordinates.lat, coordinates.lng], {
      draggable: true,
    }).addTo(map)

    // Update coordinates when marker is dragged
    marker.on("dragend", (event) => {
      const position = marker.getLatLng()
      setCoordinates({
        lat: position.lat.toFixed(6),
        lng: position.lng.toFixed(6),
      })
    })

    // Handle map click to move marker
    map.on("click", (e) => {
      marker.setLatLng(e.latlng)
      setCoordinates({
        lat: e.latlng.lat.toFixed(6),
        lng: e.latlng.lng.toFixed(6),
      })
    })

    mapInstanceRef.current = map
    markerRef.current = marker
    setMapInitialized(true)
  }

  // Fetch townhall suggestions when name changes
  useEffect(() => {
    if (newTownHallName.length >= 2) {
      const fetchSuggestions = async () => {
        setLoadingSuggestions(true)
        try {
          const response = await townHallService.getSuggestions(newTownHallName)
          setTownhallSuggestions(response.data || [])
          setShowSuggestions(true)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setTownhallSuggestions([])
        } finally {
          setLoadingSuggestions(false)
        }
      }

      // Debounce the search
      const timer = setTimeout(() => {
        fetchSuggestions()
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setTownhallSuggestions([])
      setShowSuggestions(false)
    }
  }, [newTownHallName])

  // Fetch townhalls on component mount
  useEffect(() => {
    const fetchTownHalls = async () => {
      try {
        setLoading(true)
        const response = await townHallService.getAll()
        setTownHalls(response.data)
        setFilteredTownHalls(response.data)
      } catch (error) {
        console.error("Error fetching town halls:", error)
        toast.error("Errore durante il caricamento dei comuni")
        setAlert({
          type: "error",
          message: "Impossibile caricare la lista dei comuni",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTownHalls()
  }, [])

  // Filter townhalls based on search
  useEffect(() => {
    if (townHallSearch.trim() === "") {
      setFilteredTownHalls(townHalls)
    } else {
      const filtered = townHalls.filter((townHall) =>
        townHall.name.toLowerCase().includes(townHallSearch.toLowerCase()),
      )
      setFilteredTownHalls(filtered)
    }
  }, [townHallSearch, townHalls])

  // Handle townhall selection
  const handleTownHallSelect = (townHall) => {
    setSelectedTownHall(townHall)
    setTownHallSearch(townHall.name)
    setShowTownHallDropdown(false)
  }

  // Handle suggestion selection and fetch geo info
  const handleSuggestionSelect = async (suggestion) => {
    try {
      setLoadingSuggestions(true)
      setShowSuggestions(false)
      
      // Set the selected townhall name
      setNewTownHallName(suggestion.properties.comune)
      
      // Store the borders ID for form submission
      setSelectedBordersId(suggestion._id)
      
      // Fetch detailed geo info
      const geoResponse = await townHallService.getGeoInfo(suggestion._id)
      const geoData = geoResponse.data
      
      // Populate form fields with geo data
      setNewTownHallProvince(geoData.provincia || "")
      setNewTownHallRegion(geoData.regione || "")
      
      // Update coordinates
      const newCoords = {
        lat: geoData.latitudine,
        lng: geoData.longitudine
      }
      setCoordinates(newCoords)
      
      // Update map and marker if initialized
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([newCoords.lat, newCoords.lng])
        mapInstanceRef.current.setView([newCoords.lat, newCoords.lng], 12)
      }
      
      toast.success(`Dati caricati per ${geoData.comune}`)
    } catch (error) {
      console.error("Error fetching geo info:", error)
      toast.error("Errore durante il caricamento dei dati geografici")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // File handlers for updating existing townhall
  const handleUpdateFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && (selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".CSV"))) {
      setUpdateFile(selectedFile)
    } else {
      toast.error("Seleziona un file CSV valido")
    }
  }

  const handleUpdateDragOver = (e) => {
    e.preventDefault()
    setIsDraggingUpdate(true)
  }

  const handleUpdateDragLeave = () => {
    setIsDraggingUpdate(false)
  }

  const handleUpdateDrop = (e) => {
    e.preventDefault()
    setIsDraggingUpdate(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".CSV"))) {
      setUpdateFile(droppedFile)
    } else {
      toast.error("Seleziona un file CSV valido")
    }
  }

  // File handlers for new townhall
  const handleNewFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && (selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".CSV"))) {
      setNewFile(selectedFile)
    } else {
      toast.error("Seleziona un file CSV valido")
    }
  }

  const handleNewDragOver = (e) => {
    e.preventDefault()
    setIsDraggingNew(true)
  }

  const handleNewDragLeave = () => {
    setIsDraggingNew(false)
  }

  const handleNewDrop = (e) => {
    e.preventDefault()
    setIsDraggingNew(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".CSV"))) {
      setNewFile(droppedFile)
    } else {
      toast.error("Seleziona un file CSV valido")
    }
  }

  // Handle update of existing townhall
  const handleUpdateTownHall = async () => {
    if (!selectedTownHall) {
      toast.error("Seleziona un comune da aggiornare")
      return
    }

    if (!updateFile) {
      toast.error("Seleziona un file CSV per l'aggiornamento")
      return
    }

    setUpdating(true)
    setAlert(null)

    try {
      // Read file content
      const fileContent = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsText(updateFile)
      })

      // Convert CSV to JSON
      const jsonData = csvToJson(fileContent)
      const userData = JSON.parse(localStorage.getItem("userData"))

      const userEmail = userData.email
      // Prepare data for API
      const data = {
        name: selectedTownHall.name,
        userEmail: userEmail,
        light_points: jsonData,
      }


      // Update townhall
      const response = await townHallService.update(data)

      // Update local state
      const updatedTownHalls = townHalls.map((th) =>
        th._id === selectedTownHall._id ? { ...th, light_points: jsonData.length } : th,
      )
      setTownHalls(updatedTownHalls)
      setFilteredTownHalls(updatedTownHalls)

      setAlert({
        type: "success",
        message: response.data || "Comune aggiornato con successo",
      })

      toast.success("Comune aggiornato con successo")

      // Reset form
      setUpdateFile(null)
      setSelectedTownHall(null)
      setTownHallSearch("")
    } catch (error) {
      console.error("Error updating town hall:", error)
      setAlert({
        type: "error",
        message: error.response?.data || "Errore durante l'aggiornamento del comune",
      })
      toast.error("Errore durante l'aggiornamento del comune")
    } finally {
      setUpdating(false)
    }
  }

  // Update the handleCreateTownHall function to include coordinates
  const handleCreateTownHall = async () => {
    if (!newTownHallName.trim()) {
      toast.error("Inserisci il nome del comune")
      return
    }

    if (!newFile) {
      toast.error("Seleziona un file CSV per il nuovo comune")
      return
    }

    setCreating(true)
    setAlert(null)

    try {
      // Read file content
      const fileContent = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsText(newFile)
      })

      // Convert CSV to JSON
      const jsonData = csvToJson(fileContent)
      const userData = JSON.parse(localStorage.getItem("userData"))

      const userEmail = userData.email

      // Prepare data for API
      const data = {
        name: newTownHallName.trim(),
        province: newTownHallProvince.trim(),
        region: newTownHallRegion.trim(),
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        borders: selectedBordersId, // Add borders ID from selected suggestion
        light_points: jsonData,
        userEmail: userEmail,
      }

      // Create new townhall
      const response = await townHallService.create(data)

      // Update local state with new townhall
      const newTownHall = {
        _id: response.data._id ,
        name: newTownHallName.trim(),
        province: newTownHallProvince.trim(),
        region: newTownHallRegion.trim(),
        coordinates: coordinates,
        light_points: jsonData.length,
      }

      setTownHalls([...townHalls, newTownHall])
      setFilteredTownHalls([...townHalls, newTownHall])

      setAlert({
        type: "success",
        message: "Nuovo comune creato con successo",
      })

      toast.success("Nuovo comune creato con successo")

      // Reset form
      setNewFile(null)
      setNewTownHallName("")
      setNewTownHallProvince("")
      setNewTownHallRegion("")
      setNewTownHallIstatCode("")
      setSelectedBordersId(null) // Reset borders ID
      setCoordinates({ lat: 41.9028, lng: 12.4964 }) // Reset to Rome

      // Reset map view
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([41.9028, 12.4964])
        mapInstanceRef.current.setView([41.9028, 12.4964], 5)
      }
    } catch (error) {
      console.error("Error creating town hall:", error)
      setAlert({
        type: "error",
        message: error.response?.data || "Errore durante la creazione del comune",
      })
      toast.error("Errore durante la creazione del comune")
    } finally {
      setCreating(false)
    }
  }

  // Add the map component to the Create New Townhall tab
  return (
    <div>
      <PageHeader title="Gestione Comuni" description="Aggiorna comuni esistenti o aggiungi nuovi comuni" />

      {alert && <Alert type={alert.type} message={alert.message} className="mb-6" />}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Building className="mr-2 h-5 w-5 text-blue-400" />
            Gestione Comuni
          </h2>
        </CardHeader>
        <CardBody>
          <Tabs defaultValue="update" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-800 p-1 mb-6">
              <TabsTrigger value="update" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <RefreshCw className="mr-2 h-4 w-4" />
                Aggiorna Comune Esistente
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Nuovo Comune
              </TabsTrigger>
            </TabsList>

            {/* Update Existing Townhall Tab - No changes needed here */}
            <TabsContent value="update" className="space-y-6">
              {/* Existing code for updating townhalls */}
              <div className="mb-6 p-4 bg-blue-900/20 rounded-md border border-blue-900/30">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-300 mb-1">Aggiornamento Comune</h3>
                    <p className="text-sm text-blue-100">
                      Seleziona un comune esistente e carica un file CSV per aggiornare i suoi dati. Il file CSV deve
                      mantenere gli stessi ID dei punti luce per garantire la corretta georeferenziazione.
                    </p>
                  </div>
                </div>
              </div>

              {/* Townhall Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-300">Seleziona comune da aggiornare</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    value={townHallSearch}
                    onChange={(e) => {
                      setTownHallSearch(e.target.value)
                      setShowTownHallDropdown(true)
                    }}
                    onFocus={() => setShowTownHallDropdown(true)}
                    placeholder="Cerca comune..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showTownHallDropdown && filteredTownHalls.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-blue-900/30 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredTownHalls.map((townHall) => (
                        <div
                          key={townHall._id}
                          className="px-4 py-2 hover:bg-blue-800/30 cursor-pointer text-white"
                          onClick={() => handleTownHallSelect(townHall)}
                        >
                          <div className="font-medium">{townHall.name}</div>
                          <div className="text-sm text-blue-300">
                            {townHall.province && `${townHall.province}, `}
                            {townHall.region || ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Townhall Info */}
              {selectedTownHall && (
                <div className="p-4 bg-slate-700/30 rounded-md border border-blue-900/30">
                  <h3 className="text-lg font-medium text-white mb-2">{selectedTownHall.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Punti luce:</span> {selectedTownHall.light_points || 0}
                    </div>
                    {selectedTownHall.province && (
                      <div>
                        <span className="text-blue-300">Provincia:</span> {selectedTownHall.province}
                      </div>
                    )}
                    {selectedTownHall.region && (
                      <div>
                        <span className="text-blue-300">Regione:</span> {selectedTownHall.region}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload for Update */}
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors
                  ${isDraggingUpdate ? "border-blue-500 bg-blue-900/20" : "border-slate-600 hover:border-blue-500 hover:bg-slate-800/50"}
                `}
                onDragOver={handleUpdateDragOver}
                onDragLeave={handleUpdateDragLeave}
                onDrop={handleUpdateDrop}
              >
                <FileUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {updateFile ? updateFile.name : "Trascina qui il file CSV per l'aggiornamento"}
                </h3>
                <p className="text-blue-300 mb-4">
                  {updateFile
                    ? `File selezionato (${(updateFile.size / 1024).toFixed(2)} KB)`
                    : "oppure clicca per selezionare un file"}
                </p>

                <input
                  type="file"
                  id="update-file-input"
                  accept=".csv"
                  onChange={handleUpdateFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="update-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Seleziona file
                </label>
              </div>

              <Button
                onClick={handleUpdateTownHall}
                isLoading={updating}
                disabled={!selectedTownHall || !updateFile || updating}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {updating ? "Aggiornamento in corso..." : "Aggiorna comune"}
              </Button>
            </TabsContent>

            {/* Create New Townhall Tab - Add map component */}
            <TabsContent value="create" className="space-y-6">
              <div className="mb-6 p-4 bg-blue-900/20 rounded-md border border-blue-900/30">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-300 mb-1">Nuovo Comune</h3>
                    <p className="text-sm text-blue-100">
                      Inserisci i dati del nuovo comune e carica un file CSV contenente i punti luce. Assicurati che il
                      nome del comune non sia già presente nel sistema. Puoi cercare il comune sulla mappa o selezionare
                      manualmente la posizione.
                    </p>
                  </div>
                </div>
              </div>

              {/* New Townhall Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Custom autocomplete input for townhall name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-300">Nome Comune *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newTownHallName}
                      onChange={(e) => {
                        setNewTownHallName(e.target.value)
                        if (e.target.value.length < 2) {
                          setShowSuggestions(false)
                        }
                      }}
                      onFocus={() => {
                        if (townhallSuggestions.length > 0) {
                          setShowSuggestions(true)
                        }
                      }}
                      onBlur={(e) => {
                        // Only hide if not clicking on suggestions dropdown
                        if (!e.relatedTarget || !e.relatedTarget.closest('.suggestions-dropdown')) {
                          setTimeout(() => setShowSuggestions(false), 150)
                        }
                      }}
                      placeholder="Inserisci il nome del comune"
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {loadingSuggestions && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                      </div>
                    )}
                    
                    {/* Suggestions dropdown */}
                    {showSuggestions && townhallSuggestions.length > 0 && (
                      <div className="suggestions-dropdown absolute z-10 mt-1 w-full bg-slate-800 border border-blue-900/30 rounded-md shadow-lg max-h-60 overflow-auto">
                        {townhallSuggestions.map((suggestion) => (
                          <div
                            key={suggestion._id}
                            className="px-4 py-2 hover:bg-blue-800/30 cursor-pointer text-white border-b border-slate-700/50 last:border-b-0"
                            onMouseDown={(e) => {
                              e.preventDefault() // Prevent input blur
                              handleSuggestionSelect(suggestion)
                            }}
                          >
                            <div className="font-medium">{suggestion.properties.comune}</div>
                            <div className="text-sm text-blue-300">
                              Codice: {suggestion.properties.pro_com}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <Input
                  label="Provincia"
                  type="text"
                  value={newTownHallProvince}
                  onChange={(e) => setNewTownHallProvince(e.target.value)}
                  placeholder="Inserisci la provincia"
                />
                <Input
                  label="Regione"
                  type="text"
                  value={newTownHallRegion}
                  onChange={(e) => setNewTownHallRegion(e.target.value)}
                  placeholder="Inserisci la regione"
                />
              </div>

              {/* Map Component */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-300">
                  <MapPin className="inline-block mr-1 h-4 w-4" />
                  Posizione Geografica
                </label>
                <div className="p-4 bg-slate-700/30 rounded-md border border-blue-900/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <p className="text-sm text-blue-100 mb-2">
                        Digita il nome del comune per cercarlo sulla mappa, o clicca sulla mappa per selezionare
                        manualmente la posizione.
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-blue-300">Coordinate:</div>
                      <div className="text-white">
                        Lat: {coordinates.lat}, Lng: {coordinates.lng}
                      </div>
                    </div>
                  </div>

                  {/* Map container */}
                  <div
                    ref={mapRef}
                    className="h-[400px] w-full rounded-md border border-blue-900/50"
                    style={{ background: "#242938" }}
                  >
                    {!mapInitialized && (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload for New Townhall */}
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors
                  ${isDraggingNew ? "border-blue-500 bg-blue-900/20" : "border-slate-600 hover:border-blue-500 hover:bg-slate-800/50"}
                `}
                onDragOver={handleNewDragOver}
                onDragLeave={handleNewDragLeave}
                onDrop={handleNewDrop}
              >
                <FileUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {newFile ? newFile.name : "Trascina qui il file CSV per il nuovo comune"}
                </h3>
                <p className="text-blue-300 mb-4">
                  {newFile
                    ? `File selezionato (${(newFile.size / 1024).toFixed(2)} KB)`
                    : "oppure clicca per selezionare un file"}
                </p>

                <input
                  type="file"
                  id="new-file-input"
                  accept=".csv"
                  onChange={handleNewFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="new-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Seleziona file
                </label>
              </div>

              <Button
                onClick={handleCreateTownHall}
                isLoading={creating}
                disabled={!newTownHallName || !newFile || creating}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {creating ? "Creazione in corso..." : "Crea nuovo comune"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  )
}

export default UpdateTownhall

