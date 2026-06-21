"use client"

import { useState } from "react"
import {
  Search,
  Users,
  X,
  MapPin,
  FileText,
  Layers,
  ArrowRight,
  Fingerprint,
  CheckCircle2,
  Navigation,
  Home,
  Map
} from "lucide-react"

import { Elector } from "../types"

interface PadronViewProps {
  electores: Elector[]
  loading: boolean
  search: string
  onSearchChange: (value: string) => void
  page: number
  onPageChange: (newPage: number | ((prev: number) => number)) => void
  totalPages: number
  totalRecords: number
  selectedElector: Elector | null
  onSelectElector: (elector: Elector | null) => void
  onActualizarElector: (data: {
    electorId: string
    calle: string
    barrio: string
    lat: string
    lng: string
  }) => Promise<void>
}

const BARRIOS_SANTIAGO = ["Boca de urna","Challua", "Calle bs as y 8 de abril", "Norte", "Sauce", "Lourdes y Belgrano", "Casanova", "Sur", "Pueblo nuevo", "Centro"]

export function PadronView({
  electores,
  loading,
  search,
  onSearchChange,
  page,
  onPageChange,
  totalPages,
  totalRecords,
  selectedElector,
  onSelectElector,
  onActualizarElector, 
}: PadronViewProps) {
  
  const [calle, setCalle] = useState<string>("")
  const [barrio, setBarrio] = useState<string>("")
  const [lat, setLat] = useState<string>("")
  const [lng, setLng] = useState<string>("")
  
  const [isCapturing, setIsCapturing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const handleSelectElector = (elector: Elector | null) => {
    onSelectElector(elector)
    if (elector) {
      const electorExt = elector as any;
      
      // 1. Extraemos la calle priorizando datos extendidos o el domicilio base del padrón
      setCalle(electorExt.calle || electorExt.domicilio || "")
      setBarrio(electorExt.barrio || "")

      // 2. Extracción ultra-segura adaptada a tu modelo de Mongoose [lng, lat]
      let encontradaLat = ""
      let encontradaLng = ""

      if (electorExt.geolocalizacion?.coordinates && Array.isArray(electorExt.geolocalizacion.coordinates) && electorExt.geolocalizacion.coordinates.length === 2) {
        // Estructura oficial GeoJSON: [longitud, latitud]
        encontradaLng = String(electorExt.geolocalizacion.coordinates[0])
        encontradaLat = String(electorExt.geolocalizacion.coordinates[1])
      } else if (electorExt.geolocalizacion?.lat && electorExt.geolocalizacion?.lng) {
        encontradaLat = String(electorExt.geolocalizacion.lat)
        encontradaLng = String(electorExt.geolocalizacion.lng)
      } else if (electorExt.lat && electorExt.lng) {
        encontradaLat = String(electorExt.lat)
        encontradaLng = String(electorExt.lng)
      } else if (electorExt.location?.coordinates && Array.isArray(electorExt.location.coordinates)) {
        encontradaLng = String(electorExt.location.coordinates[0])
        encontradaLat = String(electorExt.location.coordinates[1])
      }

      // 3. Forzamos la actualización inmediata del estado local para renderizar el botón de Maps
      setLat(encontradaLat)
      setLng(encontradaLng)
    } else {
      setCalle("")
      setBarrio("")
      setLat("")
      setLng("")
    }
  }

  const capturarGPS = () => {
    if (!navigator.geolocation) return
    setIsCapturing(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude))
        setLng(String(pos.coords.longitude))
        setIsCapturing(false)
      },
      () => {
        alert("Por favor activa los permisos de GPS en tu dispositivo.")
        setIsCapturing(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const ejecutarGuardado = async () => {
    if (!selectedElector || !calle || !barrio || !lat || !lng) return
    setIsSaving(true)

    // OBJETO DE DEPURACIÓN: Inspección en consola antes de enviar al backend
    const datosEnviar = {
      electorId: selectedElector._id,
      calle,
      barrio,
      lat,
      lng
    }
    console.log("%c🚀 [DEBUG FRONTEND] Datos listos para enviar al Server/Server Action:", "background: #10b981; color: #fff; font-weight: bold; padding: 4px;", datosEnviar);

    try {
      await onActualizarElector(datosEnviar)
      handleSelectElector(null)
    } catch (e) {
      console.error("❌ [DEBUG FRONTEND] Error al ejecutar onActualizarElector:", e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="font-sans min-h-screen bg-background text-foreground antialiased space-y-6 max-w-[1400px] mx-auto p-2 sm:p-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Fingerprint className="w-4 h-4" />
            <span>Sistema Unificado Territorial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Padrón de Relevamiento
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg font-sans">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="text-[10px] uppercase text-muted-foreground font-bold">Total Padrón</p>
            <p className="text-base font-bold font-mono">{totalRecords.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative w-full border border-border rounded-lg bg-card">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar elector por apellido, nombre, mesa o DNI..."
          className="w-full h-12 pl-12 pr-4 bg-transparent text-sm focus:outline-none"
          value={search}
          onChange={(e) => { onSearchChange(e.target.value); onPageChange(1); }}
        />
      </div>

      {/* LISTADO */}
      <div className="space-y-3">
        {loading ? (
          <div className="h-24 bg-card border border-border rounded-lg animate-pulse" />
        ) : (
          electores.map((elector) => (
            <div
              key={elector._id}
              onClick={() => handleSelectElector(elector)}
              className={`border rounded-lg p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all cursor-pointer group ${
                elector.visitado 
                  ? "bg-emerald-500/10 border-emerald-500 hover:border-emerald-600 shadow-sm" 
                  : "bg-card border-border hover:border-primary/40"
              }`}
            >
              {/* IZQUIERDA */}
              <div className="flex items-center gap-4 min-w-0">
                {elector.visitado ? (
                  <div className="w-10 h-10 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-secondary font-mono font-bold text-xs text-primary w-10 h-10 rounded border border-border/40 shrink-0">
                    <span className="text-[8px] font-sans text-muted-foreground uppercase">Ord</span>
                    {elector.nOrden}
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <h2 className="font-bold text-base text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                    {elector.apellidoNombre}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">{elector.documento.tipo}</span>
                    <span>{elector.documento.nro.toLocaleString("es-AR")}</span>
                    {elector.visitado && (
                      <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-sans font-bold px-2 py-0.5 rounded-full ml-2 uppercase text-[10px]">
                        Visitado {elector.barrio && `• Presencia en ${elector.barrio}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* DERECHA */}
              <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/40 font-sans">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[9px] uppercase text-muted-foreground font-bold">Mesa</p>
                    <p className="text-xs font-bold font-mono">N° {elector.mesa}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 max-w-[200px]">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase text-muted-foreground font-bold">Circuito</p>
                    <p className="text-xs font-semibold uppercase truncate">{elector.circuito}</p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <p>Página <span className="font-mono font-bold text-foreground">{page}</span> de <span className="font-mono font-bold text-foreground">{totalPages}</span></p>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 border border-border rounded bg-card disabled:opacity-40 font-bold">Anterior</button>
            <button onClick={() => onPageChange(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-3 border border-border rounded bg-card disabled:opacity-40 font-bold">Siguiente</button>
          </div>
        </div>
      )}

      {/* DRAWER INTERACTIVO */}
      {selectedElector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="absolute inset-0" onClick={() => handleSelectElector(null)} />
          <div className="bg-card w-full max-w-md h-full relative z-10 flex flex-col border-l border-border shadow-2xl animate-in slide-in-from-right duration-200">
            
            <div className="p-6 border-b border-border bg-secondary/10">
              <button onClick={() => handleSelectElector(null)} className="absolute right-4 top-4 w-8 h-8 rounded border border-border bg-card flex items-center justify-center"><X className="w-4 h-4" /></button>
              <span className="text-[10px] font-mono font-bold text-primary tracking-widest block mb-1">
                MESA {selectedElector.mesa} • ORDEN {selectedElector.nOrden}
                {selectedElector.visitado && <span className="text-emerald-500 ml-2">• RE-EDICIÓN</span>}
              </span>
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{selectedElector.apellidoNombre}</h3>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              
              {/* DOMICILIO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1"><Home className="w-3.5 h-3.5 text-muted-foreground" /> Calle / Domicilio de la casa visitada</label>
                <input
                  type="text"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Ej: Av. Belgrano (N) 450"
                  className="w-full h-10 px-3 border border-border rounded bg-card font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* TELEMETRÍA */}
              <div className="bg-secondary/20 p-4 rounded border border-border/60 space-y-3">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-primary">Telemetría del Relevamiento</h4>
                
                <div className="space-y-3">
                  {/* BOTÓN GOOGLE MAPS DIRECTO (Si existen coordenadas en DB) */}
                  {lat && lng ? (
                    <div className="space-y-2">
                      <a
                        href={`http://maps.google.com/?q=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 text-xs font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider"
                      >
                        <Map className="w-4 h-4" />
                        Ver en Google Maps
                      </a>
                      
                      <p className="text-[10px] text-muted-foreground font-mono text-center py-1 bg-card/40 rounded border border-border/40">
                        Ubicación en Base de Datos: {lat.slice(0, 9)}, {lng.slice(0, 9)} ✓
                      </p>

                      {/* Botón secundario para corregir/recapturar */}
                      <button
                        type="button"
                        onClick={capturarGPS}
                        disabled={isCapturing}
                        className="w-full h-9 text-[11px] font-bold rounded border border-dashed border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Navigation className={`w-3 h-3 ${isCapturing ? "animate-spin" : ""}`} />
                        {isCapturing ? "Sincronizando..." : "Corregir / Recapturar GPS Actual"}
                      </button>
                    </div>
                  ) : (
                    /* Si NO existen coordenadas, obligamos a capturar por primera vez */
                    <button
                      type="button"
                      onClick={capturarGPS}
                      disabled={isCapturing}
                      className="w-full h-11 text-xs font-bold rounded bg-primary text-primary-foreground flex items-center justify-center gap-2 transition-all shadow-sm uppercase tracking-wider"
                    >
                      <Navigation className={`w-4 h-4 ${isCapturing ? "animate-spin" : ""}`} />
                      {isCapturing ? "Sincronizando satélites..." : "Capturar geolocalización"}
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Asignación de Barrio</label>
                  <select
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    className="w-full h-10 px-2 rounded border border-border bg-card text-xs font-sans focus:outline-none"
                  >
                    <option value="" disabled>Seleccionar barrio de Santiago...</option>
                    {BARRIOS_SANTIAGO.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* GUARDADO FINAL */}
              <button
                onClick={ejecutarGuardado}
                disabled={!lat || !barrio || !calle || isSaving}
                className="w-full h-11 bg-foreground text-background dark:bg-primary dark:text-primary-foreground font-bold text-xs rounded hover:opacity-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
              >
                {isSaving 
                  ? "Escribiendo en base de datos..." 
                  : selectedElector.visitado 
                    ? "Actualizar datos de visita" 
                    : "Guardar y marcar en padrón"}
              </button>

              <div className="bg-muted/40 border border-border p-3 rounded flex items-center gap-2.5 text-[11px] text-muted-foreground leading-snug">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Esta acción actualizará o generará el documento en la colección Relevamientos vinculando la clave única de este ciudadano.</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
} 