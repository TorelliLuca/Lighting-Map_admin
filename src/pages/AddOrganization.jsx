"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { GlassCard, GlassCardContent, GlassCardHeader } from "../components/ui/glass-card"
import { ModernButton } from "../components/ui/modern-button"
import { ModernInput } from "../components/ui/modern-input"
import { ModernSelect } from "../components/ui/modern-select"
import { ModernAlert } from "../components/ui/modern-alert"
import ModernPageHeader from "../components/ui/modern-page-header"
import { Building2, MapPin, Upload, FileText, Globe, Calendar, DollarSign, FileSignature } from "lucide-react"
import toast from "react-hot-toast"
import { organizationService, townHallService } from "../services/api"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { formatTitleCase } from "../utils/formatters"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Label } from "../components/ui/label"


const AddOrganization = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    logo: "",
    location: {
      lat: "",
      lng: "",
    },
    address: {
      street: "",
      city: "",
      province: "",
      state: "",
      postal_code: "",
    },
    townhall_id: null,
    contract: {
      start_date: "",
      end_date: "",
      details: "",
      price: "",
      townhall_associated: null,
    },
  })

  const [errors, setErrors] = useState({})
  const [hasMaintenanceContract, setHasMaintenanceContract] = useState("no")

  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [townhalls, setTownhalls] = useState([])

  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const apiKey = import.meta.env.VITE_MAPTILER_API

  useEffect(() => {
    const fetchTownhalls = async () => {
      try {
        const response = await townHallService.getAll()
        setTownhalls(response.data)
      } catch (error) {
        toast.error("Errore nel caricamento dei comuni.")
        console.error("Failed to fetch townhalls:", error)
      }
    }
    fetchTownhalls()
  }, [])

  const organizationTypes = [
    { value: "", label: "Seleziona tipo organizzazione" },
    { value: "TOWNHALL", label: "Comune" },
    { value: "ENTERPRISE", label: "Azienda" },
  ]

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${apiKey}&language=it`)
      if (!response.ok) throw new Error("API Geocoding request failed")
      const data = await response.json()
      const feature = data.features[0]

      if (feature) {
        const context = feature.context || []
        const properties = feature.properties || {};
        const postal_code = properties.postcode || context.find((ctx) => ctx.id.startsWith("postcode"))?.text || "";
        const city = context.find((ctx) => ctx.id.startsWith("place"))?.text || context.find((ctx) => ctx.id.startsWith("locality"))?.text || "";
        const state = context.find((ctx) => ctx.id.startsWith("region"))?.text || "";
        const regionContext = context.find((ctx) => ctx.id.startsWith("region"));
        const provinceShortCode = regionContext?.short_code?.replace('IT-', '');
        const province = context.find((ctx) => ctx.id.startsWith("district"))?.text || provinceShortCode || "";
        const address = feature.place_name.split(",")[0] || "";

        setFormData((prev) => ({
          ...prev,
          location: { lat: lat.toFixed(6), lng: lng.toFixed(6) },
          address: {
            street: address,
            city,
            province,
            state,
            postal_code,
          },
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
      toast.error("Impossibile recuperare l'indirizzo.")
    }
  }

  const updateLocationFromMap = (lat, lng) => {
    // Aggiorna prima la location
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, lat: lat.toFixed(6), lng: lng.toFixed(6) },
    }));

    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new maplibregl.Marker({ color: "#3b82f6", draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.current.on("dragend", () => {
        const { lng, lat } = marker.current.getLngLat();
        updateLocationFromMap(lat, lng);
      });
    }

    // Avvia il reverse geocoding per ottenere l'indirizzo
    reverseGeocode(lat, lng);
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    if (apiKey === "YOUR_MAPTILER_API_KEY") console.warn("MapTiler API key is not configured.")

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
      center: [7.544, 44.389],
      zoom: 12,
    })

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat
      updateLocationFromMap(lat, lng)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [apiKey])

  const validateField = useCallback((name, value, currentFormData) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Il nome è obbligatorio."
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) return "Il nome non può contenere caratteri speciali."
        return ""
      case 'type':
        if (!value) return "Il tipo di organizzazione è obbligatorio."
        return ""
      case 'end_date':
        if (currentFormData.contract.start_date && value && new Date(value) < new Date(currentFormData.contract.start_date)) {
          return "La data di fine non può precedere la data di inizio."
        }
        return ""
      case 'start_date':
        if (currentFormData.contract.end_date && value && new Date(currentFormData.contract.end_date) < new Date(value)) {
          setErrors(prev => ({ ...prev, end_date: "La data di fine non può precedere la data di inizio." }))
        }
        return ""
      default:
        return ""
    }
  }, [])

  const handleInputChange = (field, value) => {
    let processedValue = value

    if (field === "name") {
      processedValue = formatTitleCase(value)
    }

    setFormData(prev => {
      const newFormData = { ...prev };
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        newFormData[parent] = { ...newFormData[parent], [child]: processedValue };
      } else {
        newFormData[field] = processedValue;
      }
      if (field === "type") {
        setHasMaintenanceContract("no");
      }
      return newFormData;
    });

    const errorMessage = validateField(field.split('.').pop(), processedValue, formData);
    setErrors(prevErrors => ({
      ...prevErrors,
      [field.split('.').pop()]: errorMessage
    }));
  }

  const handleRadioChange = (value) => {
    setHasMaintenanceContract(value);
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Il file deve essere inferiore a 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Seleziona un file immagine valido")
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setFormData((prev) => ({ ...prev, logo: e.target.result }))
    reader.readAsDataURL(file)
  }

  const validateFormOnSubmit = () => {
    const nameError = validateField('name', formData.name, formData);
    const typeError = validateField('type', formData.type, formData);

    const newErrors = { name: nameError, type: typeError };

    if (formData.type === 'ENTERPRISE' && hasMaintenanceContract === "yes") {
      if (!formData.contract.start_date) newErrors.start_date = "La data di inizio è obbligatoria.";
      if (!formData.contract.end_date) newErrors.end_date = "La data di fine è obbligatoria.";
      if (!formData.contract.townhall_associated) newErrors.townhall_associated = "Il comune associato è obbligatorio.";
    }
    if (formData.type === 'TOWNHALL') {
      if (!formData.townhall_id) newErrors.townhall_id = "La selezione del comune è obbligatoria.";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every(error => !error);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateFormOnSubmit()) {
      toast.error("Controlla i campi del form, ci sono degli errori.")
      return
    }

    setLoading(true)
    setAlert(null)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        logo: formData.logo,
        location: { type: formData.location.type, coordinates: [formData.location.lng, formData.location.lat] },
        address: formData.address,

      }

      if (formData.type === "TOWNHALL") {
        payload.townhall_id = formData.townhall_id
      } else if (formData.type === "ENTERPRISE" && hasMaintenanceContract === "yes") {
        payload.contract = formData.contract
      }
      console.log(payload);

      console.log("Submitting Payload:", payload)
      const result = await organizationService.create(payload)
      toast.success("Organizzazione creata con successo!")

      setFormData({
        name: "",
        description: "",
        type: "",
        logo: "",
        location: {
          lat: "",
          lng: "",
        },
        address: {
          street: "",
          city: "",
          province: "",
          state: "",
          postal_code: "",
        },
        townhall_id: null,
        contract: { start_date: "", end_date: "", details: "", price: "", townhall_associated: null },
      })
      setHasMaintenanceContract("no")
      setLogoFile(null)
      marker.current?.remove()
      marker.current = null
    } catch (error) {
      console.error("Error creating organization:", error)
      toast.error(error.message || "Errore durante la creazione dell'organizzazione")
    } finally {
      setLoading(false)
    }
  }

  const townhallOptions = [
    { value: null, label: "Seleziona un comune..." },
    ...(townhalls.map((th) => ({ value: th._id, label: th.name })) || []),
  ]

  return (
    <div className="space-y-8">
      <ModernPageHeader title="Aggiungi Organizzazione" description="Crea una nuova organizzazione nel sistema" />

      {alert && <ModernAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassCard variant="elevated">
            <GlassCardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Nuova Organizzazione</h2>
                  <p className="text-sm text-slate-400 mt-1">Compila i campi per creare l'organizzazione</p>
                </div>
              </div>
            </GlassCardHeader>

            <GlassCardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" /> Informazioni Base
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ModernInput label="Nome Organizzazione *" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Inserisci il nome" variant="glass" icon={<Building2 className="h-4 w-4" />} disabled={loading} />
                      {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
                    </div>
                    <div>
                      <ModernSelect label="Tipo Organizzazione *" value={formData.type} onValueChange={(value) => handleInputChange("type", value)} options={organizationTypes} variant="glass" disabled={loading} />
                      {errors.type && <p className="text-red-400 text-xs mt-1 ml-1">{errors.type}</p>}
                    </div>
                  </div>
                  <ModernInput label="Descrizione" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Descrizione dell'organizzazione (opzionale)" variant="glass" icon={<FileText className="h-4 w-4" />} disabled={loading} />
                </div>

                {/* Conditional Fields for TOWNHALL */}
                {formData.type === "TOWNHALL" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-blue-400" /> Associa Comune
                    </h3>
                    <ModernSelect label="Seleziona Comune *" value={formData.townhall_id} onValueChange={(value) => handleInputChange("townhall_id", value)} options={townhallOptions} variant="glass" disabled={loading} />
                  </motion.div>
                )}
                ---
                {/* NEW: Conditional Radio Button for ENTERPRISE */}
                {formData.type === "ENTERPRISE" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <FileSignature className="h-5 w-5 mr-2 text-blue-400" /> Contratto di Manutenzione
                    </h3>
                    <RadioGroup
                      onValueChange={handleRadioChange}
                      value={hasMaintenanceContract}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="contract-yes" />
                        <Label htmlFor="contract-yes">Sì</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="contract-no" />
                        <Label htmlFor="contract-no">No</Label>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}
                ---
                {/* Conditional Contract Fields */}
                {formData.type === "ENTERPRISE" && hasMaintenanceContract === "yes" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ModernInput label="Data Inizio *" value={formData.contract.start_date} onChange={(e) => handleInputChange("contract.start_date", e.target.value)} type="date" variant="glass" icon={<Calendar className="h-4 w-4" />} disabled={loading} />
                        {errors.start_date && <p className="text-red-400 text-xs mt-1 ml-1">{errors.start_date}</p>}
                      </div>
                      <div>
                        <ModernInput label="Data Fine *" value={formData.contract.end_date} onChange={(e) => handleInputChange("contract.end_date", e.target.value)} type="date" variant="glass" icon={<Calendar className="h-4 w-4" />} disabled={loading} />
                        {errors.end_date && <p className="text-red-400 text-xs mt-1 ml-1">{errors.end_date}</p>}
                      </div>
                    </div>
                    <ModernInput label="Dettagli Contratto" value={formData.contract.details} onChange={(e) => handleInputChange("contract.details", e.target.value)} placeholder="Dettagli, termini, o note..." variant="glass" icon={<FileText className="h-4 w-4" />} disabled={loading} />
                    <ModernInput label="Prezzo (€)" value={formData.contract.price} onChange={(e) => handleInputChange("contract.price", e.target.value)} placeholder="es. 1500.00" type="number" step="0.01" variant="glass" icon={<DollarSign className="h-4 w-4" />} disabled={loading} />
                    <ModernSelect label="Comune Associato *" value={formData.contract.townhall_associated} onValueChange={(value) => handleInputChange("contract.townhall_associated", value)} options={townhallOptions} variant="glass" disabled={loading} placeholder="Cerca e seleziona un comune..." />
                  </motion.div>
                )}
                ---
                {/* Logo Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-blue-400" /> Logo Organizzazione
                  </h3>
                  <div className="flex items-center space-x-4">
                    {formData.logo && <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50"><img src={formData.logo} alt="Logo preview" className="w-full h-full object-cover" /></div>}
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" disabled={loading} />
                      <label htmlFor="logo-upload" className="inline-flex items-center px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all duration-200 cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {logoFile ? logoFile.name : "Carica Logo"}
                      </label>
                      <p className="text-xs text-slate-400 mt-1">Formati supportati: JPG, PNG, GIF. Max 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-400" /> Informazioni Località
                  </h3>
                  <div ref={mapContainer} className="h-64 w-full rounded-xl border border-slate-700/50" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput label="Latitudine" value={formData.location.lat} onChange={(e) => handleInputChange("location.lat", e.target.value)} placeholder="Seleziona sulla mappa" variant="glass" disabled />
                    <ModernInput label="Longitudine" value={formData.location.lng} onChange={(e) => handleInputChange("location.lng", e.target.value)} placeholder="Seleziona sulla mappa" variant="glass" disabled />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput label="Indirizzo" value={formData.address.street} onChange={(e) => handleInputChange("address.street", e.target.value)} placeholder="Via, numero civico" variant="glass" icon={<MapPin className="h-4 w-4" />} disabled={loading} />
                    <ModernInput label="Città" value={formData.address.city} onChange={(e) => handleInputChange("address.city", e.target.value)} placeholder="Nome della città" variant="glass" icon={<Globe className="h-4 w-4" />} disabled={loading} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModernInput label="Provincia" value={formData.address.province} onChange={(e) => handleInputChange("address.province", e.target.value)} placeholder="Provincia" variant="glass" disabled={loading} />
                    <ModernInput label="Stato/Regione" value={formData.address.state} onChange={(e) => handleInputChange("address.state", e.target.value)} placeholder="Stato o regione" variant="glass" disabled={loading} />
                    <ModernInput label="Codice Postale" value={formData.address.postal_code} onChange={(e) => handleInputChange("address.postal_code", e.target.value)} placeholder="CAP" variant="glass" disabled={loading} />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-slate-700/50">
                  <ModernButton type="submit" isLoading={loading} disabled={loading} className="w-full" size="lg" variant="primary">
                    <Building2 className="mr-2 h-5 w-5" />
                    {loading ? "Creazione in corso..." : "Crea Organizzazione"}
                  </ModernButton>
                </div>
              </form>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default AddOrganization